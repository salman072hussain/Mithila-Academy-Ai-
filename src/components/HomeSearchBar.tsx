import React, { useRef, useState } from "react";
import {
  Search,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";

interface HomeSearchBarProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (question: string, image?: string) => void;
  onVoiceStart: () => void;
  isListening: boolean;
  isVoiceSupported: boolean;
  isLoading?: boolean;
  onFocus?: () => void;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  input,
  setInput,
  onSubmit,
  onVoiceStart,
  isListening,
  isVoiceSupported,
  isLoading = false,
  onFocus,
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedPhoto) && !isLoading) {
      const photoToSend = selectedPhoto || undefined;
      const questionToSend = input.trim();
      setSelectedPhoto(null);
      setInput("");
      onSubmit(questionToSend, photoToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div id="home-search-bar-wrapper" className="w-full max-w-2xl mx-auto mb-5 text-left">
      {/* Hidden file inputs for Gallery & Camera */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        id="home-gallery-input"
        className="hidden"
        onChange={handlePhotoSelected}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        id="home-camera-input"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      {/* Selected Photo Preview before submitting */}
      {selectedPhoto && (
        <div
          id="home-selected-photo-preview"
          className="mb-2.5 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/50 shadow-md flex items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-13 h-13 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
              <img
                src={selectedPhoto}
                alt="Selected Question Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Photo Question Attached
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                AI will solve this image. Add question details below if needed.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="home-remove-photo-btn"
            onClick={() => setSelectedPhoto(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            title="Remove photo"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Google-Style Pill Search Form */}
      <form
        onSubmit={handleFormSubmit}
        id="home-google-search-form"
        className="relative flex items-center rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus-within:border-amber-500 dark:focus-within:border-amber-400 shadow-md hover:shadow-lg focus-within:shadow-xl transition-all duration-200 pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 py-1.5"
      >
        {/* Left Search Icon */}
        <div className="text-amber-600 dark:text-amber-400 flex-shrink-0 mr-2 sm:mr-2.5">
          <Search className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          id="home-search-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          disabled={isLoading}
          placeholder={
            selectedPhoto
              ? "Prashn ke baare me kuch likhna chahein (Optional)..."
              : "Ask Mithila Academy AI..."
          }
          className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0 pr-2"
        />

        {/* Action Buttons Group: Gallery, Camera, Microphone, Send */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Gallery Icon */}
          <button
            type="button"
            id="home-gallery-btn"
            onClick={() => galleryInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition active:scale-95"
            title="Upload photo from Gallery"
            aria-label="Upload photo from Gallery"
          >
            <ImageIcon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          {/* Camera Icon */}
          <button
            type="button"
            id="home-camera-btn"
            onClick={() => cameraInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition active:scale-95"
            title="Take a photo with Camera"
            aria-label="Take a photo with Camera"
          >
            <Camera className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          {/* Microphone Icon */}
          {isVoiceSupported && (
            <button
              type="button"
              id="home-mic-btn"
              onClick={onVoiceStart}
              className={`p-2 sm:p-2.5 rounded-full transition active:scale-95 ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                  : "text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Speak question (Voice Search)"
              aria-label="Speak question"
            >
              {isListening ? (
                <MicOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              ) : (
                <Mic className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              )}
            </button>
          )}

          {/* Send / Arrow Button */}
          <button
            type="submit"
            id="home-send-btn"
            disabled={(!input.trim() && !selectedPhoto) || isLoading}
            className={`p-2.5 sm:p-3 rounded-full transition active:scale-95 flex items-center justify-center ${
              (input.trim() || selectedPhoto) && !isLoading
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            }`}
            title="Send question"
            aria-label="Send question"
          >
            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Clear Guidance Tag under Search Bar */}
      <div className="mt-2 px-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="truncate flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Camera, Gallery, Voice or Text • Answers end with "Surendra Sir ke anusar."
        </span>
        <span className="hidden sm:inline font-mono text-[10px]">
          Press Enter to Send
        </span>
      </div>
    </div>
  );
};
