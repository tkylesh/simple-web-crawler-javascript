var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www.arstechnica.com";
var SEARCH_WORD = "stemming";
var MAX_PAGES_TO_VISIT = 10;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

pagesToVisit.push(START_URL);
crawl();

function crawl() {

  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit.");
    return;
  }
  var nextPage = pagesToVisit.pop();
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}


function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
     // Check status code (200 is HTTP OK)
     console.log("Status code: " + response.statusCode);
     if(response.statusCode !== 200) {
       callback();
       return;
     }
     // Parse the document body
     var $ = cheerio.load(body);
     var isWordFound = searchForWord($, SEARCH_WORD);
     if(isWordFound) {
       console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
     } else {
       collectInternalLinks($);
       // In this short program, our callback is just calling crawl()
       callback();
     }
  });
}



//this code will parse the page and search for a given word
function searchForWord($, word) {
	var bodyText = $('html > body').text();

	if(bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
		return true;
	}

	return false;
}

//gathers all relative links and add to pagesToVisit array
function collectInternalLinks($) {

    var relativeLinks = $("a[href^='/']");

    console.log("Found " + relativeLinks.length + " relative links on page");
    
    relativeLinks.each(function() {
        pagesToVisit.push(baseUrl + $(this).attr('href'));
    });
}

//this code will gather all of the relative and absolute hyperlinks on a given page
// function collectInternalLinks($) {

// 	var allRelativeLinks = [];

// 	var allAbsoluteLinks = [];

// 	var relativeLinks = $("a[href^='/']");
// 	relativeLinks.each(function() {
// 		allRelativeLinks.push($(this).attr('href'));
// 	});

// 	var absoluteLinks = $("a[href^='http']");

// 	absoluteLinks.each(function() {
// 		allAbsoluteLinks.push($(this).attr('href'));
// 	});

// 	console.log("Found: "+ allRelativeLinks.length + " relative links.");

// 	console.log("Found: "+ allAbsoluteLinks.length + " absolute links.");
// }

