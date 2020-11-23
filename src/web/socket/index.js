const jwt = require("jsonwebtoken")

function setIO(server) {
    global.io = require("socket.io")(server)
    io.on('connection', (socket) => {
        console.log('New user connected')

        //grouping the sockets which belong to the same account
        socket.on('accountRoom', (data) => {
            try {
                var email = jwt.verify(data.split("=")[1], process.env.JWT_KEY).email
                console.log(email)
                socket.join(email)
                socket.email = email
                console.log(socket.rooms)
                console.log(socket.id)
            } catch (err) {
                console.log("couldnt identify the email: " + data)
            }
        })

        //listen on new_message
        socket.on('newMessage', (data) => {
            //broadcast the new message
            io.to(data.room).emit('newMessage', { from: socket.email, message: data.message, room: data.room });
        })
    })
}


module.exports.setIO = setIO


//console.log(typeof (io.sockets.clients('room'))); // all users from room `room`