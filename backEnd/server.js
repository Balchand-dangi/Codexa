const express = require('express')
const connectDB = require('./database')
const cookieParser = require('cookie-parser')
const projectRouter = require('./routers/uploadProjectRouter')
const authRouter = require('./routers/authRouter')
const getProjects = require('./routers/getProjects')
const redisClient = require('./config/redis');
const rate_limiter = require('./middleware/rate_limiter')
require("dotenv").config()
const path = require('path')

const app = express()

app.use(express.static(path.join(__dirname,"dist")))
app.get("/*",(req,res)=>{
    res.sendFile(path.join(__dirname,"dist","index.html"))
})
// middleware
app.use(express.json())
app.use(cookieParser())
// app.use(rate_limiter)

app.use('/api/auth',rate_limiter, authRouter)
app.use('/api/uploadProject',rate_limiter, projectRouter)
app.use('/api/getProjects', getProjects)


const PORT = process.env.PORT || 5000
const initialize_connection = async () => {
    try {
        // await redisClient.connect()
        // console.log("connected to Redis")

        // await main()
        // console.log("connected to MongoDB")

        //for parallel connection
        await Promise.all([redisClient.connect(), connectDB()])
        console.log("Connected to DB")

        app.listen(PORT, () => {
            console.log(`Server is running at ${PORT}`)
        })

    }
    catch (err) {
        console.log("Error:" + err.message)
    }
}
initialize_connection()

