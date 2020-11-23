var currentRoom = ""
var rooms = []
var messages = {}  /* every key is room name, their value is array of the messages.    
                     every element of the array is in such format: {from:"email", message: "content"} */

var socket = null
function createSocketConnection() {
    socket = io.connect("http://127.0.0.1:3000")
    socket.emit("accountRoom", document.cookie)

    socket.on("newMessage", data => {
        if (messages[data.room]) { // if the room already exists 
            messages[data.room].push({ from: data.from, message: data.message })
        } else { //if not create and push the message
            addRoom(data.room)
            messages[data.room] = [{ from: data.from, message: data.message }]
        }
        var messageNode = document.createElement("p")
        messageNode.innerText = data.from + ": " + data.message
        document.getElementById("messagesDiv").appendChild(messageNode);
    })
}

function selectRoomToChat(event) {
    currentRoom = event.srcElement.name
}

function addRoom(roomName) {
    rooms.push(roomName)
    var buttonNode = document.createElement("button")
    buttonNode.name = roomName
    buttonNode.innerText = roomName
    buttonNode.onclick = selectRoomToChat
    document.getElementById("roomsDiv").appendChild(buttonNode);
}



function setCommunicationButtonActions() {
    var createRoomButton = document.getElementById("createRoomButton")
    var sendMessageButton = document.getElementById("sendMessageButton")
    var messageText = document.getElementById("messageText")
    var participantEmails = document.getElementById("participantEmails")

    if (createRoomButton) {
        createRoomButton.onclick = function () {
            console.log("createRoomButton clicked")
            $.ajax({
                type: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                },
                url: "http://127.0.0.1:3000/api/communication/createroom",
                data: JSON.stringify({ "others": participantEmails.value.split(";") }),
                success: function (response) {
                    console.log(response)
                    addRoom(response.chatroom)
                },
                error: function showErrorMessage(xhr, status, error) {
                    console.log(xhr)
                }
            });
        }
    }

    if (sendMessageButton) {
        sendMessageButton.onclick = function () {
            socket.emit("newMessage", { room: currentRoom, message: messageText.value })
        }
    }
}