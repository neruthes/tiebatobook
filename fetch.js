var fs = require('fs');
var request = require('request');


// Global environment variables for debugging
var networkSilenceMode = false;
// networkSilenceMode = true;
if (networkSilenceMode) {
    console.log('\x1b[31m%s\x1b[0m', 'NetworkSilenceMode enabled. No network requests shall be sent.');
}

//
// Fetch files
//

var urlsToFetchForThisTime = JSON.parse(fs.readFileSync('./cache/tmp/urlsToFetchForThisTime.json').toString());

urlsToFetchForThisTime.map(function (url) {
    var fileName = url.match(/p\/(\d+)/)[1] + '--' + url.match(/=(\d+)$/)[1] + '.html';
    if (!networkSilenceMode) {
        request(url, function (error, response, body) {
            console.log('Downloading URL: ' + url);
            fs.writeFileSync('./cache/tmp/html/' + fileName, body);
        });
    }
});
