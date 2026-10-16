package com.phishguard.ai.webview

import android.net.Uri
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import com.phishguard.ai.util.UrlPolicy

class AppWebChromeClient(
    private val onProgressUpdate: (Int) -> Unit,
    private val onCameraPermissionRequested: (PermissionRequest) -> Unit,
    private val onFileChooserRequested: (ValueCallback<Array<Uri>>?, FileChooserParams?) -> Boolean
) : WebChromeClient() {

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        onProgressUpdate(newProgress)
    }

    /**
     * Handles getUserMedia camera requests from the QR scanner in allowed hosts.
     */
    override fun onPermissionRequest(request: PermissionRequest?) {
        if (request == null) return

        val isVideoRequest = request.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
        val origin = request.origin.toString()

        // Strict security: only grant camera access to approved internal hosts
        if (isVideoRequest && UrlPolicy.isAllowedHost(origin)) {
            onCameraPermissionRequested(request)
        } else {
            request.deny()
        }
    }

    /**
     * Handles <input type="file"> dialogs for image uploads, documents, and QR uploads.
     */
    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        return onFileChooserRequested(filePathCallback, fileChooserParams)
    }
}
