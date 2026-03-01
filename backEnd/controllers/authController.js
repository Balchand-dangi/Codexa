const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const User = require("../model/userSchema")
const validUser = require("../utils/validateUser");
const redisClient = require("../config/redis")
const { deleteByPattern } = require('../utils/cache');
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Verify authentication status
exports.verify = async (req, res) => {
    try {
        res.status(200).json({
            authenticated: true,
            user: {
                email: req.user.email,
                name: req.user.name,
                role: req.user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sign up new user
exports.signUp = async (req, res) => {
    try {
        validUser(req.body);
        const email = req.body.email.trim().toLowerCase();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const emailToken = crypto.randomBytes(32).toString("hex");
        const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${emailToken}`;

        try {
            await sendEmail(
                email,
                "Verify your email to access Codexa-web platform",
                `
                <h2>Email Verification</h2>
                <p>Click the link below to verify your email:</p>
                <a href="${verifyLink}">Verify Email</a>
                <p>This link is valid for 24 hours.</p>
                <h4>Regards,<h4>
                <h4>Codexa-web team.<h4>
                `
            );
        } catch (emailError) {
            return res.status(500).json({
                message: "Failed to send verification email. Please check your email address or try again later."
            });
        }

        await User.create({
            ...req.body,
            email,
            password: hashedPassword,
            isVerified: false,
            emailVerifyToken: emailToken,
            emailVerifyTokenExpiry: Date.now() + 24 * 60 * 60 * 1000
        });
        await deleteByPattern('ADMIN_USERS:*');

        return res.status(201).json({
            message: "Check spam/inbox! Verification link sent to your email."
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message || "Signup failed"
        });
    }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerifyToken: req.params.token,
            emailVerifyTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification link" });
        }

        user.isVerified = true;
        user.emailVerifyToken = undefined;
        user.emailVerifyTokenExpiry = undefined;
        await user.save();

        res.json({ message: "Email verified successfully!" });
    } catch (err) {
        res.status(400).json({ message: "Verification failed. Please try again." });
    }
};

// Sign in user
exports.signIn = async (req, res) => {
    try {
        const data = await User.findOne({ email: req.body.email })
        if (!data) {
            return res.status(401).json('Invalid credential')
        }

        if (!data.isVerified) {
            return res.status(400).json('Please verify your email before logging in')
        }
        const isAllowed = await bcrypt.compare(req.body.password, data.password)
        if (!isAllowed) {
            return res.status(401).json('Invalid credential')
        }
        // jwt
        const token = jwt.sign({ _id: data._id, email: data.email, role: data.role }, process.env.SECRET_KEY, { expiresIn: "7d" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: "Successfully signed in. Welcome back!",
            user: {
                email: data.email,
                name: data.name,
                role: data.role
            }
        });
    }
    catch (err) {
        res.status(401).send(err.message)
    }
}

// Log out user
exports.logOut = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(400).json({ error: "No token found login first" });

        const payload = jwt.decode(token);  //to extract expiry time and also verify that token is not tempered and expired

        // Blocklist  token in redis
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);

        // Clear cookie in browser
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email.trim().toLowerCase();

        const user = await User.findOne({ email });

        // Always return same message to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                message: "If your email exists, you will receive a password reset link."
            });
        }

        // Only send reset to verified users
        if (!user.isVerified) {
            return res.status(400).json({
                message: "Please verify your email first before resetting password."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail(
                email,
                "Reset your Codexa-web password",
                `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link is valid for 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <h4>Regards,</h4>
                <h4>Codexa-web team.</h4>
                `
            );
        } catch (emailError) {
            return res.status(500).json({
                message: "Failed to send reset email. Please try again later."
            });
        }

        // Store hashed token (more secure than plain text)
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        return res.status(200).json({
            message: "Check spam/inbox! Password reset link sent to your email."
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message || "Password reset request failed"
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Validate new password
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        // Hash the token from URL to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful. You can now login with your new password."
        });

    } catch (err) {
        return res.status(400).json({
            message: err.message || "Password reset failed"
        });
    }
};


