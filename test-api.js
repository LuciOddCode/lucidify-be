// Simple API test script
const axios = require("axios");

const BASE_URL = "http://localhost:3000";

// Test data
const testUser = {
  email: "test@example.com",
  password: "Password123!",
  confirmPassword: "Password123!",
};

const weakPasswordUser = {
  email: "weak@example.com",
  password: "weak",
  confirmPassword: "weak",
};

const passwordMismatchUser = {
  email: "mismatch@example.com",
  password: "Password123!",
  confirmPassword: "DifferentPassword123!",
};

const googleUser = {
  googleId: "google_test_123",
  email: "google@example.com",
  firstName: "Google",
  lastName: "User",
  avatar: "https://example.com/avatar.jpg",
};

async function testAPI() {
  console.log("🧪 Starting API Tests...\n");

  try {
    // Test 1: Register new user with strong password
    console.log("1. Testing user registration with strong password...");
    const registerResponse = await axios.post(
      `${BASE_URL}/api/auth/register`,
      testUser
    );
    console.log("✅ Registration successful:", registerResponse.data.message);
    console.log("   User ID:", registerResponse.data.user.id);
    console.log("   User email:", registerResponse.data.user.email);
    console.log("   Token received:", !!registerResponse.data.token);
    console.log("");

    // Test 2: Test weak password validation
    console.log("2. Testing weak password validation...");
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, weakPasswordUser);
    } catch (error) {
      console.log(
        "✅ Weak password properly rejected:",
        error.response.data.message
      );
    }
    console.log("");

    // Test 3: Test password mismatch validation
    console.log("3. Testing password mismatch validation...");
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, passwordMismatchUser);
    } catch (error) {
      console.log(
        "✅ Password mismatch properly rejected:",
        error.response.data.message
      );
    }
    console.log("");

    // Test 4: Test duplicate email
    console.log("4. Testing duplicate email validation...");
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    } catch (error) {
      console.log(
        "✅ Duplicate email properly rejected:",
        error.response.data.message
      );
    }
    console.log("");

    // Test 5: Login with registered user
    console.log("5. Testing user login...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful:", loginResponse.data.message);
    console.log("   User email:", loginResponse.data.user.email);
    console.log("   Token received:", !!loginResponse.data.token);
    console.log("");

    // Test 6: Get current user with token
    console.log("6. Testing protected route (GET /auth/me)...");
    const token = loginResponse.data.token;
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Protected route successful:", meResponse.data.user.email);
    console.log("");

    // Test 7: Google OAuth
    console.log("7. Testing Google OAuth...");
    const googleResponse = await axios.post(
      `${BASE_URL}/auth/google`,
      googleUser
    );
    console.log("✅ Google OAuth successful:", googleResponse.data.message);
    console.log("   Google user email:", googleResponse.data.user.email);
    console.log("   Google ID:", googleResponse.data.user.googleId);
    console.log("");

    // Test 8: Test invalid login
    console.log("8. Testing invalid login...");
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: "invalid@example.com",
        password: "wrongpassword",
      });
    } catch (error) {
      console.log(
        "✅ Invalid login properly rejected:",
        error.response.data.message
      );
    }
    console.log("");

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
