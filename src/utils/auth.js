const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const jwt = require("jsonwebtoken");

const auth = require("express-basic-auth")
const Host = require("../models/auth")
const atob = require("atob")

const dotenv = require("dotenv")
dotenv.config()

passport.serializeUser(Host.serializeUser())
passport.deserializeUser(Host.deserializeUser())



passport.use(new LocalStrategy(Host.authenticate()))

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
    secretOrKey: process.env.TOKEN_PASSWORD
}

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, cb) => {
    Host.findById(jwtPayload._id, (err, host) => {
        if (err) return cb(err, false)
        else if (host) return cb(null, host)
        else return cb(null, false)
    })
}))



module.exports = {
    getToken: (user) => jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 3600})
}

