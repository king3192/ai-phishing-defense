package com.phishguard.ai.push

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.phishguard.ai.util.NotificationHelper

class AppFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed FCM registration token: $token")
        // Future enhancement: Send token to FastAPI backend (e.g. POST /api/v1/users/me/fcm-token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title
            ?: remoteMessage.data["title"]
            ?: "PhishGuard Threat Alert"

        val body = remoteMessage.notification?.body
            ?: remoteMessage.data["body"]
            ?: "A critical threat vector was detected on your account."

        val scanId = remoteMessage.data["scan_id"]

        NotificationHelper.showThreatAlertNotification(
            context = applicationContext,
            title = title,
            message = body,
            scanId = scanId
        )
    }

    companion object {
        private const val TAG = "PhishGuardFCM"
    }
}
