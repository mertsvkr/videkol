const User = require("../../models/User")
const jwt = require("jsonwebtoken")

async function signupPost(req, res) {
    try {
        user = await User.findByEmail(req.body.user.email)
        if (user) {
            res.status(400).send({ success: false, error: "Email is already registered." })
        } else {
            newUser = User(req.body.user)
            try {
                await newUser.save()
                if (newUser) {
                    const token = await newUser.generateToken() //create token to recognize the user.
                    res.cookie("token", token)
                    res.status(201).send({ success: true })
                } else {
                    res.status(500).send({ success: false, error: "User couldnt be saved to the database." })
                }
            } catch (err) {
                res.status(400).send({ success: false, error: err })
            }
        }
    } catch (err) {
        res.status(500).send({ success: false, error: "Server error occured." })
    }
}

async function loginPost(req, res) {
    try {
        user = await User.findByEmail(req.body.user.email)
        if (user) {
            if (user.password == req.body.user.password) {
                const token = await user.generateToken() //create token to recognize the user in later operations
                res.cookie("token", token)
                res.status(200).send({ success: true })
            } else {
                res.status(401).send({ success: false, error: "Wrong password." })

            }
        } else {
            res.status(401).send({ success: false, error: "No such user with the given email" })
        }
    } catch (err) {
        res.status(401).send({ success: false, error: err })
    }
}

async function logoutPost(req, res) {
    if (req.cookies && req.cookies.token) {
        try {
            const user = await User.findById(jwt.verify(req.cookies.token, process.env.JWT_KEY)._id)
            if (user) {
                /**delete the token from the database */
                user.tokens = user.tokens.filter((val) => { return val.token != req.cookies.token })
                await user.save()
                res.clearCookie("token") //clear the token from the client
                res.status(200).send({ success: true })
            } else {
                res.status(401).send({ success: false, error: "Invalid token. User is already logged out" })
            }
        } catch (err) {
            res.status(401).send({ success: false, error: "Invalid token. User is already logged out" })
        }
    } else {
        res.clearCookie("token") //clear the token from the client
        res.status(401).send({ success: false, error: "User is already logged out." })
    }
}

module.exports.loginPost = loginPost
module.exports.signupPost = signupPost
module.exports.logoutPost = logoutPost