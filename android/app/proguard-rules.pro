# PhishGuard AI ProGuard & R8 Optimization Rules

# 1. Keep Javascript Interface methods and classes
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.phishguard.ai.webview.JsBridge { *; }

# 2. Keep WebView clients and WebChromeClients
-keepclassmembers class * extends android.webkit.WebViewClient {
    public *;
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public *;
}

# 3. Keep ViewBinding generated classes
-keep class com.phishguard.ai.databinding.** { *; }

# 4. Keep Firebase Cloud Messaging Service
-keep class com.phishguard.ai.push.AppFirebaseMessagingService { *; }
-dontwarn com.google.firebase.**

# 5. Keep AndroidX WebKit feature checks
-keep class androidx.webkit.** { *; }
-dontwarn androidx.webkit.**

# 6. Keep Kotlin Coroutines
-keepclassmembernames class kotlinx.coroutines.** {
    volatile <fields>;
}
