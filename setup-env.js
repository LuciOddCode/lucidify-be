// Environment setup script
const fs = require("fs");
const path = require("path");

const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lucidify

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3001

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
`;

const envPath = path.join(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env file created successfully!");
  console.log("📝 Please update the JWT_SECRET and other values as needed.");
} else {
  console.log("⚠️  .env file already exists. Skipping creation.");
}

console.log("\n🚀 Setup complete! You can now run:");
console.log("   npm install");
console.log("   npm run dev");
