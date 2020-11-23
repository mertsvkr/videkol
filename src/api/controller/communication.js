const User = require("../../models/User")


async function createRoomPost(req, res) {
    try {
        //create random name for rooms
        var roomName = Math.random().toString()

        //get every socket belonging to the account of the room creator.
        var socketIDs = io.sockets.adapter.rooms.get(req.user.email)
        //join the sockets of the creator account
        socketIDs.forEach((ID) => {
            io.sockets.sockets.get(ID).join(roomName)
        })

        for (userEmail in req.body.others) {
            //get every socket belonging to the account of the other people.
            console.log(req.body.others[userEmail])
            var socketIDs = io.sockets.adapter.rooms.get(req.body.others[userEmail])
            //join the sockets of the account
            socketIDs?.forEach((ID) => {
                io.sockets.sockets.get(ID).join(roomName)
            })
        }
        res.status(200).send({ success: true, chatroom: roomName })
    } catch (err) {
        console.log(err)
        res.status(400).send({ success: false, error: "Chatroom is not created." })
    }
}

module.exports.createRoomPost = createRoomPost