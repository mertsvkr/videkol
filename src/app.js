const express = require("express")
require('./db/db.js') // connects to the database
const authRouter = require("./api/routers/auth")
const webRouter = require("./web/routers/routes")
const communicationRouter = require("./api/routers/communication")

const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const PORT = process.env.PORT

const app = express()

app.use(express.json()) // interpret the request as JSON object
app.use(cookieParser()) // parses cookies of the request object


app.set('view engine', 'ejs') // set the template engine ejs
app.set('views', './src/web/views') // set views folder as ./src/views 
app.use(express.static('./src/web/static')) // set static folder


app.use(authRouter)
app.use(webRouter)
app.use(communicationRouter)

const server = app.listen(PORT, () => {
    console.log("Server running on port: " + PORT)
})

const { io, setIO } = require("../src/web/socket")
setIO(server)