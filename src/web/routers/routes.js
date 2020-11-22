const express = require("express")
const { indexGet } = require("../controller/allPages")
const { identifyUserFromToken } = require("../middleware/allPages")
const router = express.Router()

router.get("/", identifyUserFromToken, indexGet)

module.exports = router