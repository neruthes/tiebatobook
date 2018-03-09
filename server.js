var fs = require('fs');
var http = require('http');
var uuidv4 = require('uuid/v4')
var URL = require('url');

var oneTimeAccessToken = uuidv4();
var indexHtml = fs.readFileSync('./browser_index.html').toString().replace(/6fdf6ffc-ed77-94fa-407e-a7b86ed9e59d/g, oneTimeAccessToken);

var parsePostFormData = function (formPostData) {
    return JSON.parse(
        '{' +
        formPostData.split('&').map(function (v) {
            return '"' + v.slice(0, v.indexOf('=')) + '":"' + v.slice(1 + v.indexOf('=')) + '"';
        }) +
        '}'
    );
};

var server = http.createServer(function (req, res) {
    // Testing
    // res.write(URL.parse(req.url).pathname);
    // res.write(req.method + '\n');

    if (req.method === 'GET' && URL.parse(req.url).pathname === '/') {
        // Reading threads
        res.write(indexHtml);
        res.end();
    } else if (req.method === 'POST' && URL.parse(req.url).pathname.indexOf('/api/v1/readingProgressFloor/') === 0) {
        // API endpoint > update reading progress
        var threadId = URL.parse(req.url).pathname.replace('/api/v1/readingProgressFloor/', '');
        var formPostData = '';
        req.on('error', function () {});
        req.on('data', function (chunk) {
            formPostData += chunk;
        });
        req.on('end', function () {
            res.setHeader('Content-Type', 'application/json');
            var formPostDataJsonObj = parsePostFormData(formPostData);
            console.log(formPostData);
            console.log(formPostDataJsonObj);
            var newReadingProgressFloor = formPostDataJsonObj.dataProgressFloor;
            var trackingInfoJson = JSON.parse(fs.readFileSync('./cache/tracking/' + threadId + '.json').toString());
            if (oneTimeAccessToken === formPostDataJsonObj.oneTimeAccessToken) {
                // Authentication success
                if (newReadingProgressFloor <= trackingInfoJson.latestAvailableFloor) {
                    trackingInfoJson.readingProgressFloor = Number(newReadingProgressFloor);
                    fs.writeFileSync('./cache/tracking/' + threadId + '.json', JSON.stringify(trackingInfoJson));
                    res.write(JSON.stringify({
                        'error': 0,
                        'message': 'Success.'
                    }));
                } else {
                    res.write(JSON.stringify({
                        'error': 2,
                        'message': 'newReadingProgressFloor must not be greater than latestAvailableFloor.'
                    }));
                };
            } else {
                res.write(JSON.stringify({
                    'error': 1,
                    'message': 'Wrong access token.'
                }));
            };
            res.end();
        });
    } else if (req.method === 'GET' && URL.parse(req.url).pathname.indexOf('/api/v1/catalog') === 0) {
        // API endpoint: get tracking info catalog
        res.setHeader('Content-Type', 'application/json');
        res.write(fs.readFileSync('./cache/tracking/trackingList-full.json'));
        res.end();
    } else if (req.method === 'GET' && URL.parse(req.url).pathname.indexOf('/api/v1/tracking/') === 0) {
        // API endpoint: get individual tracking info
        res.setHeader('Content-Type', 'application/json');
        var threadId = URL.parse(req.url).pathname.replace('/api/v1/tracking/', '');
        res.write(fs.readFileSync('./cache/tracking/' + threadId + '.json').toString());
        res.end();
    } else {
        // Default to 404
        res.write(JSON.stringify({
            'error': 1000404,
            'message': 'HTTP 404 Not Found.'
        }));
        res.end();
    }
});

server.on('upgrade', function (req, socket, head) {
    socket.write(
        'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
        'Upgrade: WebSocket\r\n' +
        'Connection: Upgrade\r\n' +
        '\r\n'
    );
    socket.pipe(socket);
});

server.listen(10482);
