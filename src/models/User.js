const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    }
})

userSchema.statics.findByEmail = async (email) => {
    return await User.findOne({ email: email })
}


const User = mongoose.model("User", userSchema)

module.exports = User