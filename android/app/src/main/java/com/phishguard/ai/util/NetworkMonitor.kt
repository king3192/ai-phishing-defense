package com.phishguard.ai.util

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Handler
import android.os.Looper

class NetworkMonitor(context: Context, private val onNetworkChange: (Boolean) -> Unit) {

    private val connectivityManager =
        context.applicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private val mainHandler = Handler(Looper.getMainLooper())
    private var isRegistered = false

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            mainHandler.post {
                onNetworkChange(true)
            }
        }

        override fun onLost(network: Network) {
            mainHandler.post {
                // Double check if any other network is active before reporting offline
                onNetworkChange(isOnline())
            }
        }
    }

    fun start() {
        if (!isRegistered) {
            try {
                val request = NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    .build()
                connectivityManager.registerNetworkCallback(request, networkCallback)
                isRegistered = true
            } catch (e: Exception) {
                // Fallback for safety
            }
        }
    }

    fun stop() {
        if (isRegistered) {
            try {
                connectivityManager.unregisterNetworkCallback(networkCallback)
                isRegistered = false
            } catch (e: Exception) {
                // Ignore if already unregistered
            }
        }
    }

    fun isOnline(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }
}
