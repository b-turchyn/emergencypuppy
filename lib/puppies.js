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
    selectByImageVideo = 'SELECT * FROM puppies WHERE imageUrl = ? OR videoUrl = ? LIMIT 1',
    insert = 'INSERT INTO puppies (source, ip_address) VALUES (?, ?)',
    update = 'UPDATE puppies SET imageUrl = ?, videoUrl = ?, title = ? WHERE id = ?',
    deleteStmt = 'DELETE FROM puppies WHERE id = ?';

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
      var video = null;
      if(image.endsWith(".gif") || image.endsWith(".gifv")) {
        video = image.substring(0, image.lastIndexOf("."));
        image = null;
      }

      db.get(selectByImageVideo, image, video, function(err, row) {
        console.log(image, video, err, row);
        if(err === null && row === undefined) {
          db.run(update, image, video, title, id);
        } else {
          db.run(deleteStmt, id);
        }
      });
    }
};
