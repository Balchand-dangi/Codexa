
const express = require('express')
const Projects = require('../model/projectSchema')
const userAuth = require('../middleware/userAuth')

const projectRouter = express.Router()
//console.log("getProject triggerd")
projectRouter.get("/",userAuth, async(req, res) => {

    try{
        const projectData = await Projects.find()
        res.json(projectData)
    }
    catch(err){
        res.json({message:"Unable to fatch data from DB"})
    }
})

module.exports = projectRouter