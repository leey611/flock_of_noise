const maxApi = require('max-api')
const io = require('socket.io-client')
let socket

maxApi.addHandler('connect', url => {
    socket = io(url)
    
    socket.on('talkback', msg => {
        maxApi.outlet('talkback', msg)
    })

    socket.on('pitch', data => {
        maxApi.outlet('pitch', data)
    })

    socket.on('depth', data => {
        maxApi.outlet('depth', data)
    })

    socket.on('harmonic', data => {
        maxApi.outlet('harmonic', data)
    })
})

maxApi.addHandler('disconnect', () => {
    socket.close()
})


maxApi.addHandler('message', msg => {
    socket.emit('message', msg)
})