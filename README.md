# Tieba to Book

This is a utility software which fetches a thread on Tieba and converts it into a book-like version, so that you may be able to track the reading progress.

## Installation

* Clone this repository with `$ git clone https://github.com/joyneop/tiebatobook.git`.
* Run `$ npm install .`.

## Tracking

Put a list of all threads you would like to track. One URL per line. One line should look like `https://tieba.baidu.com/p/5490057397`. No query string.

## Fetching

## Cache

Several kinds of information are stored in `/cache`.

### Tracking

File: `/cache/tracking/{{ THREAD ID }}.json`.

Each JSON should look like:

```json
{
    "latestFetchedPageNumber": 1,
    "latestAvailableFloor": 17,
    "readingProgressFloor": 5,
    "isThreadAlive": true,
    "contents": {
        "1": "...",
        "2": "...",
        "5": "..."
    }
}
```

These files contain tracking progress and publishing progress. Need to be persistent through fetches.

### Fetched HTML

File: `/cache/tracking/{{ THREAD ID }}--{{ PAGE NUMBER }}.html`.

Simply fetched HTML files. Need to be cleared after each fetch.
