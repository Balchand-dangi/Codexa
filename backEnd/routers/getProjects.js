
const express = require('express')
const Projects = require('../model/projectSchema')
const userAuth = require('../middleware/userAuth')

const projectRouter = express.Router()

projectRouter.get("/",userAuth, async(req, res) => {

    try{
        const projectData = await Projects.find()
        res.json(projectData)
    }
    catch(err){

    }
})

module.exports = projectRouter