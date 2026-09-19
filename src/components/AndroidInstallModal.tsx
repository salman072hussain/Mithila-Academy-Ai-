import React, { useState } from "react";
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { canInstall, isInstalled, installApp } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallNow = async () => {
    setIsInstalling(true);
    try {
      if (canInstall) {
        const outcome = await installApp();
        if (outcome === "accepted") {
          setInstallSuccess(true);
        }
      } else {
        // Direct attempt via browser prompt or APK trigger
        const outcome = await installApp();
        if (outcome === "accepted") {
          setInstallSuccess(true);
        }
      }
    } catch (err) {
      console.warn("Install prompt error:", err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div
      id="android-install-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        id="android-install-card"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Mithila Academy AI Branding */}
        <div className="relative p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white border-b border-amber-500/20">
          <button
            onClick={onClose}
            id="close-android-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-0.5 shadow-xl shadow-amber-500/25 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src="/pwa-192x192.png"
                  alt="Mithila Academy AI"
                  className="w-13 h-13 rounded-xl object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight truncate">
                  Mithila Academy AI
                </h3>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5 font-medium">
                Surendra Sir's Academic AI
              </p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Smartphone className="w-2.5 h-2.5" /> Android App
              </span>
            </div>
          </div>
        </div>

        {/* Clean & Simple Body: Ready to Install Card + Install Now Button */}
        <div className="p-6 space-y-5">
          {installSuccess || isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  App Installed on Android
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Mithila Academy AI is ready on your Android home screen!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-400/40 dark:border-amber-500/30 shadow-sm">
              <div className="mb-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Ready to Install
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Add to your Android home screen in 1-tap.
                </p>
              </div>

              <button
                onClick={handleInstallNow}
                id="direct-android-install-btn"
                disabled={isInstalling}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isInstalling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Installing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>Install Now</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
