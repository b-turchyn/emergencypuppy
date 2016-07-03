var express = require('express'),
    crypto = require('crypto'),
    puppies = require('./lib/puppies'),
    valid = require('./lib/validator'),
    sqlite3 = require('sqlite3'),
    bodyParser = require('body-parser'),
    request = require('request'),
    cheerio = require('cheerio'),
    camoUrl = require('camo-url')({
        host: process.env.CAMO_HOST || 'https://s.btdev.org/camo',
        key: process.env.CAMO_KEY || 'jTZljkICfP1DxfMGTDISEgysgkbvFoqyLwEQGcFk6Rjq0aM0f2kZEjEaqQm7tyaT',
        type: process.env.CAMO_TYPE || 'path'
    });

var app = express();

var camo = function(url) {
  return camoUrl(url).replace('https://s.btdev.org/', 'https://s.btdev.org/camo/');
};

app.enable('etag')

app.engine('handlebars', require('./lib/handlebars-engine'));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', 'Tue, 04 Sep 2012 05:32:29 GMT');
  puppies.randomPuppy(function(puppy) {
    res.redirect('/puppy/' + puppy.id);
  });
});

app.get('/submit', function(req, res) {
  res.render('submit', {
    title: 'Submit a Puppy'
  });
});

app.post('/submit', function(req, res) {
  var errors = [];
  if( req.body.redditURL === undefined 
    || !valid.domainName(req.body.redditURL) ) {
      errors.push('Invalid URL');
  }

  if( errors.length === 0 ) {
    puppies.submit(req.body.redditURL, req.ip, function(result, id) {
      res.render('submit', {
        post: true,
        result: result
      });
      request(req.body.redditURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var $ = cheerio.load(body),
              selector = $("p.title > a"),
              image = selector.attr('href'),
              title = selector.text();
          if(image.lastIndexOf('http://imgur.com/', 0) === 0) {
            image = image.replace('http://imgur.com/', 'http://i.imgur.com/') + '.png';
          }
          if(image.lastIndexOf('https://imgur.com/', 0) === 0) {
            image = image.replace('https://imgur.com/', 'https://i.imgur.com/') + '.png';
          }

          puppies.update(id, image, title);
        }
      });
    });
  } else {
    res.render('submit', {
      post: true,
      errors: errors,
      result: false
    });
  }

});

app.get('/img/random', function (req, res) {
  puppies.randomPuppy(function(puppy) {
    res.redirect(302, camo(puppy.imageUrl));
  });
});

app.get('/img/:id.gif', function (req, res, next) {
  puppies.byId(req.params.id, function(puppy) {
    if (!puppy) {
        return next();
    }
    if( puppy.videoUrl !== null ) {
      res.redirect(302, camo(puppy.videoUrl + ".gif"));
    } else {
      res.redirect(302, camo(puppy.imageUrl));
    }
  });
});

app.get('/img/:id', function (req, res, next) {
  puppies.byId(req.params.id, function(puppy) {
    if (!puppy) {
        return next();
    }
    if( puppy.videoUrl !== null ) {
      res.redirect(302, camo(puppy.videoUrl + ".gifv"));
    } else {
      res.redirect(302, camo(puppy.imageUrl));
    }
  });
});

app.get('/puppy/:id', function (req, res, next) {
  puppies.byId(req.params.id, function(puppy) {
    if (!puppy) {
        return next();
    }
    sha = crypto.createHash('sha1');
    sha.update(puppy.source, 'utf8');
    res.set('ETag', sha.digest('hex'));
    res.render('index', {
        puppy: puppy,
        showOGP: true,
        urlPrefix: req.protocol + '://' + req.get('host') + '/'
    });
  });
});

// 404 handler (must come last)
app.get('*', function (req, res) {
    res.set('Status', 404);

    puppies.randomPuppy(function(puppy) {
      res.render('404', {
        puppy: puppy,
        path  : decodeURIComponent(req.path),
        title : '404 Oh Noes!'
      });
    });
});

var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});
