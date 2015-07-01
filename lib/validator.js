module.exports = {
  domainName: function(url) {
    var result = false;
    if (url.lastIndexOf('https://www.reddit.com/', 0) === 0
        || url.lastIndexOf('http://www.reddit.com/', 0) === 0
        || url.lastIndexOf('http://redd.it/', 0) === 0
        || url.lastIndexOf('https://redd.it/', 0) === 0 ) {
      result = true;
    }
    return result;
  }
};
