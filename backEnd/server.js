const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const connectDB = require('./config/database')
const cookieParser = require('cookie-parser')
const projectRouter = require('./routers/uploadProjectRouter')
const authRouter = require('./routers/authRouter')
const getProjects = require('./routers/getProjects')
const projectInteractionRouter = require('./routers/projectInteractionRouter')
const notificationRouter = require('./routers/notificationRouter')
const redisClient = require('./config/redis')
const { rate_limiter_strict, rate_limiter_light } = require('./middleware/rate_limiter')
const myprofileRouter = require('./routers/myProfileRouter')
const myProjectsRouter = require('./routers/myProjectsRouter')
const path = require('path')
const userAuth = require('./middleware/userAuth')
const adminRouter = require('./routers/adminRouter')
const cors = require('cors')
const { initSocket } = require('./socket')
const adminMiddleware = require('./middleware/adminMiddleware')

require('dotenv').config()

// Trim any accidental whitespace in the env value (e.g. "http:// localhost:3000")
const FRONTEND_URL = (process.env.FRONTEND_URL || '').trim()

const app = express()
const httpServer = http.createServer(app)

// Socket.IO — attach to HTTP server with same CORS config
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        credentials: true
    }
})

// Make io accessible in controllers via app.locals
app.locals.io = io

// Initialize socket event handlers
initSocket(io)

// Middleware
// Allow stage proof image payloads (base64) beyond default 100kb JSON limit.
app.use(express.json({ limit: '2mb' }))
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}))
app.use(cookieParser())

// Routes with rate limiting and authentication where needed. Caching is handled inside controllers for routes that have mixed interactions (feed + non-feed) to ensure cache consistency, while pure feed routes have caching implemented directly in controllers for optimal performance.
app.use('/api/auth', rate_limiter_strict, authRouter) 
app.use('/api/uploadProject', userAuth, rate_limiter_strict, projectRouter)
app.use('/api/getProjects', rate_limiter_light, getProjects)   
app.use('/api/project', userAuth, projectInteractionRouter) 
app.use('/api/notifications', userAuth, rate_limiter_light, notificationRouter)   
app.use('/api/myProfile', userAuth, rate_limiter_strict, myprofileRouter)
app.use('/api/my-projects', userAuth, rate_limiter_light, myProjectsRouter)  
app.use('/api/admin', rate_limiter_light, adminMiddleware, adminRouter) 

// Serve static files
app.use(express.static(path.join(__dirname, '../frontEnd/dist')))
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontEnd/dist/index.html'))
})

const PORT = process.env.PORT || 5000
const initialize_connection = async () => {
    try {
        await Promise.all([redisClient.connect(), connectDB()])
        console.log('Connected to DB')
        httpServer.listen(PORT, () => {
            console.log(`Server is running at ${PORT}`)
        })
    } catch (err) {
        console.log('Error:' + err.message)
    }
}
initialize_connection()
