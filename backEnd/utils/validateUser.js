const validator = require("validator")


function validUser(data){
    const mandatoryField = ["name","email", "password","age","skills","college"]
    const isAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k))

    if(!isAllowed){
        throw new Error("Field missing")
    }

    if(data.name.length<3 || data.name.length>20){
        throw new Error('Name length should be in b/w 3-20')
    }

    if(!validator.isEmail(data.email)){
        throw new Error ("Invalid email")
    }

    if(!validator.isStrongPassword(data.password)){
        throw new Error("Weak password")
    }

    if(data.age < 14 || data.age > 60){
        throw new Error('Age must be in b/w 13-61')
    }
}

module.exports = validUser