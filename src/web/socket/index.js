const jwt = require("jsonwebtoken")

var files = {}
var struct = {
    from: null,
    room: null,
    name: null,
    type: null,
    size: 0,
    data: [],
    slice: 0,
};

var currentCalls = {

}

async function setIO(server) {
    global.io = require("socket.io")(server)
    io.on('connection', (socket) => {
        console.log('New user connected')

        // grouping the sockets (different tabs or different platforms, windows etc.) which belong to the same account
        // accountroom = email of the account
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
        socket.on("newMessage", (data) => {
            //broadcast the new message
            io.to(data.room).emit("newMessage", { from: socket.email, message: data.message, room: data.room });

        })

        /**file operations******************* */


        // save the file transfer id and create a record for the file in "files"
        socket.on("newFileUploadRequest", async (data) => {
            if (!files[data.id]) {
                files[data.id] = Object.assign({}, struct, data);
                files[data.id].data = [];
                files[data.id].from = socket.email
                socket.emit("requestSliceUpload", { id: data.id, currentSlice: 0 })
            }
        })


        // request the slices of the uploading file. 
        // if upload is done, emit the file info as message to the others in the room it.
        socket.on("requestSliceUpload", async (data) => {
            files[data.id]?.data.push(data.data);
            files[data.id].slice++;

            if (files[data.id].slice * 100000 >= files[data.id].size) {
                // tell the user that uploading is finished.
                socket.emit('endUpload', { id: data.id, file: files[data.id].data });
                io.to(files[data.id].room).emit("newMessage",
                    {
                        room: files[data.id].room, from: socket.email,
                        file: { id: data.id, name: files[data.id].name, size: files[data.id].size, type: files[data.id].type }
                    }
                )
            } else { // request the next slice of the file.
                socket.emit('requestSliceUpload', {
                    id: data.id,
                    currentSlice: files[data.id].slice
                });
            }
        })

        socket.on("downloadRequest", async (data) => {
            socket.emit("downloadFile", { id: data.id, slice: files[data.id].data[data.currentSlice] })
        })


        socket.on("newVideoCall", (data) => {
            currentCalls[data.id] = { room: data.room, currentParticipantSocketIds: [] }
            currentCalls[data.id].currentParticipantSocketIds.push(socket.id)
            console.log("new video call")
            socket.to(data.room).emit("comingCall", { room: data.room, id: data.id, from: socket.email, type:data.type })
        })

        socket.on("acceptCall", (data) => {
            currentCalls[data.id].currentParticipantSocketIds.forEach(element => {
                if (element != socket.id) {
                    socket.to(element).emit("newCallJoinRequest", { id: data.id, peer: socket.id, peerEmail: socket.email, type:data.type })
                }
            });
            currentCalls[data.id].currentParticipantSocketIds.push(socket.id)
        })

        socket.on("sendOffer", (data) => {
            socket.to(data.peer).emit("receiveOffer", { id: data.id, offer: data.offer, peer: socket.id, peerEmail: socket.email })
        })

        socket.on("sendAnswer", (data) => {
            socket.to(data.peer).emit("receiveAnswer", { id: data.id, peer: socket.id, answer: data.answer })
        })

        socket.on("sendLastOffer", (data) => {
            socket.to(data.peer).emit("receiveLastOffer", { id: data.id, peer: socket.id, offer: data.offer })
        })

    })
}


module.exports.setIO = setIO