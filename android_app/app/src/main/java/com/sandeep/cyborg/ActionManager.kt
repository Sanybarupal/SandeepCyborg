package com.sandeep.cyborg

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraManager
import android.net.Uri
import android.provider.MediaStore
import android.widget.Toast
import android.media.AudioManager
import android.provider.Settings
import android.net.wifi.WifiManager
import android.bluetooth.BluetoothAdapter
import android.content.pm.PackageManager
import org.json.JSONArray
import org.json.JSONObject

class ActionManager(private val context: Context) {

    fun handleAction(actionType: String, payload: String) {
        when (actionType) {
            "OPEN_APP" -> openApp(payload)
            "CALL_PHONE" -> callPhone(payload)
            "OPEN_CAMERA" -> openCamera()
            "TOGGLE_FLASHLIGHT" -> toggleFlashlight(payload.toBoolean())
            "OPEN_MAPS" -> openMaps(payload)
            "VOLUME_ADJUST" -> adjustVolume(payload)
            "OPEN_GALLERY" -> openGallery()
            "OPEN_SETTINGS" -> openSettings()
            "READ_UNREAD_MESSAGES" -> readUnreadMessages()
            "REPLY_MESSAGE" -> replyMessage(payload)
            "TOGGLE_WIFI" -> toggleWiFi(payload.toBoolean())
            "TOGGLE_BLUETOOTH" -> toggleBluetooth(payload.toBoolean())
            else -> Toast.makeText(context, "Unknown action: $actionType", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openApp(packageName: String) {
        val pm = context.packageManager
        val intent = pm.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            context.startActivity(intent)
        } else {
            Toast.makeText(context, "App not installed: $packageName", Toast.LENGTH_SHORT).show()
        }
    }

    private fun callPhone(number: String) {
        val intent = Intent(Intent.ACTION_CALL)
        intent.data = Uri.parse("tel:$number")
        try {
            context.startActivity(intent)
        } catch (e: SecurityException) {
            Toast.makeText(context, "Call permission not granted", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openCamera() {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        context.startActivity(intent)
    }

    private fun toggleFlashlight(state: Boolean) {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = cameraManager.cameraIdList[0]
            cameraManager.setTorchMode(cameraId, state)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun openMaps(query: String) {
        val uri = Uri.parse("google.navigation:q=$query")
        val intent = Intent(Intent.ACTION_VIEW, uri)
        intent.setPackage("com.google.android.apps.maps")
        if (intent.resolveActivity(context.packageManager) != null) {
            context.startActivity(intent)
        } else {
            Toast.makeText(context, "Google Maps is not installed", Toast.LENGTH_SHORT).show()
        }
    }

    private fun adjustVolume(direction: String) {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        if (direction == "UP") {
            audioManager.adjustVolume(AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI)
        } else if (direction == "DOWN") {
            audioManager.adjustVolume(AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI)
        }
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_VIEW, android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        context.startActivity(intent)
    }

    private fun openSettings() {
        val intent = Intent(Settings.ACTION_SETTINGS)
        context.startActivity(intent)
    }

    private fun readUnreadMessages() {
        val messages = NotificationReaderService.unreadWhatsAppMessages
        val jsonArray = JSONArray()
        for ((_, data) in messages) {
            val jsonObj = JSONObject()
            jsonObj.put("sender", data.sender)
            jsonObj.put("message", data.message)
            jsonArray.put(jsonObj)
        }
        
        val result = jsonArray.toString()
        // We need to send this result back to the web view.
        // For simplicity, we can cast context to MainActivity if we want to call WebView, 
        // or we can pass it through a callback. 
        // A better approach is to return it synchronously to the bridge, 
        // but since executeAction is void, we'll fire a JS event.
        if (context is MainActivity) {
            context.sendToWeb("onUnreadMessages", result)
        }
    }

    private fun replyMessage(payload: String) {
        try {
            val json = JSONObject(payload)
            val name = json.getString("name").lowercase()
            val replyText = json.getString("msg")
            
            val messageData = NotificationReaderService.unreadWhatsAppMessages[name]
            if (messageData != null) {
                // Send reply
                val dummyService = NotificationReaderService()
                dummyService.sendReply(messageData, replyText)
                
                // Clear from unread
                NotificationReaderService.unreadWhatsAppMessages.remove(name)
            } else {
                Toast.makeText(context, "No unread message from $name", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun toggleWiFi(state: Boolean) {
        // Note: For Android 10+, this might not work directly without a settings panel intent
        val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        wifiManager.isWifiEnabled = state
        Toast.makeText(context, "Wi-Fi turned ${if(state) "ON" else "OFF"}", Toast.LENGTH_SHORT).show()
    }

    private fun toggleBluetooth(state: Boolean) {
        val bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        if (bluetoothAdapter != null) {
            if (state) {
                // Note: requires BLUETOOTH_CONNECT on Android 12+
                try {
                    bluetoothAdapter.enable()
                } catch (e: SecurityException) {}
            } else {
                try {
                    bluetoothAdapter.disable()
                } catch (e: SecurityException) {}
            }
            Toast.makeText(context, "Bluetooth turned ${if(state) "ON" else "OFF"}", Toast.LENGTH_SHORT).show()
        }
    }
}
