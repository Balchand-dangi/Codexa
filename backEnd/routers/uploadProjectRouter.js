const express = require('express')
const validProject = require('../utils/validateProject')
const Project = require('../model/projectSchema')
const User = require('../model/userSchema')

const uploadRouter = express.Router()

uploadRouter.post('/', async (req, res) => {
    const userExit = await User.findOne({email:req.body.email })
    if(!userExit){
      return res.status(401).send({message:"Unauthorized ! Please log in first"})
    }
    try{
      const error = validProject(req.body)
      if(error){
        return res.status(400).json({message:error})
      }
      const existingProject = await Project.findOne({title:req.body.title ,description:req.body.description})
      if(existingProject){
        return res.json({message:"This project already uploaded"})
      }
      await Project.create(req.body)
      res.status(200).json({message:"Project successfully uploaded"})
    }
    catch(err){
      res.send(err.message)
    }
  })

module.exports = uploadRouter
  