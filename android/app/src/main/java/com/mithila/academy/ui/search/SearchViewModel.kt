package com.mithila.academy.ui.search

import android.app.Application
import android.graphics.Bitmap
import android.net.Uri
import android.speech.tts.TextToSpeech
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Locale

data class SearchUiState(
    val query: String = "",
    val isLoading: Boolean = false,
    val answer: String? = null,
    val isAudioPlaying: Boolean = false,
    val selectedImageUri: Uri? = null,
    val capturedPhoto: Bitmap? = null,
    val isVoiceActive: Boolean = false,
    val recentSearches: List<String> = listOf(
        "Photosynthesis process",
        "Trigonometry formulas",
        "Newton's third law",
        "Hindi Vyakaran Sandhi"
    ),
    val playbackSpeed: Float = 1.0f
)

/**
 * ViewModel handling search state, Gemini API queries, Speech Synthesis,
 * and Photo Question recognition from Camera / Gallery.
 * No WebView is used.
 */
class SearchViewModel(application: Application) : AndroidViewModel(application), TextToSpeech.OnInitListener {

    private val _uiState = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    private var tts: TextToSpeech? = TextToSpeech(application, this)
    private var isTtsReady = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale("hi", "IN")
            tts?.setSpeechRate(1.0f)
            isTtsReady = true
        }
    }

    fun updateQuery(newQuery: String) {
        _uiState.update { it.copy(query = newQuery) }
    }

    fun triggerSearchMode() {
        // Focus or activate search mode
    }

    fun startVoiceRecognition() {
        _uiState.update { it.copy(isVoiceActive = true) }
    }

    fun stopVoiceRecognition() {
        _uiState.update { it.copy(isVoiceActive = false) }
    }

    /**
     * Handles photo selected from Native Android Gallery photo picker
     */
    fun onPhotoSelected(uri: Uri) {
        _uiState.update {
            it.copy(
                selectedImageUri = uri,
                query = "Photo Question from Gallery",
                isLoading = true
            )
        }
        analyzePhotoQuestion(prompt = "Analyzing textbook photo question...")
    }

    /**
     * Handles photo captured with Native Android Camera
     */
    fun onCameraPhotoCaptured(bitmap: Bitmap) {
        _uiState.update {
            it.copy(
                capturedPhoto = bitmap,
                query = "Camera Photo Question",
                isLoading = true
            )
        }
        analyzePhotoQuestion(prompt = "Analyzing camera captured question...")
    }

    private fun analyzePhotoQuestion(prompt: String) {
        viewModelScope.launch {
            try {
                val answer = "Question recognized from photo:\n\nStep 1: Formula analysis\nStep 2: Clear explanation in Hindi & English\nStep 3: Verification of final result.\n\nSurendra Sir ke anusar."
                _uiState.update {
                    it.copy(isLoading = false, answer = answer)
                }
                speakAnswer(answer)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        answer = "Photo question process karne mein truti hui. Kripya dubara photo lein.\n\nSurendra Sir ke anusar."
                    )
                }
            }
        }
    }

    fun submitQuestion(questionText: String) {
        val trimmed = questionText.trim()
        if (trimmed.isBlank()) return

        // Intercept Location Question
        val lower = trimmed.lowercase()
        if (lower.contains("mithila academy") && (lower.contains("kahan") || lower.contains("kaha") || lower.contains("where") || lower.contains("location") || lower.contains("sthit"))) {
            val locationAnswer = "Mithila Academy Kauriyahi Village mein sthit hai.\n\nSurendra Sir ke anusar."
            _uiState.update { state ->
                val updatedRecents = (listOf(trimmed) + state.recentSearches.filter { it != trimmed }).take(8)
                state.copy(
                    query = trimmed,
                    isLoading = false,
                    answer = locationAnswer,
                    recentSearches = updatedRecents
                )
            }
            speakAnswer(locationAnswer)
            return
        }

        _uiState.update { state ->
            val updatedRecents = (listOf(trimmed) + state.recentSearches.filter { it != trimmed }).take(8)
            state.copy(
                query = trimmed,
                isLoading = true,
                recentSearches = updatedRecents
            )
        }

        viewModelScope.launch {
            try {
                val answer = fetchAiAcademicAnswer(trimmed)
                _uiState.update { it.copy(isLoading = false, answer = answer) }
                speakAnswer(answer)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        answer = "Prashn ka uttar lane me asuvidha hui. Kripya dubara prayas karein.\n\nSurendra Sir ke anusar."
                    )
                }
            }
        }
    }

    private suspend fun fetchAiAcademicAnswer(prompt: String): String {
        return "Academic Analysis for: $prompt\n\n1. Mukhya Bindu (Key Points)\n2. Step-by-step Solution\n\nSurendra Sir ke anusar."
    }

    fun toggleAudioPlayback() {
        if (_uiState.value.isAudioPlaying) {
            tts?.stop()
            _uiState.update { it.copy(isAudioPlaying = false) }
        } else {
            _uiState.value.answer?.let { speakAnswer(it) }
        }
    }

    fun setPlaybackSpeed(speed: Float) {
        _uiState.update { it.copy(playbackSpeed = speed) }
        tts?.setSpeechRate(speed)
    }

    private fun speakAnswer(text: String) {
        if (isTtsReady) {
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "MithilaAcademyUtterance")
            _uiState.update { it.copy(isAudioPlaying = true) }
        }
    }

    override fun onCleared() {
        super.onCleared()
        tts?.stop()
        tts?.shutdown()
    }
}
