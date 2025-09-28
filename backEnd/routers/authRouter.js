const express = require('express')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const User = require("../model/userSchema")
const validUser = require("../utils/validateUser");
const userAuth = require('../middleware/userAuth');
const redisClient = require("../config/redis")


const authRouter = express.Router()

authRouter.post('/signUp', async (req, res) => {
    try {
        // validate user
        validUser(req.body)

        // Check if email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = {
            ...req.body,
            password: hashedPassword
        }
        await User.create(newUser)
        res.status(201).send("You'r successfully registered")

    }
    catch (err) {
        res.status(401).send(err.message)
    }
})


authRouter.post('/signIn', async (req, res) => {
    try {
        const data = await User.findOne({ email: req.body.email })
        if (!data) {
            return res.json('Invalid credential')
        }
        const isAllowed = await bcrypt.compare(req.body.password, data.password)
        if (!isAllowed) {
            return res.json('Invalid credential')
        }
        // jwt
        const token = jwt.sign({ _id: data._id, email: data.email }, process.env.SECRET_KEY, { expiresIn: "3d" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        });
        res.status(200).send('Login successfully, Welcome back')
    }
    catch (err) {
        res.status(401).send(err.message)
    }
})

authRouter.post("/logOut", userAuth, async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(400).json({ error: "No token found" });

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

        res.status(200).json({message:"Logged out successfully"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = authRouter