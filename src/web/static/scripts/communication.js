var socket = null
function createSocketConnection() {
    socket = io.connect("http://127.0.0.1:3000")

}

