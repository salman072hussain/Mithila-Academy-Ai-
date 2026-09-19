import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Volume2,
  Sliders,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
  Code2,
  Copy,
  ChevronRight,
  GraduationCap,
  WifiOff,
  Wifi,
  Moon,
  Sun,
  Trash2,
  MapPin,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { SupportedLanguage } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  autoSpeakEnabled: boolean;
  onToggleAutoSpeak: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  voiceLanguage: SupportedLanguage;
  onChangeVoiceLanguage: (lang: SupportedLanguage) => void;
  onOpenAndroidModal: () => void;
  offlineMode: boolean;
  onToggleOfflineMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onClearHistory: () => void;
  onAskLocationQuestion: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  autoSpeakEnabled,
  onToggleAutoSpeak,
  playbackSpeed,
  onSpeedChange,
  voiceLanguage,
  onChangeVoiceLanguage,
  onOpenAndroidModal,
  offlineMode,
  onToggleOfflineMode,
  darkMode,
  onToggleDarkMode,
  onClearHistory,
  onAskLocationQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "compose">("general");
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);

  // Android hardware back navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenSearchClick = () => {
    onClose();
    onOpenSearch();
  };

  const handleClearHistoryClick = () => {
    onClearHistory();
    setHistoryCleared(true);
    setShowClearConfirm(false);
    setTimeout(() => setHistoryCleared(false), 3000);
  };

  const handleAskLocationClick = () => {
    onClose();
    onAskLocationQuestion();
  };

  const handleCopyCompose = () => {
    const code = `// Kotlin + Jetpack Compose Native SearchScreen & AppWidget
// 100% Native Jetpack Compose components. Zero WebView.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MithilaSearchScreen(
    viewModel: SearchViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    // Google-style rounded search bar
    Surface(
        shape = CircleShape,
        shadowElevation = 4.dp,
        modifier = Modifier.fillMaxWidth().height(52.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Search, contentDescription = "Search")
            TextField(
                value = uiState.query,
                onValueChange = { viewModel.updateQuery(it) },
                placeholder = { Text("Ask Mithila Academy AI...") },
                keyboardActions = KeyboardActions(onSearch = { viewModel.submitQuestion(uiState.query) })
            )
            IconButton(onClick = { viewModel.startVoiceRecognition() }) {
                Icon(Icons.Default.Mic, contentDescription = "Voice Search")
            }
        }
    }
}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Settings • सेटिंग्स
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mithila Academy AI Preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="settings-close-btn"
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-2 gap-4 text-xs font-semibold bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-2.5 border-b-2 transition ${
              activeTab === "general"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            General & Voice
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`pb-2.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "compose"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Kotlin + Compose Native
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {activeTab === "general" ? (
            <>
              {/* PRIMARY REQUIREMENT: SEARCH OPTION INSIDE SETTINGS */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                      <Search className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Search</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                          Google Style
                        </span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        Open the dedicated native Search screen
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenSearchClick}
                    id="settings-open-search-btn"
                    className="flex-shrink-0 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition shadow-sm active:scale-95"
                  >
                    <span>Open Search</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* OFFLINE MODE SETTING FEATURE */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      offlineMode
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {offlineMode ? (
                      <WifiOff className="w-5 h-5" />
                    ) : (
                      <Wifi className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Offline Mode (ऑफलाइन मोड)
                      </p>
                      {offlineMode && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Use cached academic answers & local reference offline
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={offlineMode}
                  onClick={onToggleOfflineMode}
                  id="settings-offline-toggle-btn"
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex-shrink-0 ${
                    offlineMode ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      offlineMode ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* MITHILA ACADEMY LOCATION PREDEFINED INFO */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Mithila Academy Location
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Kauriyahi Village mein sthit hai
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAskLocationClick}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex-shrink-0 active:scale-95"
                >
                  Ask Location
                </button>
              </div>

              {/* Dark / Light Theme Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      App Theme
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {darkMode ? "Dark Mode (रात का थीम)" : "Light Mode (दिन का थीम)"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  id="settings-theme-toggle-btn"
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  {darkMode ? "Switch to Light" : "Switch to Dark"}
                </button>
              </div>

              {/* Voice Assistant & Audio Controls */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Voice & Speech Settings</span>
                </h4>

                {/* Auto-read Aloud Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Auto-Read Aloud Answers
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      AI answers will automatically speak out in Surendra Sir's voice
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoSpeakEnabled}
                    onClick={onToggleAutoSpeak}
                    id="settings-auto-speak-toggle-btn"
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                      autoSpeakEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        autoSpeakEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Voice Playback Speed */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Voice Speed (Playback Rate)
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10">
                      {playbackSpeed}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => onSpeedChange(speed)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                          playbackSpeed === speed
                            ? "bg-amber-500 text-slate-950 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {speed}x {speed === 1.0 && "(Normal)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Voice Language */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block mb-2">
                    Voice Input & Output Language
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "hi-IN", label: "🇮🇳 Hindi (हिंदी)" },
                        { id: "en-IN", label: "🔤 Hinglish" },
                        { id: "en-US", label: "🇬🇧 English" },
                      ] as const
                    ).map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => onChangeVoiceLanguage(lang.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                          voiceLanguage === lang.id
                            ? "bg-amber-500 text-slate-950 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Study History */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Clear Question History
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Delete stored question sessions
                      </p>
                    </div>
                  </div>

                  {showClearConfirm ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleClearHistoryClick}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600"
                      >
                        Yes, Clear
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {historyCleared && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Question history cleared successfully!
                  </p>
                )}
              </div>

              {/* Android Native Install Trigger */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Install on Android Device
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standalone APK & 1-tap installation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAndroidModal();
                  }}
                  id="settings-install-app-btn"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs active:scale-95"
                >
                  Install App
                </button>
              </div>

              {/* Academic Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  All solutions adhere strictly to syllabus and conclude with <strong>"Surendra Sir ke anusar."</strong>
                </span>
              </div>
            </>
          ) : (
            /* KOTLIN + JETPACK COMPOSE ARCHITECTURE TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Native Kotlin + Jetpack Compose & Widget
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AppWidgetProvider & SearchScreen (Zero WebView)
                  </p>
                </div>
                <button
                  onClick={handleCopyCompose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Kotlin</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-64 border border-slate-800 leading-relaxed">
                <pre>{`// Kotlin + Jetpack Compose Native AppWidgetProvider
package com.mithila.academy.widget

class MithilaAppWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        // Registers real home screen widget with Search, Voice, Camera & Gallery shortcuts!
    }
}`}</pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  Native Jetpack Compose Architecture Highlights:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>Native <code>AppWidgetProvider</code> for genuine Android home-screen widget</li>
                  <li><code>androidx.compose.material3.SearchBar</code> rounded pill</li>
                  <li><code>android.speech.SpeechRecognizer</code> for automatic submission</li>
                  <li>Native Camera & Gallery contracts without WebView</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 text-xs text-slate-500">
          <span>Mithila Academy AI v2.0 • Surendra Sir</span>
          <button
            onClick={onClose}
            id="settings-done-footer-btn"
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:opacity-90 transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
