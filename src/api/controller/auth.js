const User = require("../../models/User")

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
                    res.status(201).send({ success: true, user: newUser })
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
                res.status(201).send({ success: true, user: user })
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

module.exports.loginPost = loginPost
module.exports.signupPost = signupPost