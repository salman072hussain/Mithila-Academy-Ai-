import React, { useState } from "react";
import {
  ArrowLeft,
  X,
  History,
  Trash2,
  MessageSquare,
  ChevronRight,
  Search,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { ChatSession } from "../types";

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Clearly visible Back button in top-left corner */}
            <button
              id="history-modal-back-btn"
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 flex-shrink-0"
              title="Back to previous screen"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>

            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                Study History • पिछले सवाल
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {sessions.length} {sessions.length === 1 ? "session" : "sessions"} saved locally
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {sessions.length > 0 && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        )}

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No question history yet</p>
              <p className="text-xs mt-1">
                Your asked academic questions and answers will appear here.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No matching questions found for "{searchTerm}".
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                    isActive
                      ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-400/50 dark:border-amber-700/50"
                      : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600/40"
                  }`}
                  onClick={() => {
                    onSelectSession(session);
                    onClose();
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {session.title}
                      </span>
                      {isActive && (
                        <span className="flex-shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {session.preview || "Academic question & solution..."}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.updatedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(session.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span>{session.messages.length} messages</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {sessions.length > 0 && (
          <div className="p-3 sm:px-5 sm:py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
            {showConfirmClear ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Clear all history?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClearAll();
                      setShowConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                  >
                    Yes, Clear
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-xs text-slate-400">
                  Data stored locally on your device
                </span>
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All History
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
