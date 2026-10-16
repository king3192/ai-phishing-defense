package com.phishguard.ai.util

import android.net.Uri
import com.phishguard.ai.BuildConfig

object UrlPolicy {

    /**
     * Set of trusted domain hostnames allowed to load inside the native WebView container.
     * Prevents scanned external phishing links from ever rendering within the trusted app context.
     */
    private val allowedHosts: Set<String> by lazy {
        val hosts = mutableSetOf<String>()
        // Add production & debug hosts from BuildConfig
        try {
            val prodUri = Uri.parse(BuildConfig.PROD_BASE_URL)
            prodUri.host?.let { hosts.add(it.lowercase()) }

            val debugUri = Uri.parse(BuildConfig.DEBUG_BASE_URL)
            debugUri.host?.let { hosts.add(it.lowercase()) }

            for (h in BuildConfig.ALLOWED_HOSTS) {
                hosts.add(h.lowercase())
            }
        } catch (e: Exception) {
            hosts.add("ai-phishing-defense.vercel.app")
            hosts.add("ai-phishing-defense.onrender.com")
            hosts.add("10.0.2.2")
            hosts.add("localhost")
        }
        hosts
    }

    /**
     * Determines whether a given URL belongs to an allowed host.
     */
    fun isAllowedHost(urlString: String?): Boolean {
        if (urlString.isNullOrBlank()) return false
        val uri = try {
            Uri.parse(urlString)
        } catch (e: Exception) {
            return false
        }

        val host = uri.host?.lowercase() ?: return false
        return allowedHosts.any { allowed ->
            host == allowed || host.endsWith(".$allowed")
        }
    }

    /**
     * Checks if the URI scheme represents an external communication action (tel, mailto, etc.).
     */
    fun isSpecialScheme(uri: Uri): Boolean {
        val scheme = uri.scheme?.lowercase() ?: return false
        return scheme in setOf("tel", "mailto", "sms", "whatsapp", "market", "intent")
    }

    /**
     * Returns the target URL to load based on the build type (Debug vs Release).
     */
    fun getTargetBaseUrl(): String {
        return if (BuildConfig.DEBUG) {
            // If running on an emulator or local Vite dev, you can use DEBUG_BASE_URL,
            // or the live PROD_BASE_URL
            BuildConfig.PROD_BASE_URL
        } else {
            BuildConfig.PROD_BASE_URL
        }
    }
}
