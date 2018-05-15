var request = require('request'),
  puppies = require('../puppies');

module.exports = {
  canHandle: function(url) {
    return (url.lastIndexOf('https://imgur.com/', 0) === 0
      || url.lastIndexOf('http://imgur.com/', 0) === 0
      || url.lastIndexOf('http://www.imgur.com/', 0) === 0
      || url.lastIndexOf('https://www.imgur.com/', 0) === 0
      || url.lastIndexOf('http://www.imgur.com/', 0) === 0
      || url.lastIndexOf('https://i.imgur.com/', 0) === 0
      || url.lastIndexOf('http://i.imgur.com/', 0) === 0);
  },
  handle: function(id, url, callback) {
    var slash = url.lastIndexOf("/"),
        period = url.lastIndexOf(".");

    var slug = (period > slash ? url.substring(slash + 1, period) : url.substring(slash + 1));
    request("https://api.imgur.com/3/image/" + slug, {auth: {bearer: 'f7aa933db9ed8e2f54042a0f512320ae657a0338'}}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        var json = JSON.parse(body),
            entry = json['data'],
            title = entry['title'],
            image = entry['link'],
            permalink = "https://imgur.com/" + slug;

        puppies.update(id, permalink, image, title);
        callback(permalink, image, title);
      }
    });
  }
};
