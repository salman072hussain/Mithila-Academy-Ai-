import React from "react";
import { ArrowLeft, Mic, Send, X, AlertCircle, RefreshCw, Languages, Sparkles } from "lucide-react";
import { SupportedLanguage } from "../types";

interface VoiceListeningOverlayProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  language: SupportedLanguage;
  isAutoSearching?: boolean;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onStopAndSend: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

export const VoiceListeningOverlay: React.FC<VoiceListeningOverlayProps> = ({
  isListening,
  transcript,
  interimTranscript,
  error,
  language,
  isAutoSearching = false,
  onChangeLanguage,
  onStopAndSend,
  onCancel,
  onRetry,
}) => {
  if (!isListening && !error && !isAutoSearching) return null;

  const currentDisplay = transcript || interimTranscript || "";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
        {/* Top-Left Back button */}
        <button
          id="voice-back-btn"
          onClick={onCancel}
          className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95"
          title="Back to previous screen"
          aria-label="Back"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back</span>
        </button>

        {/* Close / Cancel button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          aria-label="Close voice modal"
        >
          <X className="w-5 h-5" />
        </button>

        {error ? (
          /* Error State */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
              Voice Input Notice
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Speak Again
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition"
              >
                Type Instead
              </button>
            </div>
          </div>
        ) : (
          /* Active Listening State */
          <div className="text-center py-2">
            {/* Pulsing Mic Circle */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 flex items-center justify-center">
              {/* Animated Ripple Waves */}
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-amber-500/30 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-amber-400/40">
                <Mic className="w-8 h-8 text-slate-950 animate-bounce" style={{ animationDuration: "1.2s" }} />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
              {isAutoSearching ? "Searching Question Automatically..." : "Listening to your question..."}
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {isAutoSearching
                ? "Speech recognized. Fetching explanation from Mithila Academy AI..."
                : "Speak freely. Your question will automatically search as soon as you finish."}
            </p>

            {/* Language Selector */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs mb-4">
              <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => onChangeLanguage("hi-IN")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  language === "hi-IN"
                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Hindi / Hinglish (हिंदी)
              </button>
              <button
                onClick={() => onChangeLanguage("en-IN")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  language === "en-IN" || language === "en-US"
                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>

            {/* Spoken Text Display Area */}
            <div className="min-h-[85px] max-h-36 overflow-y-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-left mb-4">
              {currentDisplay ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Spoken Query
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                      Auto-submits on pause
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    "{currentDisplay}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs sm:text-sm text-slate-400 italic">
                    Say e.g.: "What is photosynthesis?" or "Newton ka doosra niyam samjhao"
                  </p>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={onStopAndSend}
                disabled={!currentDisplay.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-500/20"
                title="Search immediately without waiting"
              >
                <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Search Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

