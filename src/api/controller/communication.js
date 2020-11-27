const { isValidObjectId } = require("mongoose")
const User = require("../../models/User")
const { generateUUID, getSocketListOfARoom } = require("../../utils")

async function createRoomPost(req, res) {
    try {
        //create random name for rooms
        var roomName = generateUUID()

        //get every socket belonging to the account of the room creator.
        var createrSockets = getSocketListOfARoom(req.user.email)
        //join the sockets of the creator account
        createrSockets.forEach((socketItem) => {
            socketItem.join(roomName)
        })

        for (userEmail in req.body.others) {
            //get every socket belonging to the account of the other people.
            var sockets = getSocketListOfARoom(req.body.others[userEmail])
            //join the sockets of the account
            sockets?.forEach((socketItem) => {
                socketItem.join(roomName)
            })
        }

        io.to(roomName).emit("newRoomCreated", { roomName: roomName, roomTitle: req.body.roomTitle })

        res.status(200).send({ success: true, chatroom: roomName })
    } catch (err) {
        console.log(err)
        res.status(400).send({ success: false, error: "Chatroom is not created." })
    }
}

module.exports.createRoomPost = createRoomPost

