// Enhanced Text-to-Speech engine for Mithila Academy AI (Surendra Sir Voice Assistant)
// Provides ultra-smooth, natural voice read-aloud with high-quality neural voice ranking,
// complete answer delivery without cutoffs, Play, Pause, Resume, Stop controls and speed adjustments.

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  messageId: string | null;
  text: string;
  hasAudioAvailable?: boolean;
  playbackSpeed: number;
  voiceName?: string;
}

type StateListener = (state: SpeechState) => void;

function getInitialPlaybackSpeed(): number {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("mithila_speech_speed");
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.5 && val <= 2.0) {
          return val;
        }
      }
    } catch {}
  }
  return 1.0;
}

let currentPlaybackSpeed = getInitialPlaybackSpeed();
let cachedVoices: SpeechSynthesisVoice[] = [];
let activeVoiceName: string = "Surendra Sir (Smooth Voice)";

function updateVoicesList(): SpeechSynthesisVoice[] {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
  return cachedVoices;
}

// Immediately load voices and listen for async voices changed event in Chrome & Edge
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  updateVoicesList();
  window.speechSynthesis.onvoiceschanged = () => {
    updateVoicesList();
    notifyListeners();
  };
}

let currentSpeakingState: SpeechState = {
  isSpeaking: false,
  isPaused: false,
  messageId: null,
  text: "",
  hasAudioAvailable: false,
  playbackSpeed: currentPlaybackSpeed,
  voiceName: activeVoiceName,
};

const listeners: Set<StateListener> = new Set();
let watchdogTimer: any = null;

// Speech queue & session tracking
let speechSessionCounter = 0;
let currentSessionToken = 0;
let activeChunks: string[] = [];
let currentChunkIndex = 0;
let activeMessageId: string | null = null;
let isCancelled = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let currentEndCallback: (() => void) | null = null;
let currentStartCallback: (() => void) | null = null;
let currentErrorCallback: ((err?: any) => void) | null = null;

// Persistent audio memory for resume-after-stop or play-again
let lastSpokenFullText = "";
let lastMessageId: string | null = null;
let chunkNeedsAdvanceOnResume = false;

export function getPlaybackSpeed(): number {
  return currentPlaybackSpeed;
}

export function setPlaybackSpeed(speed: number): void {
  if (speed <= 0) return;
  currentPlaybackSpeed = speed;
  try {
    localStorage.setItem("mithila_speech_speed", speed.toString());
  } catch {}

  currentSpeakingState = {
    ...currentSpeakingState,
    playbackSpeed: currentPlaybackSpeed,
  };
  notifyListeners();

  // If speech is actively playing, smoothly adjust speed on next chunk or active utterance
  if (currentSpeakingState.isSpeaking && !currentSpeakingState.isPaused && activeUtterance) {
    const sessionToken = currentSessionToken;
    try {
      const prev = activeUtterance;
      prev.onend = null;
      prev.onerror = null;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}

    setTimeout(() => {
      if (!isCancelled && sessionToken === currentSessionToken) {
        playChunk(sessionToken);
      }
    }, 40);
  }
}

function notifyListeners() {
  const frozenState = { ...currentSpeakingState };
  listeners.forEach((listener) => {
    try {
      listener(frozenState);
    } catch (e) {
      console.warn("Speech listener error:", e);
    }
  });
}

export function subscribeSpeechState(listener: StateListener): () => void {
  listeners.add(listener);
  listener({ ...currentSpeakingState });
  return () => {
    listeners.delete(listener);
  };
}

export function getSpeechState(): SpeechState {
  return { ...currentSpeakingState };
}

// Clean markdown, formulas, units and educational symbols for natural, smooth human speech
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText;

  // Remove code blocks and inline code
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Format common math expressions into natural spoken phrases
  cleaned = cleaned.replace(/\${1,2}([^$]+)\${1,2}/g, "$1"); // remove single & double $$
  cleaned = cleaned.replace(/\$/g, ""); // remove stray dollar signs
  cleaned = cleaned.replace(/\\times/g, " guna ");
  cleaned = cleaned.replace(/\\div/g, " bhag ");
  cleaned = cleaned.replace(/\\pm/g, " plus minus ");
  cleaned = cleaned.replace(/\\approx/g, " lagbhag ");
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, " square root of $1 ");
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, " $1 batte $2 ");
  cleaned = cleaned.replace(/\\le|\\leq/g, " se chota ya barabar ");
  cleaned = cleaned.replace(/\\ge|\\geq/g, " se bada ya barabar ");
  cleaned = cleaned.replace(/\\neq/g, " barabar nahi hai ");
  cleaned = cleaned.replace(/\\degree/g, " degree ");

  // Mathematical powers
  cleaned = cleaned.replace(/\^2\b/g, " square ");
  cleaned = cleaned.replace(/\^3\b/g, " cube ");
  cleaned = cleaned.replace(/\^(\d+)\b/g, " ki ghat $1 ");

  // Chemical formulas & common abbreviations
  cleaned = cleaned.replace(/\bCO2\b/g, " C O 2 ");
  cleaned = cleaned.replace(/\bH2O\b/g, " H 2 O ");
  cleaned = cleaned.replace(/\bO2\b/g, " O 2 ");
  cleaned = cleaned.replace(/\bN2\b/g, " N 2 ");
  cleaned = cleaned.replace(/\bC6H12O6\b/g, " glucose ");
  cleaned = cleaned.replace(/\bNaCl\b/g, " sodium chloride ");

  // Common units
  cleaned = cleaned.replace(/(\d+)\s*kg\b/gi, "$1 kilogram");
  cleaned = cleaned.replace(/(\d+)\s*km\b/gi, "$1 kilometer");
  cleaned = cleaned.replace(/(\d+)\s*cm\b/gi, "$1 centimeter");
  cleaned = cleaned.replace(/(\d+)\s*mm\b/gi, "$1 millimeter");
  cleaned = cleaned.replace(/(\d+)\s*m\/s\^2\b/gi, "$1 meter prati second square");
  cleaned = cleaned.replace(/(\d+)\s*m\/s\b/gi, "$1 meter prati second");
  cleaned = cleaned.replace(/(\d+)\s*km\/h\b/gi, "$1 kilometer prati ghanta");
  cleaned = cleaned.replace(/(\d+)\s*°C\b/gi, "$1 degree celsius");
  cleaned = cleaned.replace(/(\d+)\s*%\b/gi, "$1 pratishat");
  cleaned = cleaned.replace(/(\d+)\s*N\b/g, "$1 Newton");
  cleaned = cleaned.replace(/(\d+)\s*J\b/g, "$1 Joule");
  cleaned = cleaned.replace(/(\d+)\s*W\b/g, "$1 Watt");
  cleaned = cleaned.replace(/(\d+)\s*V\b/g, "$1 Volt");
  cleaned = cleaned.replace(/(\d+)\s*Hz\b/gi, "$1 Hertz");

  // Math operators
  cleaned = cleaned.replace(/(\d+)\s*\+\s*(\d+)/g, "$1 plus $2");
  cleaned = cleaned.replace(/(\d+)\s*-\s*(\d+)/g, "$1 minus $2");
  cleaned = cleaned.replace(/(\d+)\s*=\s*(\d+)/g, "$1 barabar $2");
  cleaned = cleaned.replace(/(\w+)\s*=\s*(\w+)/g, "$1 equals $2");

  // Brackets: convert "(...)" into a gentle conversational clause ", ..., "
  cleaned = cleaned.replace(/\(([^)]+)\)/g, ", $1, ");

  // Markdown lists & numbers: "1. Pehla step" -> "Point 1: Pehla step"
  cleaned = cleaned.replace(/(^|[\n.!?])\s*(\d+)\.\s+/g, (_, prefix, num) => (prefix ? ". " : "") + "Point " + num + ": ");
  cleaned = cleaned.replace(/^[-*•+]\s+/gm, "");

  // Markdown headers, bold, italics
  cleaned = cleaned.replace(/^#+\s+/gm, "");
  cleaned = cleaned.replace(/[*_~`]/g, "");
  cleaned = cleaned.replace(/>\s+/gm, "");

  // Em dashes & double hyphens -> natural soft pauses
  cleaned = cleaned.replace(/[-—–]{2,}/g, ", ");
  cleaned = cleaned.replace(/—/g, ", ");

  // Strip URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/g, "");

  // Common abbreviations
  cleaned = cleaned.replace(/\be\.g\.\b/gi, "jaise ki");
  cleaned = cleaned.replace(/\bi\.e\.\b/gi, "yani ki");
  cleaned = cleaned.replace(/\betc\.\b/gi, "ityadi");
  cleaned = cleaned.replace(/\bvs\.?\b/gi, "versus");
  cleaned = cleaned.replace(/\bapprox\.?\b/gi, "lagbhag");

  // Remove multiple quotes
  cleaned = cleaned.replace(/["“”'‘’]/g, "");

  // Clean double commas and spaces
  cleaned = cleaned.replace(/,\s*,+/g, ",");
  cleaned = cleaned.replace(/^[.,;:।॥\s]+/, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Normalize Surendra Sir signature at the end
  const signatureRegex = /Surendra\s+Sir\s+ke\s+anusar[\.!\s]*/gi;
  cleaned = cleaned.replace(signatureRegex, "").trim();

  // Strip trailing period, danda or comma if already present before appending
  cleaned = cleaned.replace(/[.,;:।॥\s]+$/, "");

  // Re-attach signature cleanly as a dedicated final sentence so it's always read smoothly
  cleaned = `${cleaned}. Surendra Sir ke anusar.`;

  return cleaned;
}

// Natural sentence-level chunking (max ~280 chars)
// Keeps whole sentences intact so speech is smooth, natural, and never cut mid-thought.
export function splitTextIntoSpeechChunks(text: string, maxChunkLength = 280): string[] {
  if (!text) return [];

  // Match sentences ending in Hindi danda (।), period, exclamation, question mark, or newline
  const rawSegments = text.match(/[^।!?;.\n]+[।!?;.\n]*/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const segment of rawSegments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    // If current chunk + trimmed fits comfortably within maxChunkLength, combine for natural flow
    if (current) {
      if ((current + " " + trimmed).length <= maxChunkLength) {
        current = current + " " + trimmed;
        continue;
      } else {
        chunks.push(current.trim());
        current = "";
      }
    }

    // If an individual sentence itself is longer than maxChunkLength, split by natural comma/clause breaks
    if (trimmed.length > maxChunkLength) {
      const subParts = trimmed.match(/[^,，;]+[,，;]*/g) || [trimmed];
      let subCurrent = "";

      for (const sp of subParts) {
        const spTrimmed = sp.trim();
        if (!spTrimmed) continue;

        if (subCurrent) {
          if ((subCurrent + " " + spTrimmed).length <= maxChunkLength) {
            subCurrent = subCurrent + " " + spTrimmed;
            continue;
          } else {
            chunks.push(subCurrent.trim());
            subCurrent = "";
          }
        }

        if (spTrimmed.length > maxChunkLength) {
          // Fallback: split by words
          const words = spTrimmed.split(/\s+/);
          let wordChunk = "";
          for (const w of words) {
            if ((wordChunk + " " + w).trim().length > maxChunkLength) {
              if (wordChunk) chunks.push(wordChunk.trim());
              wordChunk = w;
            } else {
              wordChunk = wordChunk ? `${wordChunk} ${w}` : w;
            }
          }
          if (wordChunk) chunks.push(wordChunk.trim());
        } else {
          subCurrent = spTrimmed;
        }
      }
      if (subCurrent) chunks.push(subCurrent.trim());
    } else {
      current = trimmed;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

function startWatchdog(sessionToken: number) {
  stopWatchdog();
  // Safe 14-second watchdog: only triggers if a single chunk completely stalls without onend/onerror
  watchdogTimer = setTimeout(() => {
    if (
      !isCancelled &&
      sessionToken === currentSessionToken &&
      currentSpeakingState.isSpeaking &&
      !currentSpeakingState.isPaused
    ) {
      console.warn("Speech chunk timeout guard, advancing to next chunk");
      currentChunkIndex++;
      playChunk(sessionToken);
    }
  }, 14000);
}

function stopWatchdog() {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
}

// Intelligent voice ranking: finds the smoothest natural/neural voice available
function scoreVoice(voice: SpeechSynthesisVoice, textHasDevanagari: boolean): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace(/_/g, "-");
  let score = 0;

  if (textHasDevanagari) {
    if (lang.startsWith("hi")) score += 100;
    else if (name.includes("hindi") || name.includes("हिन्दी")) score += 90;
    else if (lang.includes("en-in") || lang.includes("in")) score += 20;
    else score -= 50;
  } else {
    // Hinglish / Indian English academic context
    if (lang.includes("en-in") || name.includes("india") || name.includes("indian")) score += 85;
    else if (lang.startsWith("hi") || name.includes("hindi")) score += 75;
    else if (lang.startsWith("en-gb") || lang.startsWith("en-uk")) score += 40;
    else if (lang.startsWith("en-us")) score += 30;
    else if (lang.startsWith("en")) score += 25;
    else score -= 40;
  }

  // Natural / Neural / High-Fidelity voices
  if (name.includes("natural") || name.includes("neural") || name.includes("online")) score += 60;
  if (name.includes("google") || name.includes("chrome")) score += 50;
  if (name.includes("siri") || name.includes("enhanced") || name.includes("premium")) score += 45;

  // Surendra Sir Persona (Warm Teacher / Resonant Tone)
  if (
    name.includes("madhur") ||
    name.includes("prabhat") ||
    name.includes("hemant") ||
    name.includes("rishi") ||
    name.includes("male")
  ) {
    score += 35;
  }

  if (name.includes("swara") || name.includes("lekha") || name.includes("neerja") || name.includes("veena")) {
    score += 30;
  }

  // Penalize robotic legacy synthesizers
  if (
    name.includes("espeak") ||
    name.includes("speech-dispatcher") ||
    name.includes("compact") ||
    name.includes("sam") ||
    name.includes("klatt")
  ) {
    score -= 80;
  }

  if (voice.default) score += 5;

  return score;
}

// Find the smoothest available voice for text language
function getVoiceForText(text: string): { voice: SpeechSynthesisVoice | null; lang: string; voiceName: string } {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { voice: null, lang: "hi-IN", voiceName: "Surendra Sir Voice" };
  }

  const voices = updateVoicesList();
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  if (voices && voices.length > 0) {
    const scored = [...voices].sort((a, b) => scoreVoice(b, hasDevanagari) - scoreVoice(a, hasDevanagari));
    const best = scored[0];
    if (best && scoreVoice(best, hasDevanagari) > 0) {
      return {
        voice: best,
        lang: best.lang || (hasDevanagari ? "hi-IN" : "en-IN"),
        voiceName: best.name,
      };
    }
  }

  return {
    voice: null,
    lang: hasDevanagari ? "hi-IN" : "en-IN",
    voiceName: "Surendra Sir (Smooth Voice)",
  };
}

// Speak current chunk and seamlessly chain to the next chunk
function playChunk(sessionToken: number): void {
  if (isCancelled || sessionToken !== currentSessionToken) {
    return;
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // Check if all chunks have finished
  if (currentChunkIndex >= activeChunks.length) {
    stopWatchdog();
    activeUtterance = null;
    currentSpeakingState = {
      isSpeaking: false,
      isPaused: false,
      messageId: null,
      text: "",
      hasAudioAvailable: Boolean(lastSpokenFullText),
      playbackSpeed: currentPlaybackSpeed,
      voiceName: activeVoiceName,
    };
    notifyListeners();
    currentEndCallback?.();
    return;
  }

  const chunkText = activeChunks[currentChunkIndex];
  if (!chunkText || !chunkText.trim()) {
    currentChunkIndex++;
    playChunk(sessionToken);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(chunkText);
  activeUtterance = utterance;

  // Rate: student configured playback speed
  utterance.rate = currentPlaybackSpeed;
  // Pitch: 0.98 provides a warm, grounded teacher tone, eliminating high-pitch electronic buzzing
  utterance.pitch = 0.98;
  utterance.volume = 1.0;

  const { voice, lang, voiceName } = getVoiceForText(chunkText);
  if (voice) utterance.voice = voice;
  utterance.lang = lang;
  activeVoiceName = voiceName;

  utterance.onstart = () => {
    if (isCancelled || sessionToken !== currentSessionToken) return;

    currentSpeakingState = {
      isSpeaking: true,
      isPaused: false,
      messageId: activeMessageId,
      text: activeChunks.join(" "),
      hasAudioAvailable: true,
      playbackSpeed: currentPlaybackSpeed,
      voiceName: activeVoiceName,
    };
    startWatchdog(sessionToken);
    notifyListeners();

    if (currentChunkIndex === 0) {
      currentStartCallback?.();
    }
  };

  utterance.onpause = () => {
    if (isCancelled || sessionToken !== currentSessionToken) return;
    currentSpeakingState = {
      ...currentSpeakingState,
      isSpeaking: true,
      isPaused: true,
      playbackSpeed: currentPlaybackSpeed,
      voiceName: activeVoiceName,
    };
    stopWatchdog();
    notifyListeners();
  };

  utterance.onresume = () => {
    if (isCancelled || sessionToken !== currentSessionToken) return;
    currentSpeakingState = {
      ...currentSpeakingState,
      isSpeaking: true,
      isPaused: false,
      playbackSpeed: currentPlaybackSpeed,
      voiceName: activeVoiceName,
    };
    startWatchdog(sessionToken);
    notifyListeners();
  };

  utterance.onend = () => {
    if (isCancelled || sessionToken !== currentSessionToken) return;

    // If currently paused, remember that this chunk finished so resume can advance
    if (currentSpeakingState.isPaused) {
      chunkNeedsAdvanceOnResume = true;
      return;
    }

    stopWatchdog();
    currentChunkIndex++;

    // 40ms natural breath buffer between sentences prevents audio buffer click/overlap
    setTimeout(() => {
      if (!isCancelled && sessionToken === currentSessionToken && !currentSpeakingState.isPaused) {
        playChunk(sessionToken);
      }
    }, 40);
  };

  utterance.onerror = (e: any) => {
    if (isCancelled || sessionToken !== currentSessionToken) return;

    if (e.error === "interrupted" || e.error === "canceled") {
      return;
    }

    console.warn("Speech chunk playback error on chunk", currentChunkIndex, e);
    stopWatchdog();
    currentChunkIndex++;
    playChunk(sessionToken);
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis.speak failed:", err);
    currentChunkIndex++;
    playChunk(sessionToken);
  }
}

export function speakAnswer(
  text: string,
  options?: {
    messageId?: string;
    rate?: number;
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err?: any) => void;
  }
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  if (options?.rate && !isNaN(options.rate) && options.rate >= 0.5 && options.rate <= 2.0) {
    currentPlaybackSpeed = options.rate;
  }

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText.trim()) return false;

  // Idempotency safeguard:
  // If this exact answer is ALREADY speaking or paused, do NOT cancel the queue or restart from beginning!
  if (
    currentSpeakingState.isSpeaking &&
    activeMessageId === (options?.messageId || null) &&
    lastSpokenFullText === spokenText
  ) {
    if (currentSpeakingState.isPaused) {
      resumeSpeaking();
    }
    return true;
  }

  // Stop any active prior speech and invalidate prior session tokens
  stopSpeaking();

  // Split into manageable sentence & clause chunks to ensure entire answer is read
  const chunks = splitTextIntoSpeechChunks(spokenText);
  if (chunks.length === 0) return false;

  // Initialize session
  currentSessionToken = ++speechSessionCounter;
  activeChunks = chunks;
  currentChunkIndex = 0;
  activeMessageId = options?.messageId || null;
  lastSpokenFullText = spokenText;
  lastMessageId = activeMessageId;
  chunkNeedsAdvanceOnResume = false;
  isCancelled = false;
  currentStartCallback = options?.onStart || null;
  currentEndCallback = options?.onEnd || null;
  currentErrorCallback = options?.onError || null;

  const { voiceName } = getVoiceForText(spokenText);
  activeVoiceName = voiceName;

  currentSpeakingState = {
    isSpeaking: true,
    isPaused: false,
    messageId: activeMessageId,
    text: spokenText,
    hasAudioAvailable: true,
    playbackSpeed: currentPlaybackSpeed,
    voiceName: activeVoiceName,
  };
  notifyListeners();

  // Start playing from the first chunk
  playChunk(currentSessionToken);
  return true;
}

export function pauseSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    if (currentSpeakingState.isSpeaking && !currentSpeakingState.isPaused) {
      currentSpeakingState = {
        ...currentSpeakingState,
        isSpeaking: true,
        isPaused: true,
      };
      stopWatchdog();
      notifyListeners();
      try {
        window.speechSynthesis.pause();
      } catch (e) {
        console.warn("pauseSpeaking error:", e);
      }
    }
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // If current speech is completely stopped, allow playing complete answer from beginning
    if (!currentSpeakingState.isSpeaking) {
      if (lastSpokenFullText) {
        speakAnswer(lastSpokenFullText, { messageId: lastMessageId || undefined });
        return;
      }
      return;
    }

    // If currently paused: continue seamlessly from where it was paused without restarting!
    if (currentSpeakingState.isPaused) {
      currentSpeakingState = {
        ...currentSpeakingState,
        isSpeaking: true,
        isPaused: false,
      };
      notifyListeners();

      const sessionToken = currentSessionToken;

      // If the chunk finished while speech was paused, advance to next chunk immediately
      if (chunkNeedsAdvanceOnResume) {
        chunkNeedsAdvanceOnResume = false;
        currentChunkIndex++;
        playChunk(sessionToken);
        return;
      }

      try {
        window.speechSynthesis.resume();
      } catch (e) {
        console.warn("resumeSpeaking error:", e);
      }

      startWatchdog(sessionToken);

      // Mobile browser safeguard: if resume stalls on Android, continue chunk safely
      setTimeout(() => {
        if (!isCancelled && !currentSpeakingState.isPaused && sessionToken === currentSessionToken) {
          if (!window.speechSynthesis.speaking) {
            playChunk(sessionToken);
          }
        }
      }, 150);
    }
  }
}

export function stopSpeaking(): void {
  stopWatchdog();
  isCancelled = true;
  currentSessionToken = ++speechSessionCounter;
  activeChunks = [];
  currentChunkIndex = 0;
  activeUtterance = null;
  currentStartCallback = null;
  currentEndCallback = null;
  currentErrorCallback = null;
  chunkNeedsAdvanceOnResume = false;

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("cancel speech error:", e);
    }
  }

  currentSpeakingState = {
    isSpeaking: false,
    isPaused: false,
    messageId: lastMessageId,
    text: lastSpokenFullText,
    hasAudioAvailable: Boolean(lastSpokenFullText),
    playbackSpeed: currentPlaybackSpeed,
    voiceName: activeVoiceName,
  };
  notifyListeners();
}

export function togglePlayPauseSpeaking(text?: string, messageId?: string): void {
  if (typeof window !== "undefined" || !("speechSynthesis" in window)) return;

  if (currentSpeakingState.isSpeaking) {
    if (currentSpeakingState.isPaused) {
      resumeSpeaking();
    } else {
      pauseSpeaking();
    }
  } else if (text) {
    speakAnswer(text, { messageId });
  }
}

export function isSpeaking(): boolean {
  return currentSpeakingState.isSpeaking;
}

export function isPaused(): boolean {
  return currentSpeakingState.isPaused;
}


