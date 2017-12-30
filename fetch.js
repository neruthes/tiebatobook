var fs = require('fs');
var request = require('request');

//
// Import tracking list
//

var trackingListThreadsId = (function () {
    var trackingListThreadsIdMap = new Map();
    try {
        fs.readFileSync('tracking-list-private.txt').toString().trim().replace(/\n+/g, '\n').split('\n').map(function (each) {
            trackingListThreadsIdMap.set(each.replace(/^.+\//, ''), true);
        });
    } catch (e) {
    } finally {
    };
    fs.readFileSync('tracking-list.txt').toString().trim().replace(/\n+/g, '\n').split('\n').map(function (each) {
        trackingListThreadsIdMap.set(each.replace(/^.+\//, ''), true);
    });
    var tmp = [];
    trackingListThreadsIdMap.forEach(function () {
        tmp.push(arguments[1]);
    });
    // tmp = [ tmp[0] ]; // For testing
    return tmp;
})();
// Should look like [ '5490057397', '5490057398', '5490057399' ]

console.log('[ARR] trackingListThreadsId: ' + trackingListThreadsId);

//
// Build progress tracking JSON files for new threads
//

trackingListThreadsId.map(function (threadId) {
    var isNewThread = true;
    try {
        fs.readFileSync('./cache/tracking/' + threadId + '.json').toString();
        isNewThread = false;
    } catch (e) {
    } finally {
    }
    console.log('Thread ' + threadId + ' ' + (isNewThread ? 'is added to tracking list' : 'is already being tracked'));

    if (isNewThread) {
        fs.writeFileSync('./cache/tracking/' + threadId + '.json', JSON.stringify({
            'largestKnownPageNumber': 1, // We always need to fetch the latest fetched page again
            'latestFetchedPageNumber': 1, // We always need to fetch the latest fetched page again
            'latestAvailableFloor': 1, // We can assume the 1st floor must exist if the thread is alive
            'readingProgressFloor': 1, // The first floor should be marked already-read by default
            'isThreadAlive': true, // Assume the thread is alive
            'content': {
                '1': '{{ placeholder }}'
            }
        }))
    };
});

//
// Determine which to fetch
//

var urlsToFetchForThisTime = trackingListThreadsId.map(function (threadId) {
    // Have a look at how many pages are there in the thread

    (function () {
        var tmpThreadUrl = 'https://tieba.baidu.com/p/{{ id }}?see_lz=1'.replace('{{ id }}', threadId) + (Math.random() < 0.5 ? '&pn=1' : '');
        request(tmpThreadUrl, function (error, response, body) {
            if (body.indexOf('<iframe id="error_404_iframe" name="error_404_iframe" src="" frameborder="0" scrolling="no" width="1000" height="190"></iframe>') !== -1) {
                // 404 Not Found
                var trackingInfoJson = JSON.parse(fs.readFileSync('./cache/tracking/' + threadId + '.json').toString());
                trackingInfoJson.isThreadAlive = false;
                fs.writeFileSync('./cache/tracking/' + threadId + '.json', JSON.stringify(trackingInfoJson));
                console.log('\x1b[31m%s\x1b[0m', tmpThreadUrl + ' 404 Not Found!');
            } else {
                // 200 OK
                var threadTotalPages = Number(body.match(/<span class="red">(\d+)<\/span>/)[1]);
                var trackingInfoJson = JSON.parse(fs.readFileSync('./cache/tracking/' + threadId + '.json').toString());
                trackingInfoJson.largestKnownPageNumber = threadTotalPages;
                fs.writeFileSync('./cache/tracking/' + threadId + '.json', JSON.stringify(trackingInfoJson));
                console.log('\x1b[32m%s\x1b[0m', tmpThreadUrl + ':');
                console.log('total pages:', threadTotalPages);
            };
            console.log('\n');
        });
    })();

    // Generate the list of URLS to fetch in this thread

    var trackingInfoJson = JSON.parse(fs.readFileSync('./cache/tracking/' + threadId + '.json').toString());
    var urlsArr = (new Array(trackingInfoJson.largestKnownPageNumber - trackingInfoJson.latestFetchedPageNumber + 1)).fill(1).map(function (v, i) {
        return 'https://tieba.baidu.com/p/{{ id }}?see_lz=1&pn={{ page }}'.replace('{{ id }}', threadId).replace('{{ page }}', trackingInfoJson.latestFetchedPageNumber + i)
    });
    console.log('\nNeed to fetch:\n' + urlsArr);
    return urlsArr;
}).join().split(',');

//
// Fetch files
//

urlsToFetchForThisTime.map(function (url) {
    var fileName = url.match(/p\/(\d+)/)[1] + '--' + url.match(/=(\d+)$/)[1] + '.html';
    request(url, function (error, response, body) {
        fs.writeFileSync('./cache/tmp/html/' + fileName, body);
    });
});

//
// After all
//

console.log('\n');
