package com.mithila.academy.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.widget.RemoteViews
import com.mithila.academy.MainActivity
import com.mithila.academy.R

/**
 * Real Android Home-Screen AppWidgetProvider for Mithila Academy AI.
 * Appears in the Android phone's Widgets list.
 * Supports Search, Voice, Camera, and Gallery 1-tap shortcuts without WebView.
 */
class MithilaAppWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_SEARCH = "com.mithila.academy.action.SEARCH"
        const val ACTION_VOICE = "com.mithila.academy.action.VOICE"
        const val ACTION_CAMERA = "com.mithila.academy.action.CAMERA"
        const val ACTION_GALLERY = "com.mithila.academy.action.GALLERY"

        /**
         * Helper to update all active Mithila Academy AI home screen widgets.
         */
        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, MithilaAppWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            val intent = Intent(context, MithilaAppWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, allWidgetIds)
            }
            context.sendBroadcast(intent)
        }
    }

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (widgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_mithila_search)

        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        // 1. Search Bar / Search Area Shortcut
        val searchIntent = Intent(context, MainActivity::class.java).apply {
            action = ACTION_SEARCH
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val searchPendingIntent = PendingIntent.getActivity(
            context,
            1001,
            searchIntent,
            flags
        )
        views.setOnClickPendingIntent(R.id.widget_search_bar_area, searchPendingIntent)
        views.setOnClickPendingIntent(R.id.widget_search_icon, searchPendingIntent)
        views.setOnClickPendingIntent(R.id.widget_search_hint, searchPendingIntent)

        // 2. Voice Question Shortcut
        val voiceIntent = Intent(context, MainActivity::class.java).apply {
            action = ACTION_VOICE
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val voicePendingIntent = PendingIntent.getActivity(
            context,
            1002,
            voiceIntent,
            flags
        )
        views.setOnClickPendingIntent(R.id.widget_btn_voice, voicePendingIntent)

        // 3. Camera Question Shortcut
        val cameraIntent = Intent(context, MainActivity::class.java).apply {
            action = ACTION_CAMERA
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val cameraPendingIntent = PendingIntent.getActivity(
            context,
            1003,
            cameraIntent,
            flags
        )
        views.setOnClickPendingIntent(R.id.widget_btn_camera, cameraPendingIntent)

        // 4. Gallery Question Shortcut
        val galleryIntent = Intent(context, MainActivity::class.java).apply {
            action = ACTION_GALLERY
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val galleryPendingIntent = PendingIntent.getActivity(
            context,
            1004,
            galleryIntent,
            flags
        )
        views.setOnClickPendingIntent(R.id.widget_btn_gallery, galleryPendingIntent)

        // Whole widget tap defaults to launching main screen
        val mainIntent = Intent(context, MainActivity::class.java).apply {
            action = Intent.ACTION_MAIN
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val mainPendingIntent = PendingIntent.getActivity(
            context,
            1000,
            mainIntent,
            flags
        )
        views.setOnClickPendingIntent(R.id.widget_root, mainPendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
    }
}
