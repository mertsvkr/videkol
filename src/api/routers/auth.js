const express = require("express")
const { signupFieldCheck, loginFieldCheck } = require("../middleware/auth")
const { signupPost, loginPost, logoutPost } = require("../controller/auth")
const router = express.Router()

//end points for signup and login requests
router.post("/user/signup", signupFieldCheck, signupPost)
router.post("/user/login", loginFieldCheck, loginPost)
router.post("/user/logout", logoutPost)
module.exports = router
