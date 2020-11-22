const express = require("express")
require('./db/db.js') // connects to the database
const authRouter = require("./api/routers/auth")
const webrouter = require("./web/routers/routes")
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT

const app = express()

app.use(express.json()) // interpret the request as JSON object
app.use(cookieParser()) // parses cookies of the request object


app.set('view engine', 'ejs') // set the template engine ejs
app.set('views', './src/web/views') // set views folder as ./src/views 
app.use(express.static('./src/web/static')) // set static folder


app.use(authRouter)
app.use(webrouter)

const server = app.listen(PORT, () => {
    console.log("Server running on port: " + PORT)
})


const io = require("socket.io")(server)

io.on('connection', (socket) => {
    console.log('New user connected')

    //default username
    socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', { message: data.message, username: socket.username });
    })

    //listen on typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: socket.username })
    })
})