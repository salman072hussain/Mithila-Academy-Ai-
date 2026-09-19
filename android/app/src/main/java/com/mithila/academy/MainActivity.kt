package com.mithila.academy

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import com.mithila.academy.ui.navigation.MithilaNavHost
import com.mithila.academy.ui.search.SearchViewModel
import com.mithila.academy.widget.MithilaAppWidgetProvider

/**
 * Native Android Activity for Mithila Academy AI.
 * Handles incoming Widget shortcuts (Search, Voice, Camera, Gallery)
 * and hosts the 100% Jetpack Compose Native UI without any WebView.
 */
class MainActivity : ComponentActivity() {

    private val searchViewModel: SearchViewModel by viewModels()

    // Native Android Photo Picker contract (No permissions needed on Android 13+)
    private val galleryPickerLauncher = registerForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        uri?.let {
            searchViewModel.onPhotoSelected(it)
        }
    }

    // Native Android Camera capture contract
    private val cameraCaptureLauncher = registerForActivityResult(
        ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        bitmap?.let {
            searchViewModel.onCameraPhotoCaptured(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        handleIncomingWidgetIntent(intent)

        setContent {
            val isDark = isSystemInDarkTheme()
            MaterialTheme(
                colorScheme = if (isDark) {
                    darkColorScheme(
                        primary = Color(0xFFF59E0B),
                        surface = Color(0xFF0F172A),
                        background = Color(0xFF020617)
                    )
                } else {
                    lightColorScheme(
                        primary = Color(0xFFD97706),
                        surface = Color(0xFFFFFFFF),
                        background = Color(0xFFF8FAFC)
                    )
                }
            ) {
                MithilaNavHost(
                    searchViewModel = searchViewModel,
                    onOpenNativeCamera = { cameraCaptureLauncher.launch(null) },
                    onOpenNativeGallery = {
                        galleryPickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                        )
                    }
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingWidgetIntent(intent)
    }

    /**
     * Responds to the 4 Home-Screen Widget Shortcuts:
     * - Search Shortcut: opens search mode
     * - Voice Shortcut: triggers native voice recognition
     * - Camera Shortcut: opens native camera to capture question
     * - Gallery Shortcut: opens native photo picker to select question photo
     */
    private fun handleIncomingWidgetIntent(intent: Intent?) {
        when (intent?.action) {
            MithilaAppWidgetProvider.ACTION_SEARCH -> {
                searchViewModel.triggerSearchMode()
            }
            MithilaAppWidgetProvider.ACTION_VOICE -> {
                searchViewModel.startVoiceRecognition()
            }
            MithilaAppWidgetProvider.ACTION_CAMERA -> {
                cameraCaptureLauncher.launch(null)
            }
            MithilaAppWidgetProvider.ACTION_GALLERY -> {
                galleryPickerLauncher.launch(
                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                )
            }
        }
    }
}
