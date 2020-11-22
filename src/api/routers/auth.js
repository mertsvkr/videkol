const express = require("express")
const { signupFieldCheck, loginFieldCheck } = require("../middleware/auth")
const { signupPost, loginPost, logoutPost } = require("../controller/auth")
const router = express.Router()

//end points for signup and login requests
router.post("/api/auth/signup", signupFieldCheck, signupPost)
router.post("/api/auth/login", loginFieldCheck, loginPost)
router.post("/api/auth/logout", logoutPost)
module.exports = router
