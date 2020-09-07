var express = require('express');
var User = require('../models/users');
const bodyParser = require('body-parser');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup',(req,res,next) => {
  User.findOne({ username: req.body.username })
      .then(user => {
        switch(user) {
          case null:
            return User.create({
              username: req.body.username,
              password: req.body.password
            });

          default:
            var err = new Error('User ' + req.body.username + ' already exists');
            err.status = 403;
            next(err);
        }
      })
      .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json({
          status: 'Registration Successful!',
          user: user
        });
      }, err => next(err))
      .catch(err => next(err));
});

router.post('/login', (req,res,next) => {
  if(!req.session.user) {
    var authHeader = req.headers.authorization;

    if(!authHeader) {
      var err = new Error('You are not authenthicated');
      res.setHeader('WWW-Authenticate','Basic');
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':') // Auth now contains username and password
    var username = auth[0];
    var password = auth[1];

    User.findOne({username: username})
        .then(user => {
          switch(user) {
            case null:
              var err = new Error('User ' + username + ' does not exist.');
              err.status = 403;
              return next(err);

            default:
              if (user.password !== password) {
                var err = new Error('Incorrect password');
                err.status = 403;
                return next(err);
              } else if (user.username === username && user.password === password) {
                req.session.user = 'authenticated';
                res.statusCode = 200;
                res.setHeader('Content-Type','text/plain');
                res.end('You are now authenticated');
              }
          }
        })
        .catch(err => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain');
    res.end('You are already authenticated');
  }
});

router.get('/logout', (req,res) => {
  if(req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
