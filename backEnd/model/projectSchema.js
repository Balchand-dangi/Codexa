const mongoose = require('mongoose')

// schema
const projectSchema = new mongoose.Schema({
    email:{
        type:String,
        required : true,
        index: true,
    },

    title:{
        type:String,
        required:true,
        trim:true,
    },

    description:{
        type:String,
        required:true,
        
    },

    techStack:{
        type:[String],
        required:true
    },

    college:{
        type:String,
        required:true
    },
    
    category:{
        type:[String],
        required:true
    }

},{timestamps:true});

const Project = mongoose.model('ProjectModel', projectSchema,'usersProject');

module.exports = Project