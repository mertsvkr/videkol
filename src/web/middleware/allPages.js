const jwt = require("jsonwebtoken")
const User = require("../../models/User")

async function identifyUserFromToken(req, res, next) {
    try {
        const userID = jwt.verify(req.cookies?.token, process.env.JWT_KEY)._id
        const user = await User.findById(userID)
        if (user) { // if there is such a  user, attach it to the req object
            req.user = user
        }
        next()
    } catch (err) {
        next()
    }
    console.log(req.cookies)
}

module.exports.identifyUserFromToken = identifyUserFromToken