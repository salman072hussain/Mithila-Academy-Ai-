import React, { useState, useRef } from "react";
import {
  Sparkles,
  Calculator,
  FlaskConical,
  BookOpen,
  Globe,
  PenTool,
  Mic,
  MicOff,
  Search,
  Camera,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  X,
  MapPin,
} from "lucide-react";
import { SUBJECT_CATEGORIES } from "../data/sampleQuestions";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  onSubmitQuestion?: (question: string, image?: string) => void;
  onVoiceStart: () => void;
  isVoiceSupported: boolean;
  isListening?: boolean;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  onSubmitQuestion = (q) => onSelectPrompt(q),
  onVoiceStart,
  isVoiceSupported,
  isListening = false,
  onOpenSearch,
  onOpenSettings,
}) => {
  const [homeInput, setHomeInput] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    if (homeInput.trim() || selectedPhoto) {
      const photo = selectedPhoto || undefined;
      const text = homeInput.trim();
      setSelectedPhoto(null);
      setHomeInput("");
      onSubmitQuestion(text, photo);
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
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4 text-center">
      {/* Hidden file pickers for Camera and Gallery */}
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

      {/* Academy Crest / Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Mithila Academy AI • Surendra Sir</span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
        Ask <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-400 dark:to-orange-400">Mithila Academy AI</span>
      </h1>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
        Your academic mentor. Type, speak, or take a photo of any question in{" "}
        <strong className="text-slate-900 dark:text-white font-semibold">Hindi, Hinglish, or English</strong>.
      </p>

      {/* 1. GOOGLE-STYLE LARGE ROUNDED SEARCH BAR ON HOME FEED */}
      <div className="max-w-2xl mx-auto mb-6 text-left">
        {/* Photo Preview if attached from Camera/Gallery */}
        {selectedPhoto && (
          <div className="mb-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400/50 shadow-md flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-700">
                <img
                  src={selectedPhoto}
                  alt="Question Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Photo Attached
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  AI will analyze and solve this problem step-by-step
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

        {/* The Google-Style Pill Search Form */}
        <form
          onSubmit={handleFormSubmit}
          id="home-google-search-form"
          className="relative flex items-center rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus-within:border-amber-500 dark:focus-within:border-amber-400 shadow-md hover:shadow-lg transition-all duration-200 pl-4 pr-2 py-1.5"
        >
          {/* Left Google-Style Search Icon */}
          <div className="text-amber-600 dark:text-amber-400 flex-shrink-0 mr-2">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Search Input Field */}
          <input
            type="text"
            id="home-search-input"
            value={homeInput}
            onChange={(e) => setHomeInput(e.target.value)}
            placeholder="Ask Mithila Academy AI..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0 pr-2"
          />

          {/* Action Icons Group: Gallery, Camera, Microphone, Submit */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Gallery Icon */}
            <button
              type="button"
              id="home-gallery-btn"
              onClick={() => galleryInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition active:scale-95"
              title="Select photo from Gallery"
              aria-label="Gallery photo picker"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Camera Icon */}
            <button
              type="button"
              id="home-camera-btn"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition active:scale-95"
              title="Take a photo of question with Camera"
              aria-label="Camera question capture"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Microphone Icon */}
            {isVoiceSupported && (
              <button
                type="button"
                id="home-mic-btn"
                onClick={onVoiceStart}
                className={`p-2 rounded-full transition active:scale-95 ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Voice question"
                aria-label="Voice question microphone"
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Search Submit Button */}
            <button
              type="submit"
              id="home-submit-search-btn"
              disabled={!homeInput.trim() && !selectedPhoto}
              className={`p-2.5 rounded-full transition active:scale-95 flex items-center justify-center ${
                homeInput.trim() || selectedPhoto
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              }`}
              title="Search question"
              aria-label="Submit question"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>

      {/* Predefined Quick Questions */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => onSubmitQuestion("Mithila Academy kaha hai?")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>Mithila Academy kaha hai?</span>
        </button>
        <button
          onClick={() => onSubmitQuestion("Prakash sanshleshan (Photosynthesis) kya hai?")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <span>Photosynthesis kya hai?</span>
        </button>
        <button
          onClick={() => onSubmitQuestion("Newton's third law of motion with example")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <span>Newton's 3rd Law</span>
        </button>
      </div>

      {/* Academic Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto mb-8 text-left text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Step-by-step Maths</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Science with formulas</span>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Hindi & English answers</span>
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
                onClick={() => onSelectPrompt(cat.examples[0])}
                className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs text-slate-700 dark:text-slate-300 transition group flex items-center justify-between gap-1"
              >
                <span className="truncate">{cat.examples[0]}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 flex-shrink-0 transition" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
