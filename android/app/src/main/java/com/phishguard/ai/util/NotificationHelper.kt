package com.phishguard.ai.util

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.FileProvider
import com.phishguard.ai.MainActivity
import com.phishguard.ai.R
import java.io.File

object NotificationHelper {

    const val CHANNEL_HIGH_RISK_ALERTS = "high_risk_alerts"
    const val CHANNEL_DOWNLOADS = "report_downloads"

    private const val NOTIFICATION_ID_BASE = 2000

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. High Risk Threat Alerts Channel (Importance HIGH)
            val alertsChannel = NotificationChannel(
                CHANNEL_HIGH_RISK_ALERTS,
                context.getString(R.string.channel_alerts_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.channel_alerts_desc)
                enableLights(true)
                lightColor = context.getColor(R.color.threat_rose)
                enableVibration(true)
            }

            // 2. Report Downloads Channel (Importance DEFAULT)
            val downloadsChannel = NotificationChannel(
                CHANNEL_DOWNLOADS,
                context.getString(R.string.channel_downloads_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.channel_downloads_desc)
            }

            notificationManager.createNotificationChannel(alertsChannel)
            notificationManager.createNotificationChannel(downloadsChannel)
        }
    }

    /**
     * Shows a notification when a PDF/CSV audit report finishes downloading.
     * Prevents FileUriExposedException on Android 7.0+ (API 24+) by wrapping file: URIs with FileProvider.
     */
    fun showDownloadNotification(context: Context, filename: String, fileUri: Uri?, mimeType: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(
                    context,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
        }

        // Safeguard against FileUriExposedException on Android 7.0-9.0 (API 24-28)
        val safeUri: Uri? = if (fileUri != null && fileUri.scheme == "file") {
            try {
                val file = File(fileUri.path ?: "")
                FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    file
                )
            } catch (e: Exception) {
                fileUri
            }
        } else {
            fileUri
        }

        val openIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(safeUri, mimeType)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            (System.currentTimeMillis() % 10000).toInt(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_DOWNLOADS)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("Report Download Complete")
            .setContentText(filename)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()

        NotificationManagerCompat.from(context).notify((System.currentTimeMillis() % 10000).toInt(), notification)
    }

    /**
     * Shows a real-time push alert notification for detected high-risk phishing vectors.
     */
    fun showThreatAlertNotification(context: Context, title: String, message: String, scanId: String?) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ActivityCompat.checkSelfPermission(
                    context,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                return
            }
        }

        val launchIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            scanId?.let { putExtra("TARGET_SCAN_ID", it) }
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            (System.currentTimeMillis() % 10000).toInt(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_HIGH_RISK_ALERTS)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setColor(context.getColor(R.color.threat_rose))
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_BASE + (System.currentTimeMillis() % 1000).toInt(), notification)
    }
}
