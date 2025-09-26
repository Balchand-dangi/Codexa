const mongoose = require('mongoose')

// schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        minLength:2,
        maxLength:20,
        required : true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },

    password:{
        type:String,
        required:true,
    },

    age:{
        type:Number,
        required:true,
        min:15,
        max:70
    },

    skills:{
        type:[String],
        required:true,
        
    },

    college:{
        type:String,
        required:true
    }


    
},{timestamps:true});

const User = mongoose.model('ModelName', userSchema,'myUsersCollection');

module.exports = User