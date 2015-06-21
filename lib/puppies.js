require('js-yaml');

if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

var crypto = require('crypto'),
    sqlite3 = require('sqlite3');

var db = new sqlite3.Database(__dirname + '/../data/db.sqlite3');

db.serialize(function() {
  db.run('CREATE TABLE IF NOT EXISTS puppies(id integer PRIMARY KEY, source ' +
      'text(512), imageUrl text(512) unique null, videoUrl text(512) unique ' +
      'null, title TEXT(512) null, ip_address TEXT(64) NOT NULL, approved ' +
      'boolean not null default false)');
});

var selectApprovedStmt = 'SELECT * FROM puppies WHERE approved = \'t\'',
    selectUnapprovedStmt = 'SELECT * FROM puppies WHERE approved = \'f\'',
    selectAllStmt = 'SELECT * FROM puppies',
    selectRandom = 'SELECT * FROM puppies WHERE approved = \'t\' ORDER BY RANDOM() LIMIT 1',
    selectSpecific = 'SELECT * FROM puppies WHERE approved = \'t\' AND id = ? LIMIT 1',
    insert = 'INSERT INTO puppies (source, ip_address) VALUES (?, ?)',
    update = 'UPDATE puppies SET imageUrl = ?, videoUrl = ?, title = ? WHERE id = ?';

var puppyMap = {};

// Generate a unique id for each puppy.
db.each(selectApprovedStmt, function(err, row) {
// puppies.each(function (puppy) {
    var charCount = 8,
        sha       = crypto.createHash('sha1'),
        id, shortId;

    sha.update(row.source, 'utf8');

    id      = sha.digest('hex');
    shortId = id.substr(0, charCount);

    // Increase the length of the short id until it's unique.
    while (shortId in puppyMap) {
        shortId = id.substr(0, charCount += 1);
    }

    // puppy.id = shortId;
    puppyMap[shortId] = row;
});

module.exports = {
    byId: function (id, callback) {
      db.get(selectSpecific, id, function(err, row) {
        callback(row);
      });
    },

    byHash: function(hash) {
    },

    randomPuppy: function (callback) {
      db.get(selectRandom, function(err, row) {
        callback(row);
      });
    },

    submit: function(url, ip, callback) {
      db.run(insert, url, ip, function(err) {
        callback(err === null, this.lastID);
      });
    },

    update: function(id, image, title) {
      if(image.endsWith(".gif") || image.endsWith(".gifv")) {
        image = image.substring(0, image.lastIndexOf("."));
        db.run(update, null, image, title, id);
      } else {
        db.run(update, image, null, title, id);
      }
    }
};
