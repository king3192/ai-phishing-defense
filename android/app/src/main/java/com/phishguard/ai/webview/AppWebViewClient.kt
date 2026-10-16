package com.phishguard.ai.webview

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.webkit.CookieManager
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import com.phishguard.ai.util.UrlPolicy

class AppWebViewClient(
    private val context: Context,
    private val onPageStart: () -> Unit,
    private val onPageFinish: (String?) -> Unit,
    private val onErrorReceived: (isSsl: Boolean, errorMsg: String) -> Unit
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url ?: return false
        val urlString = url.toString()

        // 1. Allowed in-app host: let WebView handle navigation
        if (UrlPolicy.isAllowedHost(urlString)) {
            return false
        }

        // 2. Special communications intent (tel:, mailto:, sms:, market:)
        if (UrlPolicy.isSpecialScheme(url)) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, url).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                // Ignore if no suitable app is installed
            }
            return true
        }

        // 3. External web link (e.g. suspicious scanned link): open in external browser
        // CRITICAL SECURITY: Never render external scanned URLs inside the privileged WebView
        try {
            val browserIntent = Intent(Intent.ACTION_VIEW, url).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(browserIntent)
        } catch (e: Exception) {
            // Fallback
        }
        return true
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        onPageStart()
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Inject blob download interceptor into DOM
        view?.evaluateJavascript(JsBridge.BLOB_INTERCEPTOR_SCRIPT, null)

        // Persist session cookies to disk
        CookieManager.getInstance().flush()

        onPageFinish(url)
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            val description = error?.description?.toString() ?: "Network error"
            onErrorReceived(false, description)
        }
    }

    override fun onReceivedHttpError(
        view: WebView?,
        request: WebResourceRequest?,
        errorResponse: WebResourceResponse?
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        if (request?.isForMainFrame == true && (errorResponse?.statusCode ?: 200) >= 400) {
            onErrorReceived(false, "Server response: ${errorResponse?.statusCode}")
        }
    }

    /**
     * Strict SSL Handling: Never proceed on SSL errors.
     */
    override fun onReceivedSslError(
        view: WebView?,
        handler: SslErrorHandler?,
        error: SslError?
    ) {
        handler?.cancel() // Strict security: Never call proceed()
        onErrorReceived(true, "SSL Certificate Error")
    }
}
