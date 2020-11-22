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

async function signupFieldCheck(req, res, next) {
    try {
        if (req.body.user) {
            if (req.body.user.email && req.body.user.password && req.body.user.username) {
                next()
            } else {
                res.status(400).send({ success: false, error: "Please fill every fields." })
            }
        } else {
            res.status(400).send({ success: false, error: "There is no user info provided" })
        }
    } catch (err) {
        console.error(err)
        res.status(500).send({ success: false, error: "Server error occured" })
    }
}

async function loginFieldCheck(req, res, next) {
    try {
        if (req.body.user) {
            if (req.body.user.email && req.body.user.password) {
                next()
            } else {
                res.status(400).send({ success: false, error: "Please fill every fields." })
            }
        } else {
            res.status(400).send({ success: false, error: "There is no user info provided" })
        }
    } catch (err) {
        console.error(err)
        res.status(500).send({ success: false, error: "Server error occured." })
    }
}


module.exports.signupFieldCheck = signupFieldCheck
module.exports.loginFieldCheck = loginFieldCheck
module.exports.identifyUserFromToken = identifyUserFromToken