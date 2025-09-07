# Signup API Documentation

## Overview

This document describes the signup API endpoint that works seamlessly with the Lucidify frontend. The API provides comprehensive validation, security features, and error handling.

## Endpoint

### POST /api/auth/register

**Description:** Register a new user with comprehensive validation and security features.

**Rate Limiting:** 5 requests per 15 minutes per IP address

## Request

### Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

### Field Requirements

#### Email

- **Required:** Yes
- **Type:** String
- **Format:** Valid email address
- **Validation:** Must be unique in the system

#### Password

- **Required:** Yes
- **Type:** String
- **Minimum Length:** 8 characters
- **Must Contain:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&(),.?":{}|<>)

#### Confirm Password

- **Required:** Yes
- **Type:** String
- **Validation:** Must match the password field exactly

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-string"
}
```

### Error Responses

#### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

**Possible validation messages:**

- `"Email is required"`
- `"Please enter a valid email address"`
- `"Password is required"`
- `"Password must be at least 8 characters long"`
- `"Password must contain at least one uppercase letter"`
- `"Password must contain at least one lowercase letter"`
- `"Password must contain at least one number"`
- `"Password must contain at least one special character"`
- `"Please confirm your password"`
- `"Passwords do not match"`

#### Email Already Exists (409 Conflict)

```json
{
  "success": false,
  "message": "Email already exists"
}
```

#### Rate Limit Exceeded (429 Too Many Requests)

```json
{
  "success": false,
  "message": "Too many registration attempts, please try again later."
}
```

#### Server Error (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Something went wrong. Please try again."
}
```

## Security Features

### Password Security

- Passwords are hashed using bcrypt with 12 salt rounds
- Passwords are never returned in API responses
- Strong password requirements enforced

### Rate Limiting

- Maximum 5 registration attempts per IP per 15 minutes
- Prevents spam and brute force attacks

### Input Validation

- Comprehensive server-side validation
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization

### JWT Authentication

- JWT tokens generated for immediate login after signup
- Tokens expire after 7 days (configurable)
- Secure token generation with secret key

## Frontend Integration

### API Configuration

```javascript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
```

### Example Frontend Usage

```javascript
const signup = async (email, password, confirmPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token and redirect
      localStorage.setItem("token", data.token);
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: "Network error. Please try again." };
  }
};
```

### Error Handling

The frontend should handle errors by checking the message content:

- Messages containing "email" → display under email field
- Messages containing "password" → display under password field
- Other messages → display as general error

## Testing

### Test Cases Covered

✅ Valid signup data → Success response with user and token
❌ Duplicate email → 409 error with "Email already exists"
❌ Invalid email format → 400 error with validation message
❌ Weak password → 400 error with specific password requirements
❌ Password mismatch → 400 error with "Passwords do not match"
❌ Missing fields → 400 error with appropriate validation messages
❌ Server error → 500 error with generic error message

### Running Tests

```bash
# Install dependencies
npm install

# Start the server
npm run dev

# Run tests in another terminal
node test-api.js
```

## Database Schema

### Users Collection

```javascript
{
  _id: String (UUID),
  email: String (unique, lowercase),
  password: String (hashed),
  firstName: String,
  lastName: String,
  googleId: String (optional, unique),
  avatar: String (optional),
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lucidify

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3001
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation
- **express-rate-limit**: Rate limiting
- **uuid**: UUID generation
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Error Codes Reference

| Status Code | Description           | Common Causes                     |
| ----------- | --------------------- | --------------------------------- |
| 400         | Bad Request           | Validation errors, malformed JSON |
| 409         | Conflict              | Email already exists              |
| 429         | Too Many Requests     | Rate limit exceeded               |
| 500         | Internal Server Error | Database errors, server issues    |

## Support

For issues or questions regarding the signup API, please refer to the main README.md file or contact the development team.
