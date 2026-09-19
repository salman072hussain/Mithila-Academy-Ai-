import React, { useRef, useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Camera,
  Image as ImageIcon,
  X,
  Plus,
} from "lucide-react";

interface QuestionInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (image?: string) => void;
  onStartVoice: () => void;
  isListening: boolean;
  isLoading: boolean;
  isVoiceSupported: boolean;
  placeholder?: string;
  selectedImage?: string | null;
  setSelectedImage?: (img: string | null) => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({
  input,
  setInput,
  onSubmit,
  onStartVoice,
  isListening,
  isLoading,
  isVoiceSupported,
  placeholder = "Apna academic prashn yahan type karein ya mic dabayein...",
  selectedImage: externalSelectedPhoto,
  setSelectedImage: externalSetSelectedPhoto,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [internalSelectedPhoto, setInternalSelectedPhoto] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const selectedPhoto = externalSelectedPhoto !== undefined ? externalSelectedPhoto : internalSelectedPhoto;
  const setSelectedPhoto = externalSetSelectedPhoto || setInternalSelectedPhoto;

  // Auto-resize textarea according to text height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 130);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setSelectedPhoto(reader.result);
          setShowPhotoOptions(false);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = "";
  };

  const handleSubmit = () => {
    if ((input.trim() || selectedPhoto) && !isLoading) {
      const photoToSend = selectedPhoto || undefined;
      setSelectedPhoto(null);
      setShowPhotoOptions(false);
      onSubmit(photoToSend);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        id="gallery-file-input"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        id="camera-file-input"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Selected Photo Preview before submitting */}
      {selectedPhoto && (
        <div className="mb-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 flex-shrink-0">
              <img
                src={selectedPhoto}
                alt="Selected Question Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Camera className="w-3.5 h-3.5" /> Photo Question Attached
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                AI will solve this image. Type an extra note below if needed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition active:scale-95"
            title="Remove photo"
            aria-label="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Photo Options Popover (Gallery vs Camera) */}
      {showPhotoOptions && (
        <div className="mb-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-2 animate-in fade-in">
          <button
            type="button"
            id="open-camera-btn"
            onClick={() => {
              setShowPhotoOptions(false);
              cameraInputRef.current?.click();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs transition active:scale-95 border border-amber-500/30"
          >
            <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Take Photo (Camera)</span>
          </button>
          <button
            type="button"
            id="open-gallery-btn"
            onClick={() => {
              setShowPhotoOptions(false);
              galleryInputRef.current?.click();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition active:scale-95 border border-indigo-500/30"
          >
            <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Choose from Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPhotoOptions(false)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="relative flex items-end gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus-within:border-amber-500 dark:focus-within:border-amber-400 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all"
      >
        {/* Photo Question Icon beside question input area */}
        <button
          type="button"
          id="photo-question-btn"
          onClick={() => setShowPhotoOptions((prev) => !prev)}
          className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition active:scale-95 ${
            selectedPhoto || showPhotoOptions
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          }`}
          title="Photo Question (Camera / Gallery)"
          aria-label="Photo Question button"
        >
          <Camera className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
        </button>

        {/* Voice Input Button */}
        {isVoiceSupported ? (
          <button
            type="button"
            id="voice-question-btn"
            onClick={onStartVoice}
            className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition active:scale-95 ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-400/30"
            }`}
            title="Speak your question (Voice Input)"
            aria-label="Microphone voice question button"
          >
            {isListening ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        ) : null}

        {/* Text Area Input */}
        <div className="flex-1 min-w-0 flex items-center py-1">
          <textarea
            ref={textareaRef}
            id="question-input-textarea"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              selectedPhoto
                ? "Prashn ke baare me kuch likhna chahein (Optional)..."
                : placeholder
            }
            className="w-full resize-none bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none max-h-32 px-2 leading-relaxed"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          id="send-question-btn"
          disabled={(!input.trim() && !selectedPhoto) || isLoading}
          className={`flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition active:scale-95 ${
            (input.trim() || selectedPhoto) && !isLoading
              ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          }`}
          title="Send question"
          aria-label="Send question button"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
          ) : (
            <Send className="w-5 h-5 stroke-[2.5]" />
          )}
        </button>
      </form>

      {/* Input Hint Bar for Students */}
      <div className="mt-1.5 px-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="truncate">
          Camera, Gallery, Voice or Text • Answers end with "Surendra Sir ke anusar."
        </span>
        <span className="hidden sm:inline font-mono text-[10px]">
          Press Enter to Send
        </span>
      </div>
    </div>
  );
};
