const express = require("express");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { generateToken, authenticateToken } = require("../middleware/auth");
const { validateSignupData, validateEmail } = require("../utils/validation");
const router = express.Router();

// Rate limiting for registration
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 registration requests per windowMs
  message: {
    success: false,
    message: "Too many registration attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /auth/login
// @desc    Login user with email and password
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user has a password (not Google-only user)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Please use Google sign-in for this account",
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (password excluded by toJSON method)
    res.json({
      success: true,
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// @route   POST /auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    // Validation
    if (!googleId || !email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Google authentication data is incomplete",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address from Google",
      });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [{ googleId: googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Update Google ID if user exists but doesn't have it
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        googleId: googleId,
        email: email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        avatar: avatar,
        isEmailVerified: true, // Google emails are pre-verified
      });
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data
    res.json({
      success: true,
      message: "Google authentication successful",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
});

// @route   GET /auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
    });
  }
});

// @route   POST /auth/register
// @desc    Register new user with comprehensive validation
// @access  Public
router.post("/register", registrationLimiter, async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Comprehensive validation
    const validation = validateSignupData({ email, password, confirmPassword });

    if (!validation.isValid) {
      // Return the first error message for frontend compatibility
      const firstError = Object.values(validation.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: password,
      firstName: "User", // Default values for signup
      lastName: "Name",
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data in the exact format expected by frontend
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
      token: token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

module.exports = router;
