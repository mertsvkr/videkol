const express = require("express")
const PORT = process.env.PORT
require('./db/db.js') // connects to the database
const authRouter = require("./api/routers/auth")
const app = express()

app.use(express.json())
app.use(authRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})  