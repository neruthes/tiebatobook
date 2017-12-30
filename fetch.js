var fs = require('fs');
var request = require('request');

//
// Import tracking list
//

var trackingListThreadsId = (function () {
    var trackingListThreadsIdMap = new Map();
    fs.readFileSync('tracking-list.txt').toString().trim().replace(/\n+/g, '\n').split('\n').map(function (each) {
        trackingListThreadsIdMap.set(each.replace(/^.+\//, ''), true);
    });
    try {
        fs.readFileSync('tracking-list-private.txt').toString().trim().replace(/\n+/g, '\n').split('\n').map(function (each) {
            trackingListThreadsIdMap.set(each.replace(/^.+\//, ''), true);
        });
    } catch (e) {
    } finally {
    };
    var tmp = [];
    trackingListThreadsIdMap.forEach(function () {
        tmp.push(arguments[1]);
    });
    return tmp;
})();
// Should look like [ '5490057397', '5490057398', '5490057399' ]

console.log(trackingListThreadsId);

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
            'latestFetchedPageNumber': 1, // We always need to fetch the latest fetched page again
            'latestAvailableFloor': 1, // We can assume the 1st floor must exist if the thread is alive
            'readingProgressFloor': 1, // The first floor should be marked already-read by default
            'isThreadAlive': true, // Assume the thread is alive
            'content'
        }))
    };
});

//
// Determine which to fetch
//

//
// Fetch files
//
