package com.sandeep.cyborg

import android.content.Context
import android.webkit.JavascriptInterface
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AndroidBridge(private val context: Context, private val actionManager: ActionManager) {

    /**
     * Called from Javascript: window.AndroidBridge.executeAction('OPEN_APP', 'com.whatsapp')
     */
    @JavascriptInterface
    fun executeAction(actionType: String, payload: String) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                actionManager.handleAction(actionType, payload)
            } catch (e: Exception) {
                e.printStackTrace()
                Toast.makeText(context, "Action failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
