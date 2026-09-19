import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Mic,
  MicOff,
  X,
  Sparkles,
  History,
  BookOpen,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Calculator,
  FlaskConical,
  Globe,
  PenTool,
  Clock,
  ArrowRight,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { ChatMessage, SupportedLanguage } from "../types";
import { MessageItem } from "./MessageItem";
import { SUBJECT_CATEGORIES } from "../data/sampleQuestions";

interface SearchScreenProps {
  onBack: () => void;
  onSendQuery: (query: string, image?: string) => void;
  onStartVoice: () => void;
  onStopVoice?: () => void;
  isListening: boolean;
  isLoading: boolean;
  isVoiceSupported: boolean;
  voiceTranscript?: string;
  voiceInterim?: string;
  activeSessionMessages: ChatMessage[];
  voiceLanguage: SupportedLanguage;
  onChangeVoiceLanguage: (lang: SupportedLanguage) => void;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
}

const DEFAULT_RECENT_SEARCHES = [
  "Prakash sanshleshan (Photosynthesis) ki kriya samjhaiye",
  "Newton ke gati ke teeno niyam kya hain?",
  "Pythagoras theorem proof in Hindi",
  "Samas aur Sandhi me antar",
  "Chemical equation balancing step by step",
];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onBack,
  onSendQuery,
  onStartVoice,
  onStopVoice,
  isListening,
  isLoading,
  isVoiceSupported,
  voiceTranscript,
  voiceInterim,
  activeSessionMessages,
  voiceLanguage,
  onChangeVoiceLanguage,
  onStopAudio,
  isAudioPlaying,
}) => {
  const [query, setQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle native Camera/Gallery photo selection
  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Recent searches persisted in local storage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("mithila_recent_searches");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load recent searches:", e);
    }
    return DEFAULT_RECENT_SEARCHES;
  });

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Sync voice transcript into query input if available
  useEffect(() => {
    if (voiceTranscript) {
      setQuery(voiceTranscript);
    } else if (voiceInterim) {
      setQuery(voiceInterim);
    }
  }, [voiceTranscript, voiceInterim]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeSessionMessages, isLoading]);

  const handleSearchSubmit = (textToSubmit?: string) => {
    const finalQuery = (textToSubmit || query).trim();
    if ((!finalQuery && !selectedPhoto) || isLoading) return;

    // Persist to recent searches
    if (finalQuery) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== finalQuery.toLowerCase());
        const updated = [finalQuery, ...filtered].slice(0, 8);
        try {
          localStorage.setItem("mithila_recent_searches", JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      });
    }

    const photoToSend = selectedPhoto || undefined;
    setSelectedPhoto(null);
    onSendQuery(finalQuery, photoToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("mithila_recent_searches");
    } catch (e) {
      console.warn(e);
    }
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Calculator":
        return <Calculator className="w-4 h-4 text-blue-500" />;
      case "FlaskConical":
        return <FlaskConical className="w-4 h-4 text-emerald-500" />;
      case "BookOpen":
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case "Globe":
        return <Globe className="w-4 h-4 text-amber-500" />;
      case "PenTool":
        return <PenTool className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div
      id="mithila-search-screen"
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors"
    >
      {/* Top Bar with Google-style Rounded Search Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs px-3 sm:px-6 py-3">
        {/* Hidden native file inputs for Camera and Gallery */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          id="search-gallery-input"
          className="hidden"
          onChange={handlePhotoSelected}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          id="search-camera-input"
          className="hidden"
          onChange={handlePhotoSelected}
        />

        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          {/* Back Button (Returns to previous screen) */}
          <button
            onClick={onBack}
            id="search-screen-back-btn"
            className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition active:scale-95 flex-shrink-0"
            title="Back to Previous Screen"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* GOOGLE-STYLE ROUNDED SEARCH BAR */}
          <div className="flex-1 min-w-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="relative flex items-center h-12 sm:h-13 w-full rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-amber-500 dark:focus-within:border-amber-400 shadow-md hover:shadow-lg focus-within:shadow-xl transition-all duration-200 px-3 sm:px-4 gap-1.5 sm:gap-2"
            >
              {/* Left Search Icon */}
              <button
                type="submit"
                id="search-bar-submit-icon"
                disabled={isLoading}
                className="text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition flex-shrink-0"
                aria-label="Submit Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Text Input with Placeholder "Ask Mithila Academy AI..." */}
              <input
                ref={inputRef}
                type="text"
                id="search-screen-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Ask Mithila Academy AI..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Clear Query Button (when typing) */}
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition flex-shrink-0"
                  aria-label="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Gallery Icon */}
              <button
                type="button"
                id="search-bar-gallery-btn"
                onClick={() => galleryInputRef.current?.click()}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition active:scale-95 flex-shrink-0"
                title="Select photo from Gallery"
                aria-label="Gallery photo picker"
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Camera Icon */}
              <button
                type="button"
                id="search-bar-camera-btn"
                onClick={() => cameraInputRef.current?.click()}
                className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition active:scale-95 flex-shrink-0"
                title="Take a photo of question with Camera"
                aria-label="Camera question capture"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Right Microphone Voice Input Icon */}
              {isVoiceSupported && (
                <button
                  type="button"
                  id="search-bar-mic-btn"
                  onClick={isListening && onStopVoice ? onStopVoice : onStartVoice}
                  className={`p-1.5 sm:p-2 rounded-full transition active:scale-90 flex-shrink-0 ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                      : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  }`}
                  title={isListening ? "Stop Voice Input" : "Voice Search (Automatically submits when speech finishes)"}
                  aria-label="Voice Search"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  )}
                </button>
              )}

              {/* Enter / Send Action Icon */}
              <button
                type="submit"
                id="search-bar-enter-action"
                disabled={(!query.trim() && !selectedPhoto) || isLoading}
                className={`p-1.5 sm:p-2 rounded-full transition active:scale-95 flex-shrink-0 ${
                  (query.trim() || selectedPhoto) && !isLoading
                    ? "bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-xs"
                    : "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"
                }`}
                aria-label="Submit Question"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Photo Preview if attached in Search Screen */}
        {selectedPhoto && (
          <div className="max-w-4xl mx-auto mt-2.5 p-2 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-400/50 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                <img
                  src={selectedPhoto}
                  alt="Question Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Question Photo Attached
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                  AI will analyze this textbook / worksheet photo and solve it.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Language Toggle Bar */}
        <div className="max-w-4xl mx-auto mt-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
              Language:
            </span>
            {(
              [
                { id: "hi-IN", label: "🇮🇳 Hindi" },
                { id: "hinglish", label: "🔤 Hinglish" },
                { id: "en-IN", label: "🇬🇧 English" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                onClick={() => onChangeVoiceLanguage(lang.id)}
                className={`px-2.5 py-1 rounded-full font-bold transition text-[11px] ${
                  voiceLanguage === lang.id
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Voice auto-submits upon completion</span>
          </div>
        </div>
      </header>

      {/* Main Search Body */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 max-w-4xl w-full mx-auto"
      >
        {/* If there are conversation messages, show them! */}
        {activeSessionMessages.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Search Results & Explanation
                </h2>
              </div>

              {isAudioPlaying && (
                <button
                  onClick={onStopAudio}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold animate-pulse border border-rose-200 dark:border-rose-900"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Speech</span>
                </button>
              )}
            </div>

            {/* Conversation Messages Thread */}
            {activeSessionMessages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 mb-6 animate-pulse">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-sm">
                  <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
                </div>
                <div className="flex-1 p-4 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-2">
                    Surendra Sir's AI is formulating explanation...
                  </span>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* INITIAL STATE: RECENT SEARCHES, SUGGESTIONS & ACADEMIC CATEGORIES */
          <div className="space-y-6">
            {/* Listening Banner if Voice is Active */}
            {isListening && (
              <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-center animate-pulse">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500 text-white mb-2 shadow-md">
                  <Mic className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Listening... Kripya apna prashn bolein
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Speaking finish hote hi search automatic submit ho jayegi
                </p>
                {(voiceTranscript || voiceInterim) && (
                  <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold text-amber-900 dark:text-amber-200 max-w-md mx-auto">
                    "{voiceTranscript || voiceInterim}"
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Recent Searches • हाल के प्रश्न</span>
                  </h3>
                  <button
                    onClick={handleClearRecentSearches}
                    className="text-[11px] text-slate-400 hover:text-rose-500 transition font-medium"
                  >
                    Clear History
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(item);
                        handleSearchSubmit(item);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-xs text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-2xs group"
                    >
                      <Clock className="w-3 h-3 text-slate-400 group-hover:text-amber-500" />
                      <span className="truncate max-w-xs">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Academic Topics */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Popular Academic Prompts • लोकप्रिय विषय</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUBJECT_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getSubjectIcon(cat.iconName)}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {cat.name} ({cat.hindiName})
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {cat.examples.slice(0, 2).map((eg, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(eg);
                            handleSearchSubmit(eg);
                          }}
                          className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 text-xs text-slate-700 dark:text-slate-300 transition flex items-center justify-between gap-2 group"
                        >
                          <span className="truncate">{eg}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Tip Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-400/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Mic className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Voice Search with Auto-Submit
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                    Tap the mic icon in the search bar. Speaking finish hote hi uttar turant aayega.
                  </p>
                </div>
              </div>
              <button
                onClick={onStartVoice}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs active:scale-95 flex-shrink-0"
              >
                Try Voice
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
