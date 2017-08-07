var request = require('request')
    puppies = require('../puppies'),

module.exports = {
  canHandle: function(url) {
    var result = (url.lastIndexOf('https://www.reddit.com/', 0) === 0
        || url.lastIndexOf('http://www.reddit.com/', 0) === 0
        || url.lastIndexOf('http://redd.it/', 0) === 0
        || url.lastIndexOf('https://redd.it/', 0) === 0 );

    console.log(result);
    return result;
  },
  handle: function(id, url, callback) {
    request(url + ".json?limit=1", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body),
            entry = json[0]['data']['children'][0]['data'],
            permalink = "https://np.reddit.com" + entry['permalink'],
            image = entry['url'],
            title = entry['title'];

        if(image.lastIndexOf('http://imgur.com/', 0) === 0) {
          image = image.replace('http://imgur.com/', 'http://i.imgur.com/') + '.png';
        }
        if(image.lastIndexOf('https://imgur.com/', 0) === 0) {
          image = image.replace('https://imgur.com/', 'https://i.imgur.com/') + '.png';
        }

        puppies.update(id, permalink, image, title);
        callback(permalink, image, title);
      }
    });
  }
}
