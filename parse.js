var fs = require('fs');
var request = require('request');


// Global environment variables for debugging
var networkSilenceMode = false;
// networkSilenceMode = true;
if (networkSilenceMode) {
    console.log('\x1b[31m%s\x1b[0m', 'NetworkSilenceMode enabled. No network requests shall be sent.');
}


//
// Parse downlaoded HTML to get contents and save them to progress tracking JSON files
//

var urlsToFetchForThisTime = JSON.parse(fs.readFileSync('./cache/tmp/urlsToFetchForThisTime.json').toString());

urlsToFetchForThisTime.map(function (url, index) {
    console.log('URL of current document: ' + url);
    var threadId = url.match(/p\/(\d+)/)[1];
    var trackingInfoJson = JSON.parse(fs.readFileSync('./cache/tracking/' + threadId + '.json').toString());
    var pageNumber = url.match(/=(\d+)$/)[1];
    var fileName = threadId + '--' + pageNumber + '.html';
    var fileHtmlText = fs.readFileSync('./cache/tmp/html/' + fileName).toString();
    console.log('fileHtmlText.match: ' + fileHtmlText.match(/<cc>\s*.+?\s*<\/cc>/g));
    var postContents = fileHtmlText.match(/<cc>\s*.+?\s*<\/cc>/g).map(function (v, i) {
        return v.replace(/^<cc>\s*?<div .+?">\s*/, '').replace(/<\/div><br>\s*<\/cc>$/, '').trim().replace(/<a href=".+?" onclick=".+?">(.+?)<\/a>/g, '$1');
    });
    console.log(fileHtmlText.match(/>\d+楼</g));
    if (fileHtmlText.match(/reply_num:(\d+),/)[1] === '1') {
        // Only one floor
        var postFloors = [ '1' ];
    } else {
        // Multiple floors
        var postFloors = fileHtmlText.match(/>\d+楼</g).map(function (v, i) {
            return v.match(/\d+/)[0];
        });
    };
    postFloors.map(function (v, i) {
        trackingInfoJson.contents[v] = postContents[i];
        trackingInfoJson.latestAvailableFloor = Number(v);
    });
    trackingInfoJson.latestFetchedPageNumber = Number(pageNumber);
    fs.writeFileSync('./cache/tracking/' + threadId + '.json', JSON.stringify(trackingInfoJson));
});
