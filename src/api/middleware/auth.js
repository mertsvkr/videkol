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