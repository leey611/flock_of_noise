const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html')
// })

app.use(express.static('public'))

io.on('connection', socket => {
    console.log('a user connected')

    socket.on('message', msg => {
        io.emit('message', msg)
    })

    socket.on('disconnect', function() {
        console.log('user disconnect')
    })

    socket.on('talkback', msg => {
        socket.broadcast.emit('talkback', msg)
    })

    socket.on('pitch', data => {
        socket.broadcast.emit('pitch', data)
    })

    socket.on('depth', data => {
        socket.broadcast.emit('depth', data)
    })

    socket.on('harmonic', data => {
        socket.broadcast.emit('harmonic', data)
    })


})

http.listen(3000, () => {
    console.log('server listening on port 3000')
})

