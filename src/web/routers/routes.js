const express = require("express")
const { indexGet, videoCallPage } = require("../controller/allPages")
const { identifyUserFromToken } = require("../../api/middleware/auth")
const router = express.Router()

router.get("/", identifyUserFromToken, indexGet)
module.exports = router