const express = require('express')
const connectDB = require('./database')
const cookieParser = require('cookie-parser')
const projectRouter = require('./routers/uploadProjectRouter')
const authRouter = require('./routers/authRouter')
const getProjects = require('./routers/getProjects')
const projectInteractionRouter = require('./routers/projectInteractionRouter')
const notificationRouter = require('./routers/notificationRouter')
const redisClient = require('./config/redis')
const rate_limiter = require('./middleware/rate_limiter')

const path = require('path')

const app = express()

// middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', rate_limiter, authRouter)
app.use('/api/uploadProject', rate_limiter, projectRouter)
app.use('/api/getProjects', getProjects)
app.use('/api/project', projectInteractionRouter)
app.use('/api/notifications', notificationRouter)

// Serve static files
app.use(express.static(path.join(__dirname, "../frontEnd/dist")))
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontEnd/dist/index.html"))
})

const PORT = process.env.PORT || 5000
const initialize_connection = async () => {
    try {
        await Promise.all([redisClient.connect(), connectDB()])
        console.log("Connected to DB")

        app.listen(PORT, () => {
            console.log(`Server is running at ${PORT}`)
        })
    } catch (err) {
        console.log("Error:" + err.message)
    }
}
initialize_connection()