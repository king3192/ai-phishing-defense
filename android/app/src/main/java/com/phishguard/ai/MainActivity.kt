package com.phishguard.ai

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.phishguard.ai.databinding.ActivityMainBinding
import com.phishguard.ai.util.NetworkMonitor
import com.phishguard.ai.util.NotificationHelper
import com.phishguard.ai.util.UrlPolicy
import com.phishguard.ai.webview.AppWebChromeClient
import com.phishguard.ai.webview.AppWebViewClient
import com.phishguard.ai.webview.DownloadHandler
import com.phishguard.ai.webview.JsBridge
import java.io.File
import java.io.IOException
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var networkMonitor: NetworkMonitor

    private var isAppLoaded = false
    private var backPressedTime = 0L

    // Camera & File Upload Callbacks
    private var pendingCameraPermissionRequest: PermissionRequest? = null
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    // Register Activity Results
    private val requestCameraPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                pendingCameraPermissionRequest?.grant(pendingCameraPermissionRequest?.resources)
            } else {
                pendingCameraPermissionRequest?.deny()
                showCameraPermissionDeniedDialog()
            }
            pendingCameraPermissionRequest = null
        }

    private val requestNotificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* Optional */ }

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (fileUploadCallback == null) return@registerForActivityResult

            var results: Array<Uri>? = null
            if (result.resultCode == RESULT_OK) {
                val data = result.data
                if (data != null && data.clipData != null) {
                    val clipData = data.clipData!!
                    results = Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                } else if (data?.data != null) {
                    results = arrayOf(data.data!!)
                } else if (cameraImageUri != null) {
                    results = arrayOf(cameraImageUri!!)
                }
            }

            fileUploadCallback?.onReceiveValue(results)
            fileUploadCallback = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. AndroidX SplashScreen initialization
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        // Keep splash on screen until page finishes loading (or max 2.5s fallback)
        splashScreen.setKeepOnScreenCondition { !isAppLoaded }
        Handler(Looper.getMainLooper()).postDelayed({ isAppLoaded = true }, 2500)

        // 2. Window & Edge-to-Edge Display
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Optional FLAG_SECURE toggle
        if (resources.getBoolean(R.bool.config_flag_secure_enabled)) {
            window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE)
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Apply safe-area system insets (status bar, gesture navigation bar, notches)
        ViewCompat.setOnApplyWindowInsetsListener(binding.rootContainer) { _, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            binding.progressBar.setPadding(0, systemBars.top, 0, 0)
            binding.rootContainer.setPadding(0, 0, 0, systemBars.bottom)
            insets
        }

        // 3. Initialize Notification Channels
        NotificationHelper.createNotificationChannels(this)
        requestNotificationPermission()

        // 4. Configure Swipe-to-Refresh
        setupSwipeRefresh()

        // 5. Configure Native WebView
        setupWebView()

        // 6. Network Connectivity Monitoring
        setupNetworkMonitor()

        // 7. Back Navigation Dispatcher
        setupBackDispatcher()

        // 8. Load Initial Content (Handling Deep Links or Share Intent)
        if (savedInstanceState == null) {
            handleIncomingIntent(intent)
        } else {
            binding.webView.restoreState(savedInstanceState)
        }
    }

    private fun setupWebView() {
        val webView = binding.webView
        val settings = webView.settings

        // JavaScript & Web Storage
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true

        // Viewport & Scaling
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.textZoom = 100
        settings.setSupportZoom(true)
        settings.builtInZoomControls = true
        settings.displayZoomControls = false

        // Media & Hardware
        settings.mediaPlaybackRequiresUserGesture = false
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // Security restrictions
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

        // Custom User Agent Suffix
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent ${BuildConfig.USER_AGENT_SUFFIX}"

        // Debugging toggle
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)

        // Cookie Manager Setup
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        // WebViewClient
        webView.webViewClient = AppWebViewClient(
            context = this,
            onPageStart = {
                binding.progressBar.visibility = View.VISIBLE
                hideErrorScreen()
            },
            onPageFinish = {
                isAppLoaded = true
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
            },
            onErrorReceived = { isSsl, errorMsg ->
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
                showErrorScreen(isSsl, errorMsg)
            }
        )

        // WebChromeClient (Progress, Camera, File Uploads)
        webView.webChromeClient = AppWebChromeClient(
            onProgressUpdate = { progress ->
                binding.progressBar.progress = progress
                if (progress >= 100) {
                    binding.progressBar.visibility = View.GONE
                }
            },
            onCameraPermissionRequested = { request ->
                handleCameraPermissionRequest(request)
            },
            onFileChooserRequested = { callback, params ->
                handleFileChooser(callback, params)
            }
        )

        // Download Listener
        webView.setDownloadListener(DownloadHandler(this))

        // JavaScript Bridge for Blob Downloads and Native Logout
        webView.addJavascriptInterface(JsBridge(this, webView), JsBridge.BRIDGE_NAME)
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setColorSchemeResources(R.color.accent_cyan, R.color.accent_blue)
        binding.swipeRefresh.setProgressBackgroundColorSchemeResource(R.color.card_navy)

        binding.swipeRefresh.setOnRefreshListener {
            if (networkMonitor.isOnline()) {
                binding.webView.reload()
            } else {
                binding.swipeRefresh.isRefreshing = false
                showErrorScreen(false, getString(R.string.error_offline_desc))
            }
        }

        // Only allow pull-to-refresh when WebView is at top to avoid interfering with scrollable lists
        // Uses setOnScrollChangeListener (API 23+) instead of ViewTreeObserver to prevent listener leaks
        binding.webView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            binding.swipeRefresh.isEnabled = (scrollY == 0)
        }
    }

    private fun setupNetworkMonitor() {
        networkMonitor = NetworkMonitor(this) { isConnected ->
            if (isConnected) {
                if (binding.layoutError.visibility == View.VISIBLE) {
                    hideErrorScreen()
                    binding.webView.reload()
                }
            } else {
                if (binding.webView.url == null || binding.webView.url == "about:blank") {
                    showErrorScreen(false, getString(R.string.error_offline_desc))
                }
            }
        }
        networkMonitor.start()

        binding.btnRetry.setOnClickListener {
            if (networkMonitor.isOnline()) {
                hideErrorScreen()
                val currentUrl = binding.webView.url
                if (currentUrl.isNullOrBlank() || currentUrl == "about:blank") {
                    binding.webView.loadUrl(UrlPolicy.getTargetBaseUrl())
                } else {
                    binding.webView.reload()
                }
            } else {
                Toast.makeText(this, R.string.error_offline_title, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupBackDispatcher() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    val currentTime = System.currentTimeMillis()
                    if (currentTime - backPressedTime < 2000) {
                        finish()
                    } else {
                        backPressedTime = currentTime
                        Toast.makeText(this@MainActivity, R.string.exit_toast, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        })
    }

    private fun handleIncomingIntent(intent: Intent?) {
        if (intent == null) {
            binding.webView.loadUrl(UrlPolicy.getTargetBaseUrl())
            return
        }

        val action = intent.action
        val type = intent.type

        // 1. Share Target Intent (ACTION_SEND)
        if (Intent.ACTION_SEND == action && type != null) {
            if ("text/plain" == type) {
                val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT) ?: ""
                handleSharedText(sharedText)
                return
            }
        }

        // 2. Push Notification Target Scan ID
        val targetScanId = intent.getStringExtra("TARGET_SCAN_ID")
        if (!targetScanId.isNullOrBlank()) {
            val targetUrl = "${UrlPolicy.getTargetBaseUrl()}scanner?scanId=$targetScanId"
            binding.webView.loadUrl(targetUrl)
            return
        }

        // 3. Deep Link App Link (ACTION_VIEW)
        val dataUri = intent.data
        if (Intent.ACTION_VIEW == action && dataUri != null) {
            val urlString = dataUri.toString()
            if (UrlPolicy.isAllowedHost(urlString)) {
                binding.webView.loadUrl(urlString)
                return
            }
        }

        // Default: Load root application
        binding.webView.loadUrl(UrlPolicy.getTargetBaseUrl())
    }

    private fun handleSharedText(sharedText: String) {
        val trimmed = sharedText.trim()
        val encoded = try {
            URLEncoder.encode(trimmed, "UTF-8")
        } catch (e: Exception) {
            trimmed
        }

        // Copy to clipboard for instant user access
        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        clipboard.setPrimaryClip(ClipData.newPlainText("PhishGuard Shared Threat", trimmed))
        Toast.makeText(this, R.string.share_text_copied, Toast.LENGTH_SHORT).show()

        // Route into web app scanner endpoint with prefilled payload
        val targetUrl = "${UrlPolicy.getTargetBaseUrl()}scan?shared=$encoded"
        binding.webView.loadUrl(targetUrl)
    }

    private fun handleCameraPermissionRequest(request: PermissionRequest) {
        pendingCameraPermissionRequest = request
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(request.resources)
            pendingCameraPermissionRequest = null
        } else {
            requestCameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun showCameraPermissionDeniedDialog() {
        AlertDialog.Builder(this)
            .setTitle(R.string.permission_camera_title)
            .setMessage(R.string.permission_camera_desc)
            .setPositiveButton(R.string.permission_camera_settings) { _, _ ->
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", packageName, null)
                }
                startActivity(intent)
            }
            .setNegativeButton(R.string.permission_camera_cancel, null)
            .show()
    }

    private fun handleFileChooser(
        callback: ValueCallback<Array<Uri>>?,
        params: WebChromeClient.FileChooserParams?
    ): Boolean {
        cameraImageUri = null
        fileUploadCallback?.onReceiveValue(null)
        fileUploadCallback = callback

        // Create camera photo capture intent
        val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        if (takePictureIntent.resolveActivity(packageManager) != null) {
            val photoFile = try {
                createImageFile()
            } catch (ex: IOException) {
                null
            }
            if (photoFile != null) {
                cameraImageUri = FileProvider.getUriForFile(
                    this,
                    "$packageName.fileprovider",
                    photoFile
                )
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
            }
        }

        // Create document / gallery picker intent
        val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "*/*"
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "text/csv", "application/pdf"))
            if (params?.mode == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
        }

        val intentArray: Array<Intent> = if (cameraImageUri != null) {
            arrayOf(takePictureIntent)
        } else {
            emptyArray()
        }

        val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
            putExtra(Intent.EXTRA_TITLE, "Select File or Capture QR Code")
            putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
        }

        fileChooserLauncher.launch(chooserIntent)
        return true
    }

    @Throws(IOException::class)
    private fun createImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("QR_CAPTURE_${timeStamp}_", ".jpg", storageDir)
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun showErrorScreen(isSsl: Boolean, message: String) {
        binding.swipeRefresh.visibility = View.GONE
        binding.layoutError.visibility = View.VISIBLE

        if (isSsl) {
            binding.tvErrorTitle.text = getString(R.string.error_ssl_title)
            binding.tvErrorDesc.text = getString(R.string.error_ssl_desc)
            binding.btnRetry.visibility = View.GONE
        } else {
            binding.tvErrorTitle.text = getString(R.string.error_offline_title)
            binding.tvErrorDesc.text = message.ifBlank { getString(R.string.error_offline_desc) }
            binding.btnRetry.visibility = View.VISIBLE
        }
    }

    private fun hideErrorScreen() {
        binding.layoutError.visibility = View.GONE
        binding.swipeRefresh.visibility = View.VISIBLE
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onStop() {
        super.onStop()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        super.onDestroy()
        networkMonitor.stop()
        binding.webView.destroy()
    }
}
