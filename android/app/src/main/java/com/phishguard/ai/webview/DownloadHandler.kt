package com.phishguard.ai.webview

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.URLUtil
import android.widget.Toast
import com.phishguard.ai.R

class DownloadHandler(
    private val context: Context,
    private val onPermissionNeeded: (String, () -> Unit) -> Unit
) : DownloadListener {

    override fun onDownloadStart(
        url: String?,
        userAgent: String?,
        contentDisposition: String?,
        mimetype: String?,
        contentLength: Long
    ) {
        if (url == null) return

        val filename = URLUtil.guessFileName(url, contentDisposition, mimetype)
        startDownloadManager(url, userAgent, contentDisposition, mimetype, filename)
    }

    private fun startDownloadManager(
        url: String,
        userAgent: String?,
        contentDisposition: String?,
        mimetype: String?,
        filename: String
    ) {
        try {
            val request = DownloadManager.Request(Uri.parse(url)).apply {
                val cookie = CookieManager.getInstance().getCookie(url)
                if (cookie != null) {
                    addRequestHeader("Cookie", cookie)
                }
                if (userAgent != null) {
                    addRequestHeader("User-Agent", userAgent)
                }

                setDescription("Downloading $filename...")
                setTitle(filename)
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                mimetype?.let { setMimeType(it) }
            }

            val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)

            Toast.makeText(context, context.getString(R.string.download_started, filename), Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Download failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
