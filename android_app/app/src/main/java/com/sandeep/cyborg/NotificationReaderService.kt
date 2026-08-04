package com.sandeep.cyborg

import android.app.Notification
import android.app.RemoteInput
import android.content.Intent
import android.os.Bundle
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class NotificationReaderService : NotificationListenerService() {

    companion object {
        private const val TAG = "NotificationReader"
        
        // Map to store senderName -> Pair<Message, PendingIntent/Action for reply>
        val unreadWhatsAppMessages = mutableMapOf<String, WhatsAppMessageData>()
    }

    data class WhatsAppMessageData(
        val sender: String,
        val message: String,
        val action: Notification.Action?
    )

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        
        // We only care about WhatsApp for now
        if (packageName == "com.whatsapp" || packageName == "com.whatsapp.w4b") {
            val extras = sbn.notification.extras
            val title = extras.getString(Notification.EXTRA_TITLE) ?: return
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return
            
            // Skip group summary notifications
            if (text.contains("new messages") && !text.contains(":")) {
                return
            }

            Log.d(TAG, "WhatsApp Message from $title: $text")

            val replyAction = getQuickReplyAction(sbn.notification)
            
            unreadWhatsAppMessages[title.lowercase()] = WhatsAppMessageData(
                sender = title,
                message = text,
                action = replyAction
            )
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        if (packageName == "com.whatsapp" || packageName == "com.whatsapp.w4b") {
            val title = sbn.notification.extras.getString(Notification.EXTRA_TITLE)
            if (title != null) {
                unreadWhatsAppMessages.remove(title.lowercase())
            }
        }
    }

    private fun getQuickReplyAction(notification: Notification): Notification.Action? {
        var action: Notification.Action? = null
        if (notification.actions != null) {
            for (i in notification.actions.indices) {
                val a = notification.actions[i]
                if (a.remoteInputs != null) {
                    for (j in a.remoteInputs.indices) {
                        if (a.remoteInputs[j].resultKey != null) {
                            action = a
                            break
                        }
                    }
                }
            }
        }
        return action
    }

    /**
     * Helper method to send a reply via the extracted RemoteInput Action.
     */
    fun sendReply(messageData: WhatsAppMessageData, replyText: String) {
        val action = messageData.action ?: return
        val remoteInputs = action.remoteInputs ?: return
        
        val intent = Intent()
        val bundle = Bundle()
        
        for (remoteInput in remoteInputs) {
            bundle.putCharSequence(remoteInput.resultKey, replyText)
        }
        
        RemoteInput.addResultsToIntent(remoteInputs, intent, bundle)
        
        try {
            action.actionIntent.send(this, 0, intent)
            Log.d(TAG, "Reply sent to ${messageData.sender}: $replyText")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
