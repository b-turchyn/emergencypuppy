var express = require('express'),
    puppies = require('./lib/puppies');

var app = express();

app.engine('handlebars', require('./lib/handlebars-engine'));

app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.render('index', {
        puppy: puppies.randomKitten()
    });
});

app.get('/img/random', function (req, res) {
    res.redirect(302, puppies.randomKitten().imageUrl);
});

app.get('/img/:id', function (req, res, next) {
    var puppy = puppies.byId(req.params.id);

    if (!puppy) {
        return next();
    }

    res.redirect(302, puppy.imageUrl);
});

app.get('/puppy/:id', function (req, res, next) {
    var puppy = puppies.byId(req.params.id);

    if (!puppy) {
        return next();
    }

    res.render('index', {
        puppy: puppy
    });
});

// 404 handler (must come last)
app.get('*', function (req, res) {
    res.set('Status', 404);

    res.render('404', {
        puppy: puppies.randomKitten(),
        path  : decodeURIComponent(req.path),
        title : '404 Oh Noes!'
    });
});

var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Listening on port ' + port);
});
