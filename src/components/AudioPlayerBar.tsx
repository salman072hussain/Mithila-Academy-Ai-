import React from "react";
import { Play, Pause, Square, Volume2, VolumeX, Sparkles, Gauge } from "lucide-react";
import { SpeechState, setPlaybackSpeed } from "../utils/speechSynthesis";

interface AudioPlayerBarProps {
  speechState: SpeechState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  autoSpeakEnabled: boolean;
  onToggleAutoSpeak: () => void;
  onSpeedChange?: (speed: number) => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  speechState,
  onPlay,
  onPause,
  onStop,
  autoSpeakEnabled,
  onToggleAutoSpeak,
  onSpeedChange,
}) => {
  const isPlaying = speechState.isSpeaking && !speechState.isPaused;
  const isPaused = speechState.isSpeaking && speechState.isPaused;
  const currentSpeed = speechState.playbackSpeed || 1.0;

  const handleSpeedSelect = (speed: number) => {
    if (onSpeedChange) {
      onSpeedChange(speed);
    } else {
      setPlaybackSpeed(speed);
    }
  };

  if (!speechState.isSpeaking && !isPaused) {
    // Show status chip with speed control, Auto-Read toggle and Play button if audio is available
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-amber-500/5 dark:bg-amber-400/5 border-b border-amber-200/40 dark:border-amber-900/30 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Voice Assistant:</span>
            <span className="font-semibold text-amber-700 dark:text-amber-400">Surendra Sir ki aawaz</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium hidden md:inline">
              Smooth HD
            </span>
          </div>

          {/* Speed Selector in Idle state */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1 hidden sm:inline">
                Speed:
              </span>
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedSelect(speed)}
                  id={`idle-speed-btn-${speed}x`}
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition ${
                    currentSpeed === speed
                      ? "bg-amber-500 text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                  title={`Set speech speed to ${speed}x`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {speechState.hasAudioAvailable && (
            <button
              onClick={onPlay}
              id="audio-player-replay-btn"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 transition active:scale-95 shadow-xs"
              title="Play complete answer from beginning"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play Answer</span>
            </button>
          )}

          <button
            onClick={onToggleAutoSpeak}
            id="toggle-auto-speak-btn"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition ${
              autoSpeakEnabled
                ? "text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
            title={autoSpeakEnabled ? "Auto-speak answers is enabled" : "Auto-speak answers is disabled"}
          >
            {autoSpeakEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span>{autoSpeakEnabled ? "Auto-Read On" : "Auto-Read Off"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-amber-950/60 backdrop-blur-md border-b border-amber-400/30 dark:border-amber-700/40 shadow-xs animate-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
              {isPlaying ? "Reading Answer Aloud" : "Audio Paused"}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-semibold hidden sm:inline-flex items-center gap-1"
              title={speechState.voiceName || "Surendra Sir Voice"}
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>Surendra Sir ki aawaz</span>
              <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/20 px-1 rounded-sm">
                Smooth
              </span>
            </span>
          </div>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
            {speechState.text.slice(0, 60)}...
          </p>
        </div>
      </div>

      {/* Speed & Controls: Speed selector, Play/Pause, Stop */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Speed Control Pill Group */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-amber-500/15 dark:bg-amber-950/80 border border-amber-400/30 dark:border-amber-800/50 shadow-xs">
          <div className="flex items-center gap-1 px-1.5 py-0.5 text-amber-900 dark:text-amber-300 font-semibold text-[10px] hidden md:flex">
            <Gauge className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Speed</span>
          </div>
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedSelect(speed)}
              id={`speed-btn-${speed}x`}
              className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all ${
                currentSpeed === speed
                  ? "bg-amber-500 text-slate-950 shadow-xs scale-102"
                  : "text-slate-700 dark:text-slate-300 hover:bg-amber-500/20"
              }`}
              title={`Set speaking speed to ${speed}x`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Play/Pause Button */}
        {isPlaying ? (
          <button
            onClick={onPause}
            id="audio-pause-btn"
            className="p-1.5 sm:px-3 sm:py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-xs"
            title="Pause voice"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline text-[11px]">Pause</span>
          </button>
        ) : (
          <button
            onClick={onPlay}
            id="audio-play-btn"
            className="p-1.5 sm:px-3 sm:py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-xs"
            title="Play / Resume voice"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline text-[11px]">Play</span>
          </button>
        )}

        {/* Stop Button */}
        <button
          onClick={onStop}
          id="audio-stop-btn"
          className="p-1.5 sm:px-3 sm:py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
          title="Stop voice"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline text-[11px]">Stop</span>
        </button>
      </div>
    </div>
  );
};
