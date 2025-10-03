const validator = require('validator')

function validProject(data){
    const mandatoryField = ["email","title", "description","college","category"]
    const isAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k))

    if(!isAllowed){
        return "Field missing"
    }

    // if(!validator.isEmail(data.email)){
    //     return 'Invalid Email'
    // }

    if(typeof data.title !== 'string' || data.title.length<5 || data.title.length>50){
        return 'Title length should be in b/w 5-50 characters'
    }

    if(typeof data.description !== 'string' || data.description.length<20 || data.description.length>300){
        return 'Description length should be in b/w 20-300 characters'
    }

    return null // means valid
}

module.exports = validProject