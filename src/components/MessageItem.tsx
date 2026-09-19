import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Copy,
  Check,
  Mic,
  Camera,
  Sparkles,
  BookOpenCheck,
  Share2,
} from "lucide-react";
import { ChatMessage } from "../types";
import {
  speakAnswer,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  subscribeSpeechState,
  getSpeechState,
  SpeechState,
} from "../utils/speechSynthesis";

interface MessageItemProps {
  message: ChatMessage;
  onAskFollowUp?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onAskFollowUp }) => {
  const [copied, setCopied] = useState(false);
  const [speechState, setSpeechState] = useState<SpeechState>(getSpeechState);

  useEffect(() => {
    const unsubscribe = subscribeSpeechState((state) => {
      setSpeechState(state);
    });
    return unsubscribe;
  }, []);

  const isUser = message.role === "user";
  const isThisMessageSpeaking =
    speechState.messageId === message.id && speechState.isSpeaking;
  const isThisMessagePlaying = isThisMessageSpeaking && !speechState.isPaused;
  const isThisMessagePaused = isThisMessageSpeaking && speechState.isPaused;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Copy failed:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mithila Academy AI Study Note",
          text: message.text,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleTogglePlay = () => {
    if (isThisMessagePlaying) {
      pauseSpeaking();
    } else if (isThisMessagePaused) {
      resumeSpeaking();
    } else {
      speakAnswer(message.text, { messageId: message.id });
    }
  };

  const handleStop = () => {
    stopSpeaking();
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="max-w-[90%] sm:max-w-[80%] flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span>Student</span>
            {message.isVoice && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                <Mic className="w-2.5 h-2.5" /> Voice
              </span>
            )}
            {message.image && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 text-[10px] font-semibold">
                <Camera className="w-2.5 h-2.5" /> Photo Question
              </span>
            )}
            <span>•</span>
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm text-sm sm:text-base leading-relaxed break-words space-y-2">
            {message.image && (
              <div className="rounded-xl overflow-hidden border border-white/20 max-w-xs shadow-inner">
                <img
                  src={message.image}
                  alt="Question Photo"
                  className="max-h-64 w-auto object-contain bg-black/40"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            {message.text && <div>{message.text}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  // Detect if the message has the mandatory signature "Surendra Sir ke anusar."
  const signaturePhrase = "Surendra Sir ke anusar.";
  const hasSignature = message.text.includes(signaturePhrase);
  
  let mainBody = message.text;
  if (hasSignature) {
    mainBody = message.text.replace(/Surendra\s+Sir\s+ke\s+anusar[\.!]*/gi, "").trim();
  }

  return (
    <div className="flex gap-2.5 sm:gap-3.5 mb-6 group">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-sm mt-1 ring-2 ring-amber-500/20">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
      </div>

      {/* Response Card */}
      <div className="flex-1 min-w-0">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Mithila Academy AI</span>
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
              •{" "}
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Action Bar with Play, Pause, Stop controls */}
          <div className="flex items-center gap-1 opacity-95 transition-opacity">
            {/* Play/Pause control */}
            <button
              onClick={handleTogglePlay}
              className={`p-1.5 px-2 rounded-lg text-xs flex items-center gap-1 transition ${
                isThisMessageSpeaking
                  ? "bg-amber-100 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-semibold"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
              title={
                isThisMessagePlaying
                  ? "Pause voice explanation"
                  : isThisMessagePaused
                  ? "Resume voice explanation"
                  : "Read aloud (Surendra Sir ki aawaz)"
              }
            >
              {isThisMessagePlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold">Pause</span>
                </>
              ) : isThisMessagePaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold">Resume</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Listen</span>
                </>
              )}
            </button>

            {/* Stop control if currently speaking */}
            {isThisMessageSpeaking && (
              <button
                onClick={handleStop}
                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Stop audio"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
              title="Copy answer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
              title="Share notes"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
          <div className="academic-markdown prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 space-y-3">
            <Markdown>{mainBody}</Markdown>
          </div>

          {/* Mandatory Signature Stamp (Feature #6 & #7) */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/30 text-amber-900 dark:text-amber-200">
              <BookOpenCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide font-serif">
                Surendra Sir ke anusar.
              </span>
            </div>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              Verified Academic Guidance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

