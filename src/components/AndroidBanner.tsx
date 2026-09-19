import React, { useState, useEffect } from "react";
import { Smartphone, Download, X, RefreshCw } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface AndroidBannerProps {
  onOpenModal: () => void;
}

export const AndroidBanner: React.FC<AndroidBannerProps> = ({ onOpenModal }) => {
  const { canInstall, isInstalled, installApp, updateAvailable, updateApp } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = sessionStorage.getItem("mithila_android_banner_dismissed");
      if (isDismissed && !updateAvailable) {
        setDismissed(true);
      }
    }
  }, [updateAvailable]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mithila_android_banner_dismissed", "true");
    }
  };

  const handleInstall = async () => {
    if (canInstall) {
      await installApp();
    } else {
      onOpenModal();
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await updateApp();
    } catch (err) {
      console.warn("Update error:", err);
      window.location.reload();
    }
  };

  // If update is available, show high-priority update banner even if installed
  if (updateAvailable) {
    return (
      <div
        id="app-update-banner"
        className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white px-3 sm:px-4 py-2 border-b border-emerald-500/40 flex items-center justify-between gap-2 text-xs z-50 animate-in fade-in"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-emerald-300 truncate">
              New Version Available • Mithila Academy AI
            </p>
            <p className="text-[10px] text-slate-300 truncate hidden xs:block">
              A newer verified update is ready to apply.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleUpdate}
            id="banner-update-app-btn"
            disabled={updating}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${updating ? "animate-spin" : ""}`} />
            <span>{updating ? "Updating..." : "Update App"}</span>
          </button>
        </div>
      </div>
    );
  }

  // If already installed or dismissed, do not show install banner
  if (dismissed || isInstalled) return null;

  return (
    <div
      id="android-install-banner"
      className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white px-3 sm:px-4 py-2 border-b border-amber-500/30 flex items-center justify-between gap-2 text-xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 flex-shrink-0 shadow-xs">
          <Smartphone className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-amber-300 truncate">
            Install Mithila Academy AI on Android
          </p>
          <p className="text-[10px] text-slate-300 truncate hidden xs:block">
            Fast full-screen mobile app with voice search & offline cache
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleInstall}
          id="banner-install-app-btn"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition active:scale-95"
        >
          <Download className="w-3 h-3 stroke-[2.5]" />
          <span>{canInstall ? "Install App" : "Get App"}</span>
        </button>

        <button
          onClick={handleDismiss}
          id="banner-dismiss-btn"
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Dismiss Android banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
