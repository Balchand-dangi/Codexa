const express = require('express')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const User = require("../model/userSchema")
const validUser = require("../utils/validateUser");
const userAuth = require('../middleware/userAuth');
const redisClient = require("../config/redis")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const rate_limiter = require('../middleware/rate_limiter')
const authRouter = express.Router()

authRouter.post("/signUp", rate_limiter, async (req, res) => {
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
                "Verify your email to access Codexa platform",
                `
                <h2>Email Verification</h2>
                <p>Click the link below to verify your email:</p>
                <a href="${verifyLink}">Verify Email</a>
                <p>This link is valid for 24 hours.</p>
                <h4>Regards,<h4>
                <h4>Codexa team.<h4>
                `
            );
        } catch (emailError) {
            //console.error("Email sending failed:", emailError);
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

        return res.status(201).json({
            message: "Check SPAM ! Verification email sent. Please check your inbox/Spam."
        });

    } catch (err) {
        //console.log("signup error:", err);
        return res.status(400).json({
            message: err.message || "Signup failed"
        });
    }
});

authRouter.get("/verify-email/:token", async (req, res) => {
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
});





authRouter.post('/signIn', rate_limiter, async (req, res) => {
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
        const token = jwt.sign({ _id: data._id, email: data.email }, process.env.SECRET_KEY, { expiresIn: "7d" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: 'Login successfully, Welcome back',
            token: token,
            email: data.email,
            name: data.name
        })
    }
    catch (err) {
        res.status(401).send(err.message)
    }
})

authRouter.post("/logOut", userAuth, async (req, res) => {
    try {
        const { token } = req.cookies;
        const userEmail = req.user.email;

        console.log(`⏳ Logout initiated for user: ${userEmail}`);

        if (!token) return res.status(400).json({ error: "No token found login first" });

        const payload = jwt.decode(token);

        // Blocklist token in redis
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);
        console.log(`✓ Token blocklisted in Redis`);


        const cookieOptions = {
            httpOnly: true,
            sameSite: "strict",
            path: "/"
        };


        if (process.env.NODE_ENV === 'production') {
            cookieOptions.secure = true;
        }

        res.clearCookie("token", cookieOptions);
        res.cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "strict",
            path: "/"
        });
        console.log(`✓ Cookie also set to empty with maxAge: 0`);

        res.status(200).json({
            message: "Logged out successfully",
            success: true,
            cookie_cleared: true
        });
    } catch (err) {
        console.error('✗ Logout error:', err.message);
        res.status(500).json({ error: err.message });
    }
});


module.exports = authRouter