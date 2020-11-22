const express = require("express")
const { indexGet } = require("../controller/allPages")
const { identifyUserFromToken } = require("../../api/middleware/auth")
const router = express.Router()

router.get("/", identifyUserFromToken, indexGet)

module.exports = router