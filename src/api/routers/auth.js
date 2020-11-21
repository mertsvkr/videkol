const express = require("express")
const { signupFieldCheck, loginFieldCheck } = require("../middleware/auth")
const { signupPost, loginPost } = require("../controller/auth")
const router = express.Router()

//end points for signup and login requests
router.post("/signup", signupFieldCheck, signupPost)
router.post("/login", loginFieldCheck, loginPost)

module.exports = router
