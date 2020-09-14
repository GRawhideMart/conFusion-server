var passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

var jwt = require('jsonwebtoken');

var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

var config = require('./config');

const localAuthentication = new LocalStrategy(User.authenticate());

exports.local = passport.use(localAuthentication);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (user) => { // This function signs the token
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600 // in seconds
    })
};

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretKey
};

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload,done) => {
        console.log('JWT Payload: ' + jwt_payload);
        User.findOne({_id: jwt_payload._id},
            (err,user) => {
                if(err) return done(err,false);
                if(user) return done(null,user);
                else return done(null,false);
            })
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = (req,res,next) => {
    User.findOne({ _id: req.user._id })
        .then(user => {
            console.log('User: ',user);
            if(req.user.admin) {
                return next();
            } else {
                var err = new Error('Only admin can perform this operation');
                err.status = 403;
                return next(err);
            }
        }, err => next(err))
        .catch(err => next(err));
}