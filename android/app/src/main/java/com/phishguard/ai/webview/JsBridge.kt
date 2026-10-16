package com.phishguard.ai.webview

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.Base64
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import com.phishguard.ai.BuildConfig
import com.phishguard.ai.util.NotificationHelper
import com.phishguard.ai.util.UrlPolicy
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

class JsBridge(
    private val context: Context,
    private val webView: WebView
) {
    private val mainHandler = Handler(Looper.getMainLooper())
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    /**
     * Handles client-side blob: and data: URI downloads generated in JavaScript.
     * Encodes file data into MediaStore (Android 10+) or Downloads folder (legacy).
     */
    @JavascriptInterface
    fun downloadBlob(base64Data: String, mimeType: String, filename: String) {
        // Security: verify caller origin
        mainHandler.post {
            val currentUrl = webView.url
            if (!UrlPolicy.isAllowedHost(currentUrl)) {
                return@post
            }

            coroutineScope.launch {
                try {
                    val cleanBase64 = if (base64Data.contains(",")) {
                        base64Data.substringAfter(",")
                    } else {
                        base64Data
                    }
                    val fileBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
                    val safeFilename = if (filename.isNotBlank()) filename else "phishguard_report_${System.currentTimeMillis()}"

                    val savedUri = saveFileToDownloads(fileBytes, safeFilename, mimeType)

                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Report downloaded: $safeFilename", Toast.LENGTH_SHORT).show()
                        NotificationHelper.showDownloadNotification(context, safeFilename, savedUri, mimeType)
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Failed to save file: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun saveFileToDownloads(bytes: ByteArray, filename: String, mimeType: String): Uri? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val contentValues = ContentValues().apply {
                put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            }
            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            uri?.let {
                resolver.openOutputStream(it)?.use { stream ->
                    stream.write(bytes)
                }
            }
            uri
        } else {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = File(downloadsDir, filename)
            FileOutputStream(file).use { stream ->
                stream.write(bytes)
            }
            Uri.fromFile(file)
        }
    }

    /**
     * Called when the web application executes explicit logout.
     * Flushes all stored authentication cookies and session caches.
     */
    @JavascriptInterface
    fun onUserLogout() {
        mainHandler.post {
            try {
                val cookieManager = CookieManager.getInstance()
                cookieManager.removeAllCookies {
                    cookieManager.flush()
                }
                webView.clearCache(true)
                Toast.makeText(context, "Logged out securely", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                // Ignore
            }
        }
    }

    /**
     * Returns the native app version information safely.
     */
    @JavascriptInterface
    fun getAppVersion(): String {
        return BuildConfig.VERSION_NAME
    }

    companion object {
        const val BRIDGE_NAME = "PhishGuardBridge"

        /**
         * Injected JavaScript polyfill that redirects blob: downloads directly into PhishGuardBridge.
         */
        val BLOB_INTERCEPTOR_SCRIPT = """
            (function() {
                if (window.__phishguardBlobInjected) return;
                window.__phishguardBlobInjected = true;
                
                const originalClick = HTMLAnchorElement.prototype.click;
                HTMLAnchorElement.prototype.click = function() {
                    const href = this.href || '';
                    const download = this.download || 'downloaded_file';
                    
                    if (href.startsWith('blob:') || href.startsWith('data:')) {
                        fetch(href)
                            .then(res => {
                                const mimeType = res.headers.get('content-type') || 'application/octet-stream';
                                return res.blob().then(blob => ({ blob, mimeType }));
                            })
                            .then(({ blob, mimeType }) => {
                                const reader = new FileReader();
                                reader.onloadend = function() {
                                    if (window.PhishGuardBridge && window.PhishGuardBridge.downloadBlob) {
                                        window.PhishGuardBridge.downloadBlob(reader.result, mimeType, download);
                                    }
                                };
                                reader.readAsDataURL(blob);
                            })
                            .catch(err => console.error('Blob intercept error:', err));
                        return;
                    }
                    return originalClick.apply(this, arguments);
                };
            })();
        """.trimIndent()
    }
}
