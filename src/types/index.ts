// Common types and interfaces for the Lucidify backend

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  field?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// User Types
export interface UserPreferences {
  language: "en" | "si" | "ta";
  aiSummarization: boolean;
  anonymousMode: boolean;
  dataConsent: boolean;
  trustedContact?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface User {
  _id: string;
  email: string;
  password?: string;
  name?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Mood Entry Types
export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: "positive" | "negative" | "neutral";
  confidence: number; // 0 to 1
}

export interface MoodEntry {
  _id: string;
  userId: string;
  mood: number; // 1-10 scale
  emotions: string[];
  notes?: string;
  voiceTranscript?: string;
  sentiment: SentimentAnalysis;
  timestamp: Date;
}

// Journal Entry Types
export interface JournalEntry {
  _id: string;
  userId: string;
  content: string;
  mood?: number; // 1-10 scale
  sentiment: SentimentAnalysis;
  aiPrompt?: string;
  tags: string[];
  timestamp: Date;
}

// Chat Types
export interface ChatMessage {
  _id: string;
  userId: string;
  sessionId: string;
  content: string;
  isUser: boolean;
  suggestions?: string[];
  timestamp: Date;
}

export interface ChatSession {
  _id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
}

// Coping Strategy Types
export interface CopingStrategy {
  _id: string;
  title: string;
  description: string;
  type: "mindfulness" | "cbt" | "gratitude" | "breathing" | "grounding";
  steps: string[];
  duration: number; // in minutes
  rating: number; // average user rating
  personalized: boolean;
  createdAt: Date;
}

// 8-Minute Session Types
export interface SessionStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  completed: boolean;
  data?: any;
}

export interface EightMinuteSession {
  _id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  steps: SessionStep[];
  overallMood?: number; // 1-10 scale
  summary?: string;
  completed: boolean;
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface MoodLogRequest {
  mood: number;
  emotions: string[];
  notes?: string;
  voiceTranscript?: string;
}

export interface JournalCreateRequest {
  content: string;
  mood?: number;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  preferences?: Partial<UserPreferences>;
}

export interface TrustedContactRequest {
  name: string;
  email: string;
  phone?: string;
}

// Analytics Types
export interface MoodAnalytics {
  averageMood: number;
  moodTrend: number[]; // last 7 days
  weeklyData: {
    day: string;
    mood: number;
    count: number;
  }[];
  emotionFrequency: {
    emotion: string;
    count: number;
  }[];
}

export interface JournalAnalytics {
  totalEntries: number;
  averageLength: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  commonThemes: {
    theme: string;
    count: number;
  }[];
  weeklySummary: {
    week: string;
    entries: number;
    averageSentiment: number;
  }[];
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  field?: string;
}

// Gemini AI Types
export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  temperature: number;
}

export interface ChatCompletionRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

// Email Types
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// File Upload Types
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

// Environment Variables
export interface EnvironmentVariables {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  FRONTEND_URL: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
}
