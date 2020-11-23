const express = require("express")
const { identifyUserFromToken } = require("../middleware/auth")
const { createRoomPost } = require("../controller/communication")
const router = express.Router()

router.post("/api/communication/createroom", identifyUserFromToken, createRoomPost)
module.exports = router