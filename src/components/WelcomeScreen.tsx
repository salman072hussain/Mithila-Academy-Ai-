import React from "react";
import {
  Sparkles,
  Calculator,
  FlaskConical,
  BookOpen,
  Globe,
  PenTool,
  ArrowRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { SUBJECT_CATEGORIES } from "../data/sampleQuestions";
import { HomeSearchBar } from "./HomeSearchBar";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  onSubmitQuestion: (question: string, image?: string) => void;
  onVoiceStart: () => void;
  isVoiceSupported: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  input: string;
  setInput: (value: string) => void;
  onFocusInput?: () => void;
  searchContainerRef?: React.RefObject<HTMLDivElement | null>;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  onSubmitQuestion,
  onVoiceStart,
  isVoiceSupported,
  isListening = false,
  isLoading = false,
  input,
  setInput,
  onFocusInput,
  searchContainerRef,
}) => {
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
    <div className="max-w-3xl mx-auto py-3 sm:py-6 px-3 sm:px-4 text-center">
      {/* Academy Crest / Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold mb-2.5">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Mithila Academy AI • Surendra Sir</span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
        Ask <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-amber-400 dark:to-orange-400">Mithila Academy AI</span>
      </h1>

      {/* Subtitle description */}
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-5 sm:mb-6 leading-relaxed">
        Your academic mentor. Type, speak, or take a photo of any question in{" "}
        <strong className="text-slate-900 dark:text-white font-semibold">Hindi, Hinglish, or English</strong>.
      </p>

      {/* PRIMARY GOOGLE-STYLE SEARCH BAR (ONE UNIFIED PROMINENT SEARCH BAR) */}
      <div ref={searchContainerRef} className="scroll-mt-6">
        <HomeSearchBar
          input={input}
          setInput={setInput}
          onSubmit={onSubmitQuestion}
          onVoiceStart={onVoiceStart}
          isListening={isListening}
          isVoiceSupported={isVoiceSupported}
          isLoading={isLoading}
          onFocus={onFocusInput}
        />
      </div>

      {/* Example Question Chips directly under the search bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          type="button"
          id="chip-location-btn"
          onClick={() => onSubmitQuestion("Mithila Academy kaha hai?")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition active:scale-95 shadow-xs"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Mithila Academy kaha hai?</span>
        </button>
        <button
          type="button"
          id="chip-photosynthesis-btn"
          onClick={() => onSubmitQuestion("Photosynthesis kya hai?")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          <span>Photosynthesis kya hai?</span>
        </button>
        <button
          type="button"
          id="chip-newton-btn"
          onClick={() => onSubmitQuestion("Newton ka third law samjhao.")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          <span>Newton ka third law samjhao.</span>
        </button>
        <button
          type="button"
          id="chip-math-btn"
          onClick={() => onSubmitQuestion("12 × 15 kitna hota hai?")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 border border-slate-200 dark:border-slate-700"
        >
          <span>12 × 15 kitna hota hai?</span>
        </button>
      </div>

      {/* Academic Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto mb-7 text-left text-xs text-slate-600 dark:text-slate-300">
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
