import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  PlusCircle,
  History,
  Sun,
  Moon,
  VolumeX,
  GraduationCap,
  Smartphone,
  MoreVertical,
  Search,
  Settings,
} from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNewQuestion: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
  onBack: () => void;
  isSecondaryScreen: boolean;
  onOpenAndroidModal?: () => void;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onNewQuestion,
  onOpenHistory,
  historyCount,
  isAudioPlaying,
  onStopAudio,
  onBack,
  isSecondaryScreen,
  onOpenAndroidModal,
  onOpenSearch = () => {},
  onOpenSettings = () => {},
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dot menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left Section: Back button + Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Clearly visible Back button in top-left corner */}
          <button
            id="header-back-button"
            onClick={onBack}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-bold transition active:scale-95 flex-shrink-0 ${
              isSecondaryScreen
                ? "bg-amber-100/90 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 shadow-xs ring-1 ring-amber-400/40"
                : "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-700"
            }`}
            title={isSecondaryScreen ? "Back to Home Screen" : "Back"}
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline font-semibold">Back</span>
          </button>

          <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate font-sans">
                Mithila Academy AI
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                Study Assistant
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Surendra Sir's Academic AI
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio Playing Indicator / Stop button */}
          {isAudioPlaying && (
            <button
              id="header-stop-audio-btn"
              onClick={onStopAudio}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-medium animate-pulse"
              title="Stop speech"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Stop Audio</span>
            </button>
          )}

          {/* Quick Search Button in Header */}
          <button
            id="header-search-quick-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-semibold transition active:scale-95 shadow-xs"
            title="Open Dedicated Search Screen"
            aria-label="Search Question"
          >
            <Search className="w-4 h-4 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* New Question Button */}
          <button
            id="header-new-question-btn"
            onClick={onNewQuestion}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
            title="Start a new question"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>New Question</span>
          </button>

          {/* Chat History Button (Desktop) */}
          <button
            id="header-history-btn"
            onClick={onOpenHistory}
            className="hidden sm:flex relative p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition active:scale-95 items-center gap-1.5"
            title="View chat history"
            aria-label="Chat History"
          >
            <History className="w-4 h-4" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-full">
                {historyCount > 99 ? "99+" : historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleDarkMode}
            className="p-2 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* MANDATORY TOP-RIGHT 3-DOT OVERFLOW MENU */}
          <div className="relative" ref={menuRef}>
            <button
              id="header-3dot-menu-btn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`p-2 sm:p-2.5 rounded-xl border transition active:scale-95 ${
                isMenuOpen
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              }`}
              title="More options (3-dot menu)"
              aria-label="Open options menu"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-4 h-4 stroke-[2.3]" />
            </button>

            {/* 3-Dot Dropdown Menu */}
            {isMenuOpen && (
              <div
                id="header-3dot-dropdown"
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* 1. REQUIREMENT: SEARCH OPTION INSIDE 3-DOT MENU */}
                <button
                  id="menu-item-search"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 hover:bg-amber-500/15 flex items-center gap-2.5 transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">Search</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded font-semibold">
                        Native
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate">
                      Dedicated Google-style search
                    </p>
                  </div>
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                {/* 2. REQUIREMENT: SETTINGS OPTION */}
                <button
                  id="menu-item-settings"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings • सेटिंग्स</span>
                </button>

                {/* 3. New Question */}
                <button
                  id="menu-item-new-question"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onNewQuestion();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
                >
                  <PlusCircle className="w-4 h-4 text-amber-500" />
                  <span>New Question</span>
                </button>

                {/* 4. Chat History */}
                <button
                  id="menu-item-history"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenHistory();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>Chat History</span>
                  </div>
                  {historyCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-full">
                      {historyCount}
                    </span>
                  )}
                </button>

                {/* 5. Android App */}
                {onOpenAndroidModal && (
                  <button
                    id="menu-item-android-app"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAndroidModal();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>Install Android App</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

