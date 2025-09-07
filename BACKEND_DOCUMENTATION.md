# Lucidify Backend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Project Structure](#project-structure)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Security](#authentication--security)
8. [AI Integration](#ai-integration)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Email Service](#email-service)
12. [Development Setup](#development-setup)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Future Enhancements](#future-enhancements)

## Overview

Lucidify is a comprehensive mental health application backend designed specifically for young adults in Sri Lanka. The backend provides AI-powered mental health support, mood tracking, journaling, and wellness session management through a RESTful API.

### Key Features

- **User Authentication**: JWT-based authentication with Google OAuth support
- **Mood Tracking**: Daily mood logging with sentiment analysis
- **AI-Powered Journaling**: Intelligent journal prompts and sentiment analysis
- **Chat Support**: AI assistant for mental health guidance
- **8-Minute Wellness Sessions**: Structured wellness activities
- **Coping Strategies**: Personalized mental health techniques
- **Multi-language Support**: English, Sinhala, and Tamil
- **Trusted Contact System**: Emergency contact notifications

## Technology Stack

### Core Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini AI

### Key Dependencies

```json
{
  "express": "~4.16.1",
  "mongoose": "^8.0.3",
  "jsonwebtoken": "^9.0.2",
  "@google/generative-ai": "^0.2.1",
  "bcryptjs": "^2.4.3",
  "joi": "^17.11.0",
  "express-rate-limit": "^7.1.5",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "nodemailer": "^6.9.7"
}
```

### Development Tools

- **TypeScript**: Type safety and better development experience
- **Jest**: Testing framework
- **Nodemon**: Development server with auto-restart
- **tsc-alias**: Path mapping for TypeScript compilation

## Architecture & Design Patterns

### MVC Architecture

The backend follows a clean MVC (Model-View-Controller) pattern:

- **Models**: Data layer with Mongoose schemas
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Services**: External integrations and complex business logic
- **Middleware**: Cross-cutting concerns (auth, validation, error handling)

### Design Principles

#### 1. Separation of Concerns

Each layer has a specific responsibility:

- Controllers handle HTTP requests/responses
- Services contain business logic
- Models define data structure and validation
- Middleware handles cross-cutting concerns

#### 2. Dependency Injection

Services are designed as singletons and injected where needed, promoting testability and maintainability.

#### 3. Error Handling Strategy

Centralized error handling with custom error classes and middleware for consistent API responses.

#### 4. Type Safety

Comprehensive TypeScript interfaces ensure type safety across the application.

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts             # Server startup
├── config/
│   └── database.ts       # MongoDB connection
├── controllers/          # Request handlers
│   ├── authController.ts
│   ├── moodController.ts
│   ├── journalController.ts
│   ├── chatController.ts
│   ├── copingController.ts
│   ├── sessionController.ts
│   └── profileController.ts
├── middleware/           # Custom middleware
│   ├── auth.ts          # JWT authentication
│   ├── errorHandler.ts  # Error handling
│   ├── rateLimiter.ts   # Rate limiting
│   └── validation.ts    # Input validation
├── models/              # Mongoose schemas
│   ├── User.ts
│   ├── MoodEntry.ts
│   ├── JournalEntry.ts
│   ├── ChatSession.ts
│   ├── ChatMessage.ts
│   ├── CopingStrategy.ts
│   └── EightMinuteSession.ts
├── routes/              # API routes
│   ├── auth.ts
│   ├── mood.ts
│   ├── journal.ts
│   ├── ai.ts
│   ├── coping.ts
│   ├── session.ts
│   └── profile.ts
├── services/            # External services
│   ├── geminiService.ts # AI integration
│   ├── emailService.ts  # Email notifications
│   └── analyticsService.ts
├── types/               # TypeScript interfaces
│   └── index.ts
└── utils/               # Utility functions
    └── validation.ts
```

## Database Design

### MongoDB Collections

#### 1. Users Collection

```typescript
interface User {
  _id: ObjectId;
  email: string;
  password: string; // hashed
  name?: string;
  preferences: {
    language: "en" | "si" | "ta";
    aiSummarization: boolean;
    anonymousMode: boolean;
    dataConsent: boolean;
    trustedContact?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  googleId?: string;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**

- `{ email: 1 }` - Unique email lookup
- `{ "preferences.language": 1 }` - Language-based queries
- `{ createdAt: -1 }` - Recent users

#### 2. Mood Entries Collection

```typescript
interface MoodEntry {
  _id: ObjectId;
  userId: ObjectId;
  mood: number; // 1-10 scale
  emotions: string[];
  notes?: string;
  voiceTranscript?: string;
  sentiment: {
    score: number; // -1 to 1
    label: "positive" | "negative" | "neutral";
    confidence: number; // 0 to 1
  };
  timestamp: Date;
}
```

**Indexes:**

- `{ userId: 1, timestamp: -1 }` - User's mood history
- `{ userId: 1, mood: 1 }` - Mood-based queries
- `{ userId: 1, "sentiment.label": 1 }` - Sentiment analysis
- `{ userId: 1, timestamp: -1, mood: 1 }` - Analytics queries

#### 3. Journal Entries Collection

```typescript
interface JournalEntry {
  _id: ObjectId;
  userId: ObjectId;
  content: string;
  mood?: number;
  sentiment: SentimentAnalysis;
  aiPrompt?: string;
  tags: string[];
  timestamp: Date;
}
```

**Indexes:**

- `{ userId: 1, timestamp: -1 }` - User's journal history
- `{ content: "text" }` - Full-text search
- `{ userId: 1, tags: 1 }` - Tag-based queries

#### 4. Chat Sessions Collection

```typescript
interface ChatSession {
  _id: ObjectId;
  userId: ObjectId;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
}
```

#### 5. Chat Messages Collection

```typescript
interface ChatMessage {
  _id: ObjectId;
  userId: ObjectId;
  sessionId: ObjectId;
  content: string;
  isUser: boolean;
  suggestions?: string[];
  timestamp: Date;
}
```

### Database Design Principles

#### 1. Denormalization for Performance

- User preferences embedded in user document
- Sentiment analysis stored with entries for fast queries

#### 2. Compound Indexes

- Optimized for common query patterns
- Analytics queries use compound indexes

#### 3. Data Validation

- Mongoose schemas enforce data integrity
- Custom validation rules for business logic

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User",
      "preferences": { ... },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

#### POST `/login`

Authenticate user and return JWT token.

#### POST `/google-auth`

Google OAuth authentication.

#### GET `/profile`

Get current user profile (requires authentication).

#### PUT `/profile`

Update user profile.

#### POST `/trusted-contact`

Set trusted contact for emergency notifications.

### Mood Tracking Routes (`/api/mood`)

#### POST `/log`

Log a new mood entry.

**Request Body:**

```json
{
  "mood": 7,
  "emotions": ["happy", "grateful"],
  "notes": "Had a great day at work",
  "voiceTranscript": "I feel really good today..."
}
```

#### GET `/history`

Get mood history with pagination.

#### GET `/analytics`

Get mood analytics and trends.

### Journal Routes (`/api/journal`)

#### POST `/create`

Create a new journal entry.

#### GET `/entries`

Get journal entries with pagination and filtering.

#### GET `/prompt`

Get AI-generated journal prompt.

### AI Chat Routes (`/api/ai`)

#### POST `/chat`

Send message to AI assistant.

#### GET `/sessions`

Get chat session history.

### Wellness Session Routes (`/api/session`)

#### POST `/start`

Start an 8-minute wellness session.

#### PUT `/step/:stepId`

Update session step completion.

#### POST `/complete`

Complete wellness session.

## Authentication & Security

### JWT Implementation

#### Token Generation

```typescript
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
);
```

#### Authentication Middleware

```typescript
export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  req.user = user;
  next();
};
```

### Security Measures

#### 1. Password Security

- Bcrypt hashing with salt rounds of 12
- Password complexity requirements
- Password not included in default queries

#### 2. CORS Configuration

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

#### 3. Helmet Security Headers

```typescript
app.use(helmet());
```

#### 4. Input Validation

- Joi schemas for request validation
- Sanitization of user inputs
- Type checking with TypeScript

## AI Integration

### Google Gemini AI Service

The backend integrates with Google's Gemini AI for various mental health features:

#### 1. Sentiment Analysis

```typescript
async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  const prompt = `Analyze the sentiment of: "${text}"`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

#### 2. AI Chat Responses

- Context-aware responses
- Multi-language support (English, Sinhala, Tamil)
- Mental health-focused prompts

#### 3. Journal Prompts

- Mood-based prompt generation
- Personalized suggestions
- Cultural sensitivity for Sri Lankan context

#### 4. Coping Strategy Suggestions

- Evidence-based techniques
- Personalized recommendations
- CBT and mindfulness approaches

### AI Service Architecture

```typescript
class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string = "gemini-1.5-flash";

  // Sentiment analysis
  async analyzeSentiment(text: string): Promise<SentimentAnalysis>;

  // Chat responses
  async generateChatResponse(
    message: string,
    context?: string
  ): Promise<ChatResponse>;

  // Journal prompts
  async generateJournalPrompt(mood?: number): Promise<string>;

  // Coping strategies
  async generateCopingSuggestions(
    mood: number,
    emotions: string[]
  ): Promise<string[]>;
}
```

## Error Handling

### Custom Error Classes

```typescript
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  field?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    field?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.field = field;
  }
}
```

### Error Handling Middleware

```typescript
export const errorHandler = (
  error: Error | AppError | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong. Please try again.";

  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle other error types...

  res.status(statusCode).json({
    success: false,
    message,
    field: error.field,
  });
};
```

### Error Types Handled

1. **Validation Errors**: Joi validation failures
2. **JWT Errors**: Invalid or expired tokens
3. **MongoDB Errors**: Duplicate keys, cast errors
4. **Operational Errors**: Business logic errors
5. **System Errors**: Unexpected server errors

## Rate Limiting

### Rate Limiting Strategy

Different endpoints have different rate limits based on their sensitivity:

```typescript
// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

// Authentication rate limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 auth attempts per window
  skipSuccessfulRequests: true,
});

// AI Chat rate limiting
export const aiChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI requests per hour per user
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

### Rate Limiting Benefits

1. **DDoS Protection**: Prevents abuse of API endpoints
2. **Resource Management**: Ensures fair usage of AI services
3. **Security**: Limits brute force attacks on authentication
4. **Cost Control**: Manages expensive operations like AI calls

## Email Service

### Multi-language Email Templates

The email service supports three languages with culturally appropriate templates:

#### 1. Welcome Emails

- User onboarding
- Feature introduction
- Multi-language support

#### 2. Trusted Contact Notifications

- Emergency contact alerts
- User safety features
- Culturally sensitive messaging

#### 3. Password Reset

- Secure token-based reset
- Time-limited links
- Multi-language templates

### Email Service Architecture

```typescript
class EmailService {
  private transporter: nodemailer.Transporter;

  async sendEmail(options: EmailOptions): Promise<boolean>;
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    language: string
  ): Promise<boolean>;
  async sendTrustedContactNotification(
    contactEmail: string,
    userName: string,
    message: string
  ): Promise<boolean>;
  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string
  ): Promise<boolean>;
}
```

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/lucidify
MONGODB_TEST_URI=mongodb://localhost:27017/lucidify-test

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Installation Steps

1. **Clone Repository**

```bash
git clone <repository-url>
cd lucidify-be
```

2. **Install Dependencies**

```bash
npm install
```

3. **Setup Environment**

```bash
npm run setup
```

4. **Build TypeScript**

```bash
npm run build
```

5. **Start Development Server**

```bash
npm run dev
```

### Available Scripts

```json
{
  "start": "node dist/server.js",
  "dev": "nodemon",
  "build": "tsc && tsc-alias",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "setup": "node setup-env.js",
  "test:api": "node test-api.js"
}
```

## Deployment

### Production Considerations

#### 1. Environment Configuration

- Use production MongoDB cluster
- Secure JWT secrets
- Configure proper CORS origins
- Set up monitoring and logging

#### 2. Security Hardening

- Enable HTTPS
- Use environment-specific secrets
- Implement proper error logging
- Set up rate limiting

#### 3. Performance Optimization

- Enable compression
- Use connection pooling
- Implement caching strategies
- Monitor database performance

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## Testing

### Testing Strategy

#### 1. Unit Tests

- Service layer testing
- Utility function testing
- Model validation testing

#### 2. Integration Tests

- API endpoint testing
- Database integration testing
- External service mocking

#### 3. Test Configuration

```typescript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
};
```

### Test Database

- Uses MongoDB Memory Server for testing
- Isolated test environment
- Automatic cleanup after tests

## Future Enhancements

### Planned Features

#### 1. Advanced Analytics

- Machine learning insights
- Predictive mood analysis
- Personalized recommendations

#### 2. Enhanced AI Features

- Voice emotion analysis
- Image-based mood detection
- Advanced conversation memory

#### 3. Social Features

- Anonymous support groups
- Peer support matching
- Community challenges

#### 4. Professional Integration

- Therapist dashboard
- Appointment scheduling
- Progress sharing

#### 5. Mobile Optimization

- Push notifications
- Offline capabilities
- Mobile-specific features

### Technical Improvements

#### 1. Performance

- Redis caching
- Database optimization
- CDN integration

#### 2. Scalability

- Microservices architecture
- Load balancing
- Auto-scaling

#### 3. Monitoring

- Application performance monitoring
- Error tracking
- User analytics

#### 4. Security

- OAuth 2.0 implementation
- Advanced rate limiting
- Security auditing

## Conclusion

The Lucidify backend is designed as a comprehensive, scalable, and secure platform for mental health support. The architecture prioritizes:

- **User Safety**: Robust authentication and data protection
- **Cultural Sensitivity**: Multi-language support for Sri Lankan users
- **AI Integration**: Intelligent features powered by Google Gemini
- **Scalability**: Clean architecture supporting future growth
- **Maintainability**: TypeScript and comprehensive testing

The codebase follows industry best practices and is designed to evolve with the growing needs of mental health technology in Sri Lanka.

---

_This documentation is maintained alongside the codebase and should be updated with any architectural changes or new features._
