import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Conditionally apply Google Services plugin only if google-services.json is present
if (file("google-services.json").exists()) {
    apply(plugin = "com.google.gms.google-services")
}

android {
    namespace = "com.phishguard.ai"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.phishguard.ai"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Central Configuration Values
        buildConfigField("String", "APP_NAME", "\"PhishGuard AI\"")
        buildConfigField("String", "PROD_BASE_URL", "\"https://ai-phishing-defense.vercel.app/\"")
        buildConfigField("String", "DEBUG_BASE_URL", "\"http://10.0.2.2:5173/\"")
        buildConfigField("String", "USER_AGENT_SUFFIX", "\"PhishGuardAndroidApp/1.0\"")
        buildConfigField(
            "String[]",
            "ALLOWED_HOSTS",
            "new String[]{\"ai-phishing-defense.vercel.app\", \"ai-phishing-defense.onrender.com\", \"10.0.2.2\", \"localhost\"}"
        )
    }

    signingConfigs {
        create("release") {
            val localProps = Properties()
            val localPropsFile = rootProject.file("local.properties")
            if (localPropsFile.exists()) {
                localProps.load(FileInputStream(localPropsFile))
            }

            val storeFilePath = localProps.getProperty("RELEASE_STORE_FILE") ?: System.getenv("RELEASE_STORE_FILE")
            if (storeFilePath != null && file(storeFilePath).exists()) {
                storeFile = file(storeFilePath)
                storePassword = localProps.getProperty("RELEASE_STORE_PASSWORD") ?: System.getenv("RELEASE_STORE_PASSWORD")
                keyAlias = localProps.getProperty("RELEASE_KEY_ALIAS") ?: System.getenv("RELEASE_KEY_ALIAS")
                keyPassword = localProps.getProperty("RELEASE_KEY_PASSWORD") ?: System.getenv("RELEASE_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        debug {
            isDebuggable = true
            isMinifyEnabled = false
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            manifestPlaceholders["networkSecurityConfig"] = "@xml/network_security_config_debug"
        }
        release {
            isDebuggable = false
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            manifestPlaceholders["usesCleartextTraffic"] = "false"
            manifestPlaceholders["networkSecurityConfig"] = "@xml/network_security_config"

            val releaseSigning = signingConfigs.getByName("release")
            if (releaseSigning.storeFile != null && releaseSigning.storeFile!!.exists()) {
                signingConfig = releaseSigning
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    // AndroidX Core & UI
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.activity:activity-ktx:1.9.3")

    // Modern Splash Screen API
    implementation("androidx.core:core-splashscreen:1.0.1")

    // WebView & WebKit Integration
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")

    // Coroutines for background IO (downloads, bridge)
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // Optional Firebase Cloud Messaging (isolated; safe without google-services.json)
    implementation("com.google.firebase:firebase-messaging-ktx:24.1.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
