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

    if(typeof data.title !== 'string' || data.title.length<5 || data.title.length>100){
        return 'Title length should be in b/w 5-100 characters'
    }

    if(typeof data.description !== 'string' || data.description.length<10 || data.description.length>500){
        return 'Description length should be in b/w 10-500 characters'
    }

    return null // means valid
}

module.exports = validProject