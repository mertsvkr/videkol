const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.statics.findByEmail = async (email) => {
    return await User.findOne({ email: email })
}

userSchema.methods.generateToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
const User = mongoose.model("User", userSchema)

module.exports = User