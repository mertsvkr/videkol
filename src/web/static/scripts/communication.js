var currentRoom = ""
var currentCallId = ""
var comingCallId = ""
var rooms = [] //only roomNames
var roomInfo = {} /**every key is room name, their value is {title: "", messages: []} */
//                     every element of the messages array is in such format: {from:"email", message: "content" fileId: id, filType, fileSize, fileName} */
myFileReaders = {}
downloadingFileBuffers = {}
var socket = null
const { RTCPeerConnection, RTCSessionDescription } = window; // to create rtc objects in video call operations



function createSocketConnection() {
    socket = io.connect(URL_BASE)
    socket.emit("accountRoom", document.cookie)

    socket.on("newCallJoinRequest", (data) => {

    })

    socket.on("newRoomCreated", data => {
        if (!rooms.includes(data.roomName)) {
            rooms.push(data.roomName)
            roomInfo[data.roomName] = { title: data.roomTitle, messages: [] }
            refreshChatRoomList()
        }
    })

    socket.on("newMessage", data => {
        var messageObject = null
        if (data.file) {
            messageObject = {
                from: data.from,
                message: data.file.name + " size: " + data.file.size / 1048576.0 + " MB",
                fileId: data.file.id,
                fileType: data.file.type,
                fileSize: data.file.size,
                fileName: data.file.name
            }
        } else {
            messageObject = { from: data.from, message: data.message, fileId: null, fileType: null, fileSize: null, fileName: null }
        }
        roomInfo[data.room].messages.push(messageObject)

        if (currentRoom == data.room) { // if room is open, show the message on the screen
            createMessageNodeAndAdd(messageObject)
        }

    })

    // if the server wants more slice of the uploading file:
    socket.on('requestSliceUpload', (data) => {
        var place = data.currentSlice * 100000
        var slice = myFileReaders[data.id].file.slice(place, place + Math.min(100000, myFileReaders[data.id].file.size - place));
        myFileReaders[data.id].readAsArrayBuffer(slice)
    });

    socket.on("downloadFile", (data) => {
        downloadingFileBuffers[data.id].buffer.push(data.slice)
        downloadingFileBuffers[data.id].slice++
        if (downloadingFileBuffers[data.id].slice * 100000 < downloadingFileBuffers[data.id].size) {
            socket.emit("downloadRequest", { id: data.id, slice: downloadingFileBuffers[data.id].slice })
        } else {
            var link = document.createElement('a');
            link.style.display = 'none';
            document.body.appendChild(link);
            var blob = new Blob(downloadingFileBuffers[data.id].buffer, { type: 'text/plain' });
            var objectURL = URL.createObjectURL(blob);
            link.href = objectURL;
            link.href = URL.createObjectURL(blob);
            link.download = downloadingFileBuffers[data.id].name;
            link.click();
            console.log(data.id)
        }
    })

    socket.on("endUpload", (data) => {
        console.log(data.id + " upload completed")
    })

    socket.on("comingCall", (data) => {
        if (currentCallId == "" && comingCallId == "") {
            document.getElementById("acceptCall").style.display = "block"
            document.getElementById("comingCallInfo").innerText = "Room: " + roomInfo[data.room].title + ",By: " + data.from
        }
    })


}

function refreshChatRoomList() {
    var roomTemplate = document.querySelector('#roomTemplate');
    var cloneRoom = null
    // Clone the new row and insert it into the table
    var roomsDiv = document.getElementById("roomsDiv")
    roomsDiv.innerHTML = ""
    var i = rooms.length - 1;
    while (i >= 0) {
        cloneRoom = roomTemplate.content.cloneNode(true);
        console.log(cloneRoom)
        cloneRoom.firstElementChild.name = rooms[i]
        cloneRoom.firstElementChild.firstElementChild.name = rooms[i]

        cloneRoom.getElementById("roomTitle").innerHTML = roomInfo[rooms[i]].title
        cloneRoom.firstElementChild.onclick = selectRoomToChat
        roomsDiv.appendChild(cloneRoom)
        i--
    }
}
var testNode = document.querySelector('#roomTemplate').content.cloneNode(true)

function onDownloadTheFileClick(event) {
    var [fileId, fileName] = event.target.id.split("/./.")
    if (!downloadingFileBuffers[fileId]) {
        downloadingFileBuffers[fileId] = { buffer: [], currentSlice: 0, size: event.target.name, name: fileName }
        socket.emit("downloadRequest", { id: fileId, currentSlice: 0 })
    }
}

function selectRoomToChat(event) {
    console.log("room selected")
    currentRoom = event.srcElement.name
    document.getElementById("messagingDivPlaceholder").style.display = "none"
    document.getElementById("messagingDiv").style.display = "flex"
    document.getElementById("messagingRoomTitle").innerText = "Room: " + roomInfo[currentRoom].title
    setMessages()
}

function setMessages() {
    var messageTemplate = document.querySelector('#messageTemplate');
    var cloneMessage = null
    document.getElementById("messagesDiv").innerHTML = ""
    var messages = roomInfo[currentRoom].messages
    var i = 0
    while (i < messages.length) {
        createMessageNodeAndAdd(roomInfo[currentRoom].messages[i])
        i++
    }
}

function createMessageNodeAndAdd(messageObject) {
    var messageTemplate = document.querySelector('#messageTemplate');
    var cloneMessage = messageTemplate.content.cloneNode(true)
    cloneMessage.firstElementChild.firstElementChild.innerText = messageObject.from
    cloneMessage.firstElementChild.lastElementChild.innerText = messageObject.message
    if (messageObject.fileId) { //if this is a file 
        cloneMessage.firstElementChild.id = messageObject.fileId + "/./." + messageObject.fileName
        cloneMessage.firstElementChild.name = parseInt(messageObject.fileSize)
        cloneMessage.firstElementChild.onclick = onDownloadTheFileClick

        cloneMessage.firstElementChild.firstElementChild.id = messageObject.fileId + "/./." + messageObject.fileName
        cloneMessage.firstElementChild.firstElementChild.name = parseInt(messageObject.fileSize)
        cloneMessage.firstElementChild.firstElementChild.onclick = onDownloadTheFileClick

        cloneMessage.firstElementChild.lastElementChild.id = messageObject.fileId + "/./." + messageObject.fileName
        cloneMessage.firstElementChild.lastElementChild.name = parseInt(messageObject.fileSize)
        cloneMessage.firstElementChild.lastElementChild.onclick = onDownloadTheFileClick
    }

    document.getElementById("messagesDiv").appendChild(cloneMessage)
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
    var participantEmails = document.getElementById("newRoomParticipants")
    var newRoomTitle = document.getElementById("newRoomTitle")
    var sendMessageButton = document.getElementById("sendMessageButton")
    var messageFileInput = document.getElementById("messageFileInput")
    var messageTextInput = document.getElementById("messageTextInput")
    var sendCallRequestButton = document.getElementById("sendCallRequestButton")
    var acceptCallButton = document.getElementById("acceptCall")

    if (acceptCallButton) {
        acceptCallButton.onclick = function () {
            socket.emit("acceptCall", { id: comingCallId })
        }
    }

    if (createRoomButton) {
        createRoomButton.onclick = function () {
            console.log("createRoomButton clicked")
            $.ajax({
                type: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                },
                url: URL_BASE + "/api/communication/createroom",
                data: JSON.stringify({ "others": participantEmails.value.split(";"), roomTitle: newRoomTitle.value }),
                success: function (response) {
                    console.log(response)
                },
                error: function showErrorMessage(xhr, status, error) {
                    console.log(xhr)
                }
            });
        }
    }

    if (sendMessageButton) {
        sendMessageButton.onclick = function () {
            if (messageFileInput.files.length == 0) {
                socket.emit("newMessage", { room: currentRoom, message: messageTextInput.value })
            } else {
                var file = messageFileInput.files[0] // get the file
                var fileReader = new FileReader() //create new fileReader for every File
                fileReader.file = file // attach the file to its Reader

                //add the fileReader to the myFileReaders to get it after:
                var transferId = generateUUID() //generate an id for this specific transfer, use this id in both server and client
                myFileReaders[transferId] = fileReader
                myFileReaders[transferId].id = transferId


                //set the fileReader action which is called after preparing the buffer to send
                fileReader.onload = (e) => {
                    console.log("new slice loaded")
                    var arrayBuffer = e.target.result;
                    socket.emit("requestSliceUpload", {
                        id: e.target.id,
                        data: arrayBuffer
                    });
                }

                //to start the upload, send request to the server
                socket.emit('newFileUploadRequest', {
                    id: transferId,
                    room: currentRoom,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                });

            }
        }
    }

    if (sendCallRequestButton) {
        sendCallRequestButton.onclick = function () {
            if (currentCallId == "") {
                currentCallId = generateUUID()
                socket.emit("newVideoCall", { id: currentCallId, room: currentRoom })
            }
        }
    }
}




function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
