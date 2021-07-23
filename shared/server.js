const { createServer } = require('http')

function startServer(mw, port) {
    createServer(mw.execute.bind(mw))
        .listen(port, () => console.log('server is ready to accept connections on port', port))
}

module.exports = startServer
