package com.sandeep.cyborg

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import android.Manifest
import android.content.pm.PackageManager

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var actionManager: ActionManager

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        setContentView(webView)

        actionManager = ActionManager(this)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // Inject the Javascript bridge
        webView.addJavascriptInterface(AndroidBridge(this, actionManager), "AndroidBridge")

        // Load the web app URL (Replace with your actual local IP or Vercel URL)
        webView.loadUrl("http://10.0.2.2:3000") // 10.0.2.2 is localhost for Android Emulator

        checkPermissions()
    }

    fun sendToWeb(eventName: String, data: String) {
        runOnUiThread {
            webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('$eventName', {detail: '$data'}));", null)
        }
    }

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.READ_CONTACTS,
            Manifest.permission.RECORD_AUDIO
        )
        val needed = permissions.filter {
            ActivityCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), 100)
        }
    }
}
