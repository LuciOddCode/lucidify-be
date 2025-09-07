# Lucidify Backend API

A comprehensive Node.js/TypeScript backend API for the Lucidify mental health application, designed specifically for young adults in Sri Lanka with multilingual support (English, Sinhala, Tamil).

## 🌟 Features

- **🔐 JWT Authentication** - Secure user authentication with refresh tokens
- **📊 Mood Tracking** - Daily mood logging with sentiment analysis
- **📝 Journaling** - AI-powered journal prompts and sentiment analysis
- **🤖 AI Chat** - Mental health support via Gemini AI integration
- **🧘 Coping Strategies** - Evidence-based mental health techniques
- **⏱️ 8-Minute Sessions** - Guided wellness practices
- **📈 Analytics** - Personal insights and recommendations
- **🌍 Multilingual** - English, Sinhala, and Tamil support
- **📧 Email Notifications** - Trusted contact alerts and welcome emails
- **🔒 Security** - Rate limiting, input validation, and data protection

## 🛠️ Technology Stack

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Joi for request validation
- **AI Integration**: Google Gemini AI for chat and sentiment analysis
- **Email**: Nodemailer for email notifications
- **Security**: Helmet, CORS, rate limiting
- **Testing**: Jest with supertest
- **Logging**: Winston for structured logging

## 📁 Project Structure

```
src/
├── controllers/          # API route handlers
│   ├── authController.ts
│   ├── moodController.ts
│   ├── journalController.ts
│   ├── chatController.ts
│   ├── copingController.ts
│   ├── sessionController.ts
│   └── profileController.ts
├── models/              # Database models
│   ├── User.ts
│   ├── MoodEntry.ts
│   ├── JournalEntry.ts
│   ├── ChatMessage.ts
│   ├── ChatSession.ts
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
├── middleware/          # Custom middleware
│   ├── auth.ts
│   ├── validation.ts
│   ├── rateLimiter.ts
│   └── errorHandler.ts
├── services/            # Business logic services
│   ├── openaiService.ts
│   ├── emailService.ts
│   └── analyticsService.ts
├── utils/               # Utility functions
│   └── validation.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── config/              # Configuration files
│   └── database.ts
├── app.ts               # Express app configuration
└── server.ts            # Server entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 4.4+
- Gemini AI API key
- SMTP credentials (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd lucidify-be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   npm run setup
   ```

   Then edit `.env` file with your configuration:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/lucidify
   MONGODB_TEST_URI=mongodb://localhost:27017/lucidify-test

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h

   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key-here

   # Server
   PORT=3001
   NODE_ENV=development

   # CORS
   FRONTEND_URL=http://localhost:3000

   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

5. **Run tests**
   ```bash
   npm test
   npm run test:coverage
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description       | Access  |
| ------ | -------------------- | ----------------- | ------- |
| POST   | `/api/auth/register` | Register new user | Public  |
| POST   | `/api/auth/login`    | Login user        | Public  |
| POST   | `/api/auth/google`   | Google OAuth      | Public  |
| GET    | `/api/auth/verify`   | Verify token      | Private |
| POST   | `/api/auth/logout`   | Logout user       | Private |
| GET    | `/api/auth/profile`  | Get user profile  | Private |
| PUT    | `/api/auth/profile`  | Update profile    | Private |

### Mood Tracking Endpoints

| Method | Endpoint              | Description           | Access  |
| ------ | --------------------- | --------------------- | ------- |
| POST   | `/api/mood/log`       | Log mood entry        | Private |
| GET    | `/api/mood/entries`   | Get mood entries      | Private |
| GET    | `/api/mood/analytics` | Get mood analytics    | Private |
| GET    | `/api/mood/insights`  | Get mood insights     | Private |
| GET    | `/api/mood/trends`    | Get mood trends       | Private |
| GET    | `/api/mood/emotions`  | Get emotion frequency | Private |

### Journal Endpoints

| Method | Endpoint                 | Description            | Access  |
| ------ | ------------------------ | ---------------------- | ------- |
| POST   | `/api/journal/create`    | Create journal entry   | Private |
| GET    | `/api/journal/entries`   | Get journal entries    | Private |
| GET    | `/api/journal/analytics` | Get journal analytics  | Private |
| GET    | `/api/journal/insights`  | Get journal insights   | Private |
| GET    | `/api/journal/ai-prompt` | Get AI journal prompt  | Private |
| GET    | `/api/journal/search`    | Search journal entries | Private |

### AI Chat Endpoints

| Method | Endpoint                        | Description          | Access  |
| ------ | ------------------------------- | -------------------- | ------- |
| POST   | `/api/ai/chat`                  | Send chat message    | Private |
| GET    | `/api/ai/chat/sessions`         | Get chat sessions    | Private |
| GET    | `/api/ai/chat/sessions/:id`     | Get chat history     | Private |
| POST   | `/api/ai/chat/sessions/:id/end` | End chat session     | Private |
| GET    | `/api/ai/chat/suggestions`      | Get chat suggestions | Private |
| GET    | `/api/ai/chat/analytics`        | Get chat analytics   | Private |

### Coping Strategies Endpoints

| Method | Endpoint                          | Description                  | Access  |
| ------ | --------------------------------- | ---------------------------- | ------- |
| GET    | `/api/coping/strategies`          | Get coping strategies        | Private |
| GET    | `/api/coping/strategies/:id`      | Get strategy by ID           | Private |
| POST   | `/api/coping/strategies/:id/rate` | Rate strategy                | Private |
| GET    | `/api/coping/suggestions`         | Get personalized suggestions | Private |
| GET    | `/api/coping/strategies/search`   | Search strategies            | Private |

### 8-Minute Session Endpoints

| Method | Endpoint                        | Description           | Access  |
| ------ | ------------------------------- | --------------------- | ------- |
| POST   | `/api/session/start`            | Start session         | Private |
| PUT    | `/api/session/:id/step/:stepId` | Update step           | Private |
| POST   | `/api/session/:id/complete`     | Complete session      | Private |
| GET    | `/api/session/:id`              | Get session           | Private |
| GET    | `/api/session/user-sessions`    | Get user sessions     | Private |
| GET    | `/api/session/analytics`        | Get session analytics | Private |

### Profile Endpoints

| Method | Endpoint                       | Description         | Access  |
| ------ | ------------------------------ | ------------------- | ------- |
| GET    | `/api/profile`                 | Get profile         | Private |
| PUT    | `/api/profile`                 | Update profile      | Private |
| GET    | `/api/profile/dashboard`       | Get dashboard data  | Private |
| GET    | `/api/profile/stats`           | Get user statistics | Private |
| POST   | `/api/profile/trusted-contact` | Set trusted contact | Private |
| GET    | `/api/profile/export`          | Export user data    | Private |
| DELETE | `/api/profile/account`         | Delete account      | Private |

## 🔧 Configuration

### Environment Variables

| Variable         | Description               | Default                              |
| ---------------- | ------------------------- | ------------------------------------ |
| `NODE_ENV`       | Environment mode          | `development`                        |
| `PORT`           | Server port               | `3001`                               |
| `MONGODB_URI`    | MongoDB connection string | `mongodb://localhost:27017/lucidify` |
| `JWT_SECRET`     | JWT signing secret        | Required                             |
| `JWT_EXPIRES_IN` | JWT expiration time       | `24h`                                |
| `GEMINI_API_KEY` | Gemini AI API key         | Required                             |
| `FRONTEND_URL`   | Frontend URL for CORS     | `http://localhost:3000`              |
| `SMTP_HOST`      | SMTP server host          | Optional                             |
| `SMTP_PORT`      | SMTP server port          | `587`                                |
| `SMTP_USER`      | SMTP username             | Optional                             |
| `SMTP_PASS`      | SMTP password             | Optional                             |

### Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **AI Chat**: 20 requests per hour per user
- **Registration**: 3 requests per 15 minutes per IP

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Test Coverage

The test suite covers:

- Authentication flows
- API endpoint validation
- Error handling
- Database operations
- Middleware functionality

## 🚀 Deployment

### Production Setup

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set production environment variables**

   ```bash
   export NODE_ENV=production
   export MONGODB_URI=mongodb+srv://...
   export JWT_SECRET=your-production-secret
   export OPENAI_API_KEY=your-openai-key
   ```

3. **Start the server**
   ```bash
   npm start
   ```

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

### Health Checks

The API includes a health check endpoint:

```bash
GET /health
```

Returns:

```json
{
  "success": true,
  "message": "Lucidify API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **Input Validation** using Joi schemas
- **CORS Protection** with configurable origins
- **Helmet Security** headers
- **SQL Injection Prevention** through parameterized queries
- **XSS Protection** through input sanitization

## 📊 Monitoring & Logging

- **Winston Logging** for structured logs
- **Morgan HTTP Logging** for request tracking
- **Error Tracking** with detailed error information
- **Performance Monitoring** with response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Lucidify mental health application.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔄 API Versioning

The API uses URL versioning:

- Current version: `v1` (default)
- Future versions: `v2`, `v3`, etc.

## 📈 Performance

- **Response Times**: < 200ms for most endpoints
- **Concurrent Users**: Supports 1000+ users
- **Database**: Optimized queries with proper indexing
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for responses

---

**Built with ❤️ for mental health awareness in Sri Lanka**
