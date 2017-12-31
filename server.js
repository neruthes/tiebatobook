var fs = require('fs');
var http = require('http');
var URL  = require('url');

var indexHtml = fs.readFileSync('./localserversources/index.html').toString();

var server = http.createServer(function (req, res) {
    // Testing
    // res.write(URL.parse(req.url).pathname);
    res.write(req.method + '\n');

    if (req.method === 'GET' && URL.parse(req.url).pathname === '/') {
        // Reading threads
        res.write(indexHtml);
    } else if (req.method === 'POST' && URL.parse(req.url).pathname.indexOf('/api/v1/readingProgressFloor/') === 0) {
        // API endpoints
        var threadId = URL.parse(req.url).pathname.replace('/api/v1/readingProgressFloor/', '');
        var newReadingProgressFloor = 
    } else {
        // Default to 404
        res.write('404 Not Found');
    }

    // End
    res.end();
});

server.on('upgrade', function (req, socket, head) {
    socket.write(
        'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        '\r\n'
    );
    socket.pipe(socket); // echo back
});


server.listen(9527);
