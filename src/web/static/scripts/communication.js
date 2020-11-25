var currentRoom = ""
var rooms = []
var messages = {}  /* every key is room name, their value is array of the messages.    
                     every element of the array is in such format: {from:"email", message: "content"} */
myFileReaders = {}
downloadingFileBuffers = {}

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
        if (data.message) {
            messageNode.innerText = data.from + ": " + data.message
            document.getElementById("messagesDiv").appendChild(messageNode);
        } else if (data.file) {
            messageNode.innerText = data.from + ": " + data.file.name + ", size: " + data.file.size / 1048576.0 + " MB"
            messageNode.id = data.file.id + "/p"
            messageNode.name = data.file.size
            document.getElementById("messagesDiv").appendChild(messageNode);
            messageNode.onclick = onDownloadTheFileClick
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
            link.download = 'data.txt';
            link.click();
            console.log(data.id)
        }
    })

    socket.on("endUpload", (data) => {
        console.log(data.id + " upload completed")
    })
}

function onDownloadTheFileClick(event) {
    var fileId = event.target.id.split("/")[0]
    if (!downloadingFileBuffers[fileId]) {
        downloadingFileBuffers[fileId] = { buffer: [], currentSlice: 0, size: event.target.name }
        socket.emit("downloadRequest", { id: fileId, currentSlice: 0 })
    }
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
    var sendFileButton = document.getElementById("sendFileButton")
    var messageFileButton = document.getElementById("messageFile")

    if (sendFileButton) {
        sendFileButton.onclick = function () {
            file = messageFileButton.files[0]
            var fileReader = new FileReader()
            var slice = file.slice(0, 100000);

            fileReader.readAsArrayBuffer(slice);
            fileReader.onload = (evt) => {
                var arrayBuffer = fileReader.result;
                socket.emit('slice upload', {
                    room: currentRoom,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: arrayBuffer
                });
            }
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

    if (sendFileButton) {
        sendFileButton.onclick = function () {
            var file = messageFileButton.files[0] // get the file
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
