const jwt = require("jsonwebtoken")
const User = require("../../models/User")

async function indexGet(req, res) {
    if (req.user) { // if user is logged in then show user the home page
        res.render("home", { email: req.user.email })
    } else {
        res.render("index")
    }
    console.log(req.cookies)
}

module.exports.indexGet = indexGet