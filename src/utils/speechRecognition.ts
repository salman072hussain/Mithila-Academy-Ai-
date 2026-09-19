import { SupportedLanguage } from "../types";

export type SpeechCallback = (text: string, isFinal: boolean) => void;
export type AutoSubmitCallback = (finalQuestion: string) => void;
export type ErrorCallback = (errorMsg: string) => void;

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceRecognitionManager {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: SupportedLanguage = "hi-IN";
  private silenceTimer: any = null;
  private accumulatedFinalText = "";
  private currentInterimText = "";
  private hasSubmittedCurrentSession = false;

  constructor() {
    const win = typeof window !== "undefined" ? (window as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.currentLanguage;
      } catch (err) {
        console.warn("SpeechRecognition initialization failed:", err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public setLanguage(lang: SupportedLanguage) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public start(
    onResult: SpeechCallback,
    onAutoSubmit: AutoSubmitCallback,
    onError: ErrorCallback,
    onEnd: (submitted: boolean) => void,
    onStart?: () => void
  ): boolean {
    if (!this.recognition) {
      onError("Voice input is not supported in this browser. Please use Google Chrome on Android or desktop, or type your question.");
      return false;
    }

    this.stop();
    this.clearSilenceTimer();

    this.accumulatedFinalText = "";
    this.currentInterimText = "";
    this.hasSubmittedCurrentSession = false;

    // Set recognition language
    this.recognition.lang = this.currentLanguage;

    const triggerSubmitOnce = (reason: string) => {
      if (this.hasSubmittedCurrentSession) return;

      const question = (this.accumulatedFinalText || this.currentInterimText).trim();
      this.clearSilenceTimer();

      if (question.length > 0) {
        this.hasSubmittedCurrentSession = true;
        this.stop();
        onAutoSubmit(question);
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event: any) => {
      this.clearSilenceTimer();
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        this.accumulatedFinalText = this.accumulatedFinalText
          ? `${this.accumulatedFinalText} ${final}`
          : final;
        this.currentInterimText = "";
        onResult(this.accumulatedFinalText, true);

        // User spoke a final chunk: wait 900ms for natural pause to auto-submit
        this.silenceTimer = setTimeout(() => {
          triggerSubmitOnce("silence_after_final");
        }, 900);
      } else if (interim) {
        this.currentInterimText = interim;
        const currentTotal = this.accumulatedFinalText
          ? `${this.accumulatedFinalText} ${interim}`
          : interim;
        onResult(currentTotal, false);

        // If continuous interim speaking pauses for 1800ms, auto-trigger
        this.silenceTimer = setTimeout(() => {
          triggerSubmitOnce("silence_after_interim");
        }, 1800);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.clearSilenceTimer();
      this.isListening = false;

      if (event.error === "aborted") {
        return;
      }

      // If speech was already recognized before error/end, submit it!
      const existing = (this.accumulatedFinalText || this.currentInterimText).trim();
      if (existing.length > 0 && !this.hasSubmittedCurrentSession) {
        triggerSubmitOnce("onerror_with_existing_text");
        return;
      }

      let message = "Voice input error occurred. Please try again or type.";
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          message = "Microphone access is blocked. Please allow microphone permissions in your browser.";
          break;
        case "no-speech":
          message = "No speech was detected. Please tap the mic and speak clearly.";
          break;
        case "network":
          message = "Network glitch during speech recognition. Please check your connection.";
          break;
        case "audio-capture":
          message = "Microphone not detected or in use by another app.";
          break;
      }
      onError(message);
    };

    this.recognition.onend = () => {
      this.clearSilenceTimer();
      this.isListening = false;

      // When browser finishes listening naturally:
      const existing = (this.accumulatedFinalText || this.currentInterimText).trim();
      if (existing.length > 0 && !this.hasSubmittedCurrentSession) {
        triggerSubmitOnce("onend_natural_finish");
        onEnd(true);
      } else {
        onEnd(this.hasSubmittedCurrentSession);
      }
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      this.clearSilenceTimer();
      onError("Could not start microphone. Please try again.");
      return false;
    }
  }

  public stop(): string {
    this.clearSilenceTimer();
    const existing = (this.accumulatedFinalText || this.currentInterimText).trim();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
      this.isListening = false;
    }
    return existing;
  }

  public abort() {
    this.clearSilenceTimer();
    this.hasSubmittedCurrentSession = true; // prevent late firing
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const speechManager = new VoiceRecognitionManager();

