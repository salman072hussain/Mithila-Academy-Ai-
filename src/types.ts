export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isVoice?: boolean;
  image?: string;
  subjectHint?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  subjectTag?: string;
}

export type SupportedLanguage = "hi-IN" | "en-IN" | "en-US" | "hinglish";

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  supported: boolean;
  language: SupportedLanguage;
}

export interface SubjectCategory {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
  color: string;
  examples: string[];
}
