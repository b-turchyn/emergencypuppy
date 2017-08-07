var reddit = require('./reddit'),
  sources = [reddit];

var getHandler = function(url) {
  var result = null;
  sources.forEach(function(source) {
    if (source.canHandle(url)) {
      result = source;
    }
  });
  return result;
}

module.exports = {
  canHandle: function(url) {
    return getHandler(url) != null;
  },
  getHandler: getHandler,
  handle: function(id, url, callback) {
    var source = getHandler(url);
    source.handle(id, url, callback);
  }
}
