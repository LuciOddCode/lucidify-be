import { Request, Response, NextFunction } from "express";
import { User } from "@/models/User";
import { generateToken } from "@/middleware/auth";
import { validateSignupData } from "@/utils/validation";
import { ApiResponse, RegisterRequest, LoginRequest } from "@/types";
import { asyncHandler, CustomError } from "@/middleware/errorHandler";
import emailService from "@/services/emailService";

// Register new user
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, confirmPassword }: RegisterRequest = req.body;

    // Comprehensive validation
    const validation = validateSignupData({ email, password, confirmPassword });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new CustomError(firstError, 400, true);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new CustomError("Email already exists", 409, true);
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: password,
      name: "User", // Default name
      preferences: {
        language: "en",
        aiSummarization: true,
        anonymousMode: false,
        dataConsent: true,
      },
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        user.email,
        user.name || "User",
        user.preferences.language
      );
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't fail registration if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: "Account created successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
          createdAt: user.createdAt.toISOString(),
        },
        token,
      },
    };

    res.status(201).json(response);
  }
);

// Login user
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: LoginRequest = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      throw new CustomError("Invalid email or password", 401, true);
    }

    // Check if user has a password (not Google-only user)
    if (!user.password) {
      throw new CustomError(
        "Please use Google sign-in for this account",
        401,
        true
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError("Invalid email or password", 401, true);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    const response: ApiResponse = {
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt?.toISOString(),
        },
        token,
      },
    };

    res.json(response);
  }
);

// Google OAuth login/register
export const googleAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { googleId, email, firstName, lastName, avatar } = req.body;

    // Validation
    if (!googleId || !email || !firstName || !lastName) {
      throw new CustomError(
        "Google authentication data is incomplete",
        400,
        true
      );
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
        name: `${firstName} ${lastName}`,
        avatar: avatar,
        preferences: {
          language: "en",
          aiSummarization: true,
          anonymousMode: false,
          dataConsent: true,
        },
      });
      await user.save();

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.name || "User",
          user.preferences.language
        );
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    const response: ApiResponse = {
      success: true,
      message: "Google authentication successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt?.toISOString(),
        },
        token,
      },
    };

    res.json(response);
  }
);

// Verify token
export const verifyToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const response: ApiResponse = {
      success: true,
      message: "Token is valid",
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          preferences: req.user.preferences,
          lastLoginAt: req.user.lastLoginAt?.toISOString(),
        },
      },
    };

    res.json(response);
  }
);

// Logout user
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from storage
    const response: ApiResponse = {
      success: true,
      message: "Logout successful",
    };

    res.json(response);
  }
);

// Get current user profile
export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const response: ApiResponse = {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          preferences: req.user.preferences,
          createdAt: req.user.createdAt.toISOString(),
          lastLoginAt: req.user.lastLoginAt?.toISOString(),
        },
      },
    };

    res.json(response);
  }
);

// Update user profile
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, preferences } = req.body;
    const userId = req.user._id;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (preferences !== undefined)
      updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new CustomError("User not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString(),
        },
      },
    };

    res.json(response);
  }
);

// Set trusted contact
export const setTrustedContact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        "preferences.trustedContact": {
          name,
          email,
          phone,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new CustomError("User not found", 404, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Trusted contact set successfully",
    };

    res.json(response);
  }
);

// Test trusted contact
export const testTrustedContact = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user.preferences.trustedContact) {
      throw new CustomError("No trusted contact set", 400, true);
    }

    const { name, email } = user.preferences.trustedContact;
    const message = `This is a test message from ${
      user.name || user.email
    } to verify the trusted contact feature.`;

    const emailSent = await emailService.sendTrustedContactNotification(
      email,
      user.name || user.email,
      message,
      user.preferences.language
    );

    if (!emailSent) {
      throw new CustomError("Failed to send test email", 500, true);
    }

    const response: ApiResponse = {
      success: true,
      message: "Test email sent successfully to trusted contact",
    };

    res.json(response);
  }
);

// Export user data
export const exportData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // This would typically generate a comprehensive data export
    // For now, return a placeholder response
    const response: ApiResponse = {
      success: true,
      message: "Data export initiated",
      data: {
        downloadUrl: `${
          process.env.FRONTEND_URL
        }/download/export-${Date.now()}.json`,
      },
    };

    res.json(response);
  }
);

// Delete user account
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Delete user and all associated data
    await User.findByIdAndDelete(userId);

    // Note: In a real application, you would also delete all associated data
    // like mood entries, journal entries, chat messages, etc.

    const response: ApiResponse = {
      success: true,
      message: "Account deleted successfully",
    };

    res.json(response);
  }
);
