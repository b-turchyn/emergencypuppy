require('js-yaml');

var crypto = require('crypto');

var puppies   = require(__dirname + '/../data/puppies.yml'),
    puppyMap = {};

// Generate a unique id for each puppy.
puppies.forEach(function (puppy) {
    var charCount = 8,
        sha       = crypto.createHash('sha1'),
        id, shortId;

    sha.update(puppy.url, 'utf8');

    id      = sha.digest('hex');
    shortId = id.substr(0, charCount);

    // Increase the length of the short id until it's unique.
    while (shortId in puppyMap) {
        shortId = id.substr(0, charCount += 1);
    }

    puppy.id = shortId;
    puppyMap[shortId] = puppy;
});

module.exports = {
    byId: function (id) {
        return puppyMap[id];
    },

    randomKitten: function () {
        return puppies[Math.floor(Math.random() * puppies.length)];
    }
};
