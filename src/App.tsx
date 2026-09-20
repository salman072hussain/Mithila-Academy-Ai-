import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { AudioPlayerBar } from "./components/AudioPlayerBar";
import { MessageItem } from "./components/MessageItem";
import { HomeSearchBar } from "./components/HomeSearchBar";
import { VoiceListeningOverlay } from "./components/VoiceListeningOverlay";
import { ChatHistoryModal } from "./components/ChatHistoryModal";
import { AndroidBanner } from "./components/AndroidBanner";
import { SettingsModal } from "./components/SettingsModal";
import { ChatMessage, ChatSession, SupportedLanguage } from "./types";
import { useKeyboardAwareness } from "./hooks/useKeyboardAwareness";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { useApkDownload } from "./hooks/useApkDownload";
import { speechManager } from "./utils/speechRecognition";
import {
  speakAnswer,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  setPlaybackSpeed,
  subscribeSpeechState,
  SpeechState,
} from "./utils/speechSynthesis";
import {
  AlertCircle,
  RefreshCw,
  BookOpen,
  Sparkles,
  WifiOff,
  MapPin,
  Calculator,
  FlaskConical,
  Globe,
  PenTool,
  ArrowRight,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Download,
  Smartphone,
} from "lucide-react";
import { isMithilaLocationQuery, getOfflineAnswer } from "./utils/offlineKnowledge";
import { SUBJECT_CATEGORIES } from "./data/sampleQuestions";

const SESSIONS_STORAGE_KEY = "mithila_academy_sessions_v1";
const THEME_STORAGE_KEY = "mithila_academy_theme";
const AUTO_SPEAK_STORAGE_KEY = "mithila_academy_auto_speak";
const OFFLINE_MODE_STORAGE_KEY = "mithila_offline_mode";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { keyboardHeight, isKeyboardOpen, scrollToFocusedElement, searchContainerRef } = useKeyboardAwareness();
  const { canInstall, isInstalled, installApp } = usePWAInstall();
  const { isConfigured: isApkConfigured, downloadApk } = useApkDownload();
  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(OFFLINE_MODE_STORAGE_KEY) === "true";
    }
    return false;
  });

  // Audio Playback & Auto-read state
  const [speechState, setSpeechState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    messageId: null,
    text: "",
    hasAudioAvailable: false,
    playbackSpeed: 1.0,
  });

  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(AUTO_SPEAK_STORAGE_KEY);
      return saved !== "false"; // Default true as requested
    }
    return true;
  });

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isAutoSearching, setIsAutoSearching] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceInterim, setVoiceInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceLanguage, setVoiceLanguage] = useState<SupportedLanguage>("hi-IN");

  // Prevent duplicate submissions
  const isSubmittingRef = useRef<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Navigation state tracking for Android back and screen transitions
  const isHistoryOpenRef = useRef(isHistoryOpen);
  const isSettingsModalOpenRef = useRef(isSettingsModalOpen);
  const isListeningRef = useRef(isListening);
  const messagesRef = useRef(messages);
  const activeSessionIdRef = useRef(activeSessionId);

  useEffect(() => {
    isHistoryOpenRef.current = isHistoryOpen;
  }, [isHistoryOpen]);
  useEffect(() => {
    isSettingsModalOpenRef.current = isSettingsModalOpen;
  }, [isSettingsModalOpen]);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Android back navigation support via popstate
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Establish base home state if not already set
    if (!window.history.state || window.history.state.screen !== "home") {
      window.history.replaceState({ screen: "home" }, "", window.location.href);
    }

    const handlePopState = () => {
      // 1. If Settings modal is open, Android back closes it
      if (isSettingsModalOpenRef.current) {
        setIsSettingsModalOpen(false);
        return;
      }
      // 2. If history modal is open, Android back closes it
      if (isHistoryOpenRef.current) {
        setIsHistoryOpen(false);
        return;
      }
      // 3. If voice overlay is open, Android back closes it
      if (isListeningRef.current) {
        speechManager.abort();
        setIsListening(false);
        setIsAutoSearching(false);
        setVoiceError(null);
        setVoiceTranscript("");
        setVoiceInterim("");
        return;
      }
      // 6. If in active chat conversation, Android back returns to home screen
      if (messagesRef.current.length > 0) {
        stopSpeaking();
        if (activeSessionIdRef.current) {
          updateActiveSessionInList(messagesRef.current);
        }
        setMessages([]);
        setActiveSessionId(null);
        setInput("");
        setErrorBanner(null);
        return;
      }
      // 7. On main/home screen: safe no-op so app never breaks
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== null) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Initialize theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    }
  }, [darkMode]);

  // Subscribe to speech synthesis state
  useEffect(() => {
    const unsubscribe = subscribeSpeechState((state) => {
      setSpeechState(state);
    });
    return unsubscribe;
  }, []);

  // Save auto-speak preference
  const handleToggleAutoSpeak = () => {
    setAutoSpeakEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
      }
      try {
        localStorage.setItem(AUTO_SPEAK_STORAGE_KEY, String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSessions(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to load sessions from storage:", err);
    }
  }, []);

  // Save sessions helper
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to persist sessions:", err);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Update or create active session in storage
  const updateActiveSessionInList = (currentMessages: ChatMessage[]) => {
    if (currentMessages.length === 0) return;

    const firstUserMsg = currentMessages.find((m) => m.role === "user");
    const title = firstUserMsg
      ? firstUserMsg.text.slice(0, 48) + (firstUserMsg.text.length > 48 ? "..." : "")
      : "Academic Question";
    const lastAssistantMsg = [...currentMessages].reverse().find((m) => m.role === "assistant");
    const preview = lastAssistantMsg
      ? lastAssistantMsg.text.slice(0, 100) + "..."
      : "Solution in progress...";

    const sessionId = activeSessionId || `session_${Date.now()}`;

    setSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === sessionId);
      const updatedSession: ChatSession = {
        id: sessionId,
        title,
        preview,
        createdAt: existingIdx >= 0 ? prev[existingIdx].createdAt : Date.now(),
        updatedAt: Date.now(),
        messages: currentMessages,
      };

      let newSessions: ChatSession[];
      if (existingIdx >= 0) {
        newSessions = [...prev];
        newSessions[existingIdx] = updatedSession;
      } else {
        newSessions = [updatedSession, ...prev];
      }

      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
      } catch (e) {
        console.warn(e);
      }

      return newSessions;
    });

    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }
  };

  // Handle New Question / New Chat
  const handleNewQuestion = () => {
    stopSpeaking();
    speechManager.stop();
    setIsListening(false);
    setIsAutoSearching(false);
    setVoiceError(null);
    setErrorBanner(null);

    if (messages.length > 0 && activeSessionId) {
      updateActiveSessionInList(messages);
    }

    setMessages([]);
    setActiveSessionId(null);
    setInput("");
  };

  // Primary question processing pipeline (Fast streaming + auto-speak)
  const handleSend = async (questionText?: string, isVoice = false, imageParam?: string | null) => {
    const textToSend = (questionText ?? input).trim();
    const effectiveImage = imageParam !== undefined ? imageParam : selectedImage;

    if ((!textToSend && !effectiveImage) || isSubmittingRef.current) return;

    // Prevent re-entry / duplicate calls
    isSubmittingRef.current = true;
    setErrorBanner(null);
    setIsAutoSearching(false);
    setIsListening(false);

    // Stop existing audio before generating new answer
    stopSpeaking();

    // Check if retrying identical last user message
    const lastMsg = messages[messages.length - 1];
    const isRetry = lastMsg && lastMsg.role === "user" && lastMsg.text === (textToSend || "Photo Question");

    let updatedMessages = messages;
    if (!isRetry) {
      const userMessage: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        role: "user",
        text: textToSend || "Photo Question",
        timestamp: Date.now(),
        isVoice,
        image: effectiveImage || undefined,
      };
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
    }

    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    const currentSessionId = activeSessionId || `session_${Date.now()}`;
    if (!activeSessionId) {
      setActiveSessionId(currentSessionId);
    }

    if (typeof window !== "undefined" && window.history.state?.screen !== "chat") {
      window.history.pushState({ screen: "chat", id: currentSessionId }, "", window.location.href);
    }

    // Prepare assistant message ID
    const assistantMsgId = `msg_a_${Date.now()}`;

    // Instant check 1: Mithila Academy Location requirement
    if (isMithilaLocationQuery(textToSend)) {
      const locationAnswer = "Mithila Academy Kauriyahi Village mein sthit hai.\n\nSurendra Sir ke anusar.";
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        text: locationAnswer,
        timestamp: Date.now(),
      };
      const finalMsgs = [...updatedMessages, assistantMessage];
      setMessages(finalMsgs);
      setIsLoading(false);
      isSubmittingRef.current = false;
      updateActiveSessionInList(finalMsgs);

      if (autoSpeakEnabled) {
        speakAnswer(locationAnswer, {
          messageId: assistantMsgId,
        });
      }
      return;
    }

    // Instant check 2: Offline Mode active or navigator offline
    if (offlineMode || (typeof navigator !== "undefined" && !navigator.onLine)) {
      const offlineAnswer = getOfflineAnswer(textToSend);
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        text: offlineAnswer,
        timestamp: Date.now(),
      };
      const finalMsgs = [...updatedMessages, assistantMessage];
      setMessages(finalMsgs);
      setIsLoading(false);
      isSubmittingRef.current = false;
      updateActiveSessionInList(finalMsgs);

      if (autoSpeakEnabled) {
        speakAnswer(offlineAnswer, {
          messageId: assistantMsgId,
        });
      }
      return;
    }

    try {
      // 1. Attempt ultra-fast SSE streaming first
      let streamSucceeded = false;
      let streamedAnswer = "";

      try {
        const streamResponse = await fetch("/api/ask-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: textToSend,
            image: effectiveImage || undefined,
            conversationHistory: updatedMessages.slice(0, -1).map((m) => ({
              role: m.role,
              text: m.text,
            })),
          }),
        });

        if (streamResponse.ok && streamResponse.body) {
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let doneReading = false;
          let buffer = "";

          // Create temporary message for live streaming updates
          const initialAssistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: "assistant",
            text: "",
            timestamp: Date.now(),
          };
          setMessages([...updatedMessages, initialAssistantMsg]);

          while (!doneReading) {
            const { value, done } = await reader.read();
            if (done) {
              doneReading = true;
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data:")) {
                try {
                  const eventData = JSON.parse(trimmed.slice(5).trim());
                  if (eventData.type === "chunk" && eventData.text) {
                    streamedAnswer += eventData.text;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMsgId ? { ...m, text: streamedAnswer } : m
                      )
                    );
                    streamSucceeded = true;
                  } else if (eventData.type === "done" && eventData.answer) {
                    streamedAnswer = eventData.answer;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMsgId ? { ...m, text: streamedAnswer } : m
                      )
                    );
                    streamSucceeded = true;
                  }
                } catch {
                  // ignore JSON parse chunk errors
                }
              }
            }
          }
        }
      } catch (streamErr) {
        console.warn("Streaming attempt encountered issue, falling back to standard API:", streamErr);
      }

      let finalizedText = streamedAnswer;

      // 2. Fallback to standard endpoint if stream wasn't able to complete
      if (!streamSucceeded || !finalizedText.trim()) {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: textToSend,
            image: effectiveImage || undefined,
            conversationHistory: updatedMessages.slice(0, -1).map((m) => ({
              role: m.role,
              text: m.text,
            })),
          }),
        });

        let data: any = null;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          await response.text();
          throw new Error("AI server connection reset. Kripya 'Retry' dabayein.");
        }

        if (!response.ok) {
          throw new Error(data?.error || "Failed to receive answer from Mithila Academy AI.");
        }

        finalizedText = data.answer;
        const assistantMessage: ChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          text: finalizedText,
          timestamp: data.timestamp || Date.now(),
        };

        // Remove any partial stream placeholder and put finalized answer
        setMessages([...updatedMessages, assistantMessage]);
      }

      setErrorBanner(null);

      // Save complete session
      const finalMsgList: ChatMessage[] = [
        ...updatedMessages,
        {
          id: assistantMsgId,
          role: "assistant",
          text: finalizedText,
          timestamp: Date.now(),
        },
      ];

      const firstUser = finalMsgList.find((m) => m.role === "user");
      const title = firstUser
        ? firstUser.text.slice(0, 48) + (firstUser.text.length > 48 ? "..." : "")
        : "Academic Question";
      const preview = finalizedText.slice(0, 100) + "...";

      setSessions((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === currentSessionId);
        const updatedSession: ChatSession = {
          id: currentSessionId,
          title,
          preview,
          createdAt: existingIdx >= 0 ? prev[existingIdx].createdAt : Date.now(),
          updatedAt: Date.now(),
          messages: finalMsgList,
        };

        let newSessions: ChatSession[];
        if (existingIdx >= 0) {
          newSessions = [...prev];
          newSessions[existingIdx] = updatedSession;
        } else {
          newSessions = [updatedSession, ...prev];
        }

        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
        } catch (e) {
          console.warn(e);
        }

        return newSessions;
      });

      // REQUIREMENT 2: AI ANSWER MUST BE SPOKEN AUTOMATICALLY
      if (autoSpeakEnabled && finalizedText.trim()) {
        speakAnswer(finalizedText, {
          messageId: assistantMsgId,
        });
      }
    } catch (err: any) {
      console.error("Ask question error:", err);
      setErrorBanner(
        err.message || "Network error. Please check your connection and try again."
      );
      // If we had created a partial assistant message, clean it up
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId || m.text.trim().length > 0));
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // REQUIREMENT 1: VOICE QUESTION MUST AUTOMATICALLY SEARCH
  const handleStartVoice = () => {
    stopSpeaking();
    setVoiceError(null);
    setVoiceTranscript("");
    setVoiceInterim("");
    setIsAutoSearching(false);

    if (typeof window !== "undefined" && window.history.state?.screen !== "voice") {
      window.history.pushState({ screen: "voice" }, "", window.location.href);
    }

    speechManager.setLanguage(voiceLanguage);

    const started = speechManager.start(
      // onResult: live feedback
      (text, isFinal) => {
        if (isFinal) {
          setVoiceTranscript(text);
          setVoiceInterim("");
        } else {
          setVoiceInterim(text);
        }
      },
      // onAutoSubmit: automatically triggered when speaking pauses or finishes!
      (finalQuestion) => {
        setIsListening(false);
        setIsAutoSearching(true);
        handleSend(finalQuestion, true);
      },
      // onError
      (errorMsg) => {
        setVoiceError(errorMsg);
        setIsListening(false);
        setIsAutoSearching(false);
      },
      // onEnd
      (submitted) => {
        setIsListening(false);
        if (!submitted) {
          setIsAutoSearching(false);
        }
      },
      // onStart
      () => {
        setIsListening(true);
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  const handleStopAndSendVoice = () => {
    const existing = speechManager.stop();
    setIsListening(false);
    const spokenText = (voiceTranscript || voiceInterim || existing).trim();
    if (spokenText) {
      setIsAutoSearching(true);
      handleSend(spokenText, true);
    }
    setVoiceTranscript("");
    setVoiceInterim("");
  };

  const handleCancelVoice = () => {
    speechManager.abort();
    setIsListening(false);
    setIsAutoSearching(false);
    setVoiceError(null);
    setVoiceTranscript("");
    setVoiceInterim("");
    if (typeof window !== "undefined" && window.history.state?.screen === "voice") {
      window.history.back();
    }
  };

  const handleChangeVoiceLang = (lang: SupportedLanguage) => {
    setVoiceLanguage(lang);
    speechManager.setLanguage(lang);
    handleStartVoice();
  };

  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
    if (typeof window !== "undefined" && window.history.state?.screen !== "history") {
      window.history.pushState({ screen: "history" }, "", window.location.href);
    }
  };

  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
    if (typeof window !== "undefined" && window.history.state?.screen === "history") {
      window.history.back();
    }
  };

  // Select a past session from history
  const handleSelectSession = (session: ChatSession) => {
    stopSpeaking();
    setMessages(session.messages);
    setActiveSessionId(session.id);
    setErrorBanner(null);
    setIsHistoryOpen(false);
    if (typeof window !== "undefined" && window.history.state?.screen !== "chat") {
      window.history.pushState({ screen: "chat", id: session.id }, "", window.location.href);
    }
  };

  // Delete a session
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveSessions(updated);
    if (activeSessionId === sessionId) {
      setMessages([]);
      setActiveSessionId(null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    saveSessions([]);
    setMessages([]);
    setActiveSessionId(null);
  };

  const handleOpenSearch = () => {
    scrollToFocusedElement(searchContainerRef.current);
    const inputEl = document.getElementById("home-search-input") as HTMLInputElement | null;
    inputEl?.focus();
  };

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleInstallApp = async () => {
    if (canInstall) {
      await installApp();
    }
  };

  // Back button handler for top-left navigation
  const handleHeaderBack = () => {
    // If Settings modal is open, close it
    if (isSettingsModalOpen) {
      setIsSettingsModalOpen(false);
      return;
    }

    // If History modal is open, return to previous screen
    if (isHistoryOpen) {
      handleCloseHistory();
      return;
    }

    // If Voice overlay is open, return to previous screen
    if (isListening) {
      handleCancelVoice();
      return;
    }

    // If in secondary screen (Chat Conversation), return to previous screen (Home)
    if (messages.length > 0) {
      stopSpeaking();
      if (activeSessionId) {
        updateActiveSessionInList(messages);
      }
      setMessages([]);
      setActiveSessionId(null);
      setInput("");
      setErrorBanner(null);
      return;
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Android Install Announcement Banner */}
      <AndroidBanner />

      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onNewQuestion={handleNewQuestion}
        onOpenHistory={handleOpenHistory}
        historyCount={sessions.length}
        isAudioPlaying={speechState.isSpeaking && !speechState.isPaused}
        onStopAudio={stopSpeaking}
        onBack={handleHeaderBack}
        isSecondaryScreen={messages.length > 0}
        onInstallApp={handleInstallApp}
        canInstall={canInstall}
        isInstalled={isInstalled}
        onOpenSettings={handleOpenSettings}
        onDownloadApk={downloadApk}
        isApkConfigured={isApkConfigured}
      />

      {/* Offline Mode Active Indicator Banner */}
      {offlineMode && (
        <div
          id="offline-mode-indicator-bar"
          className="bg-amber-500/15 dark:bg-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Offline Mode Active • Local syllabus answers & formulas available</span>
          </span>
          <button
            onClick={() => {
              setOfflineMode(false);
              localStorage.setItem(OFFLINE_MODE_STORAGE_KEY, "false");
            }}
            className="underline font-bold text-[11px] hover:text-amber-950 dark:hover:text-white cursor-pointer"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* Audio Playback Control Bar */}
      <AudioPlayerBar
        speechState={speechState}
        onPlay={resumeSpeaking}
        onPause={pauseSpeaking}
        onStop={stopSpeaking}
        autoSpeakEnabled={autoSpeakEnabled}
        onToggleAutoSpeak={handleToggleAutoSpeak}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Main Home Screen Canvas */}
      <main
        ref={chatContainerRef}
        style={{
          paddingBottom: isKeyboardOpen ? `${keyboardHeight + 30}px` : "40px",
          transition: "padding-bottom 0.15s ease-out",
        }}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 max-w-4xl w-full mx-auto"
      >
        {/* Error Notification Banner */}
        {errorBanner && (
          <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="truncate">{errorBanner}</span>
            </div>
            <button
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                if (lastUserMsg) {
                  handleSend(lastUserMsg.text);
                }
              }}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* HOME SCREEN STRUCTURE:
            Mithila Academy AI header (already at top)
            ↓
            Ask Mithila Academy AI
            ↓
            LARGE GOOGLE-STYLE SEARCH BAR
            ↓
            Example question chips
            ↓
            AI answer area
        */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          {/* Academy Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mithila Academy AI • Surendra Sir</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Ask <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-400 dark:to-orange-400">Mithila Academy AI</span>
          </h1>

          {/* Subtitle description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-4 sm:mb-5 leading-relaxed">
            Your academic mentor. Type, speak, or take a photo of any question in{" "}
            <strong className="text-slate-900 dark:text-white font-semibold">Hindi, Hinglish, or English</strong>.
          </p>

          {/* PRIMARY GOOGLE-STYLE SEARCH BAR (ONE UNIFIED PROMINENT SEARCH BAR) */}
          <div ref={searchContainerRef} className="scroll-mt-4">
            <HomeSearchBar
              input={input}
              setInput={setInput}
              onSubmit={(question: string, image?: string) => {
                handleSend(question, false, image);
              }}
              onVoiceStart={handleStartVoice}
              isListening={isListening}
              isVoiceSupported={speechManager.isSupported()}
              isLoading={isLoading}
              onFocus={() => scrollToFocusedElement(searchContainerRef.current)}
            />
          </div>

          {/* EXAMPLE QUESTION CHIPS */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              type="button"
              id="chip-location-btn"
              onClick={() => handleSend("Mithila Academy kaha hai?")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition active:scale-95 shadow-xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Mithila Academy kaha hai?</span>
            </button>
            <button
              type="button"
              id="chip-photosynthesis-btn"
              onClick={() => handleSend("Photosynthesis kya hai?")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <span>Photosynthesis kya hai?</span>
            </button>
            <button
              type="button"
              id="chip-newton-btn"
              onClick={() => handleSend("Newton ka third law samjhao.")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <span>Newton ka third law samjhao.</span>
            </button>
            <button
              type="button"
              id="chip-math-btn"
              onClick={() => handleSend("12 × 15 kitna hota hai?")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <span>12 × 15 kitna hota hai?</span>
            </button>
          </div>
        </div>

        {/* AI ANSWER AREA */}
        <div id="ai-answer-area" className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            /* Academic Overview & Subjects when no questions yet */
            <div className="space-y-6 pt-2">
              {/* Academic Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto text-left text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium">Step-by-step Maths</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium">Science with formulas</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium">Hindi & English answers</span>
                </div>
              </div>

              {/* Real Android APK Download Card */}
              <div
                id="home-download-apk-card"
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Download className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Android APK (.apk)
                        </h4>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          v1.1.0
                        </span>
                      </div>
                      {isApkConfigured ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Download the real Android APK package directly to your device.
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                          APK download is not available yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isApkConfigured ? (
                      <button
                        type="button"
                        onClick={downloadApk}
                        id="home-download-apk-btn"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4 stroke-[2.5]" />
                        <span>Download APK</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        id="home-download-apk-btn"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-xs cursor-not-allowed opacity-75"
                        title="APK download is not available yet."
                      >
                        <Download className="w-4 h-4" />
                        <span>Download APK</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject Prompt Categories */}
              <div className="text-left mb-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center sm:text-left">
                  Explore by Subject • विषय चुनें
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBJECT_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 transition shadow-sm text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {getSubjectIcon(cat.iconName)}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-slate-400">({cat.hindiName})</span>
                        </div>
                      </div>

                      {/* Sample question from this category */}
                      <button
                        type="button"
                        onClick={() => handleSend(cat.examples[0])}
                        className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs text-slate-700 dark:text-slate-300 transition group flex items-center justify-between gap-1 cursor-pointer"
                      >
                        <span className="truncate">{cat.examples[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 flex-shrink-0 transition" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Conversation & Live AI Answers */
            <div className="space-y-4 pt-1">
              {/* Session Control Bar */}
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  <span>Mithila Academy Study Session • {messages.length} message{messages.length > 1 ? "s" : ""}</span>
                </div>
                <button
                  type="button"
                  onClick={handleNewQuestion}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Question</span>
                </button>
              </div>

              {/* Messages Thread */}
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}

              {/* Loading Indicator when Gemini AI is generating */}
              {isLoading && (
                <div className="flex gap-2.5 sm:gap-3.5 mb-6 animate-pulse">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-sm ring-2 ring-amber-500/20">
                    <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
                  </div>
                  <div className="flex-1 p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        Surendra Sir's AI is analyzing...
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2"></div>
                    </div>
                    <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 italic">
                      Fast academic explanation loading...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Voice Recognition Interactive Overlay */}
      <VoiceListeningOverlay
        isListening={isListening}
        isAutoSearching={isAutoSearching}
        transcript={voiceTranscript}
        interimTranscript={voiceInterim}
        error={voiceError}
        language={voiceLanguage}
        onChangeLanguage={handleChangeVoiceLang}
        onStopAndSend={handleStopAndSendVoice}
        onCancel={handleCancelVoice}
        onRetry={handleStartVoice}
      />

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={handleCloseHistory}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllHistory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        autoSpeakEnabled={autoSpeakEnabled}
        onToggleAutoSpeak={handleToggleAutoSpeak}
        playbackSpeed={speechState.playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        voiceLanguage={voiceLanguage}
        onChangeVoiceLanguage={handleChangeVoiceLang}
        onInstallApp={handleInstallApp}
        canInstall={canInstall}
        isInstalled={isInstalled}
        offlineMode={offlineMode}
        onToggleOfflineMode={() => {
          setOfflineMode((prev) => {
            const next = !prev;
            localStorage.setItem(OFFLINE_MODE_STORAGE_KEY, String(next));
            return next;
          });
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onClearHistory={handleClearAllHistory}
        onAskLocationQuestion={() => {
          setIsSettingsModalOpen(false);
          handleSend("Mithila Academy kahan sthit hai?");
        }}
      />
    </div>
  );
}
