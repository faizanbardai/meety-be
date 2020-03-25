const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const dotenv = require("dotenv");
dotenv.config();

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_PASSWORD
};

passport.use(
  new JwtStrategy(jwtOptions, (jwtPayload, cb) => {
    User.findById(jwtPayload._id, (err, user) => {
      if (err) return cb(err, false);
      else if (user) return cb(null, user);
      else return cb(null, false);
    });
  })
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.CLIENT_URL + "/auth/facebook/callback",
      profileFields: ["id", "displayName", "picture.type(large)", "emails"]
    },
    async (accessToken, refreshToken, profile, done) => {
      const userExists = await User.findOne({ facebookID: profile.id });
      if (userExists) return done(null, userExists);
      else {
        const newUser = await User.create({
          username: profile.emails[0].value,
          name: profile.displayName,
          facebookID: profile.id,
          picture: profile.photos
            ? profile.photos[0].value
            : "http://via.placeholder.com/360x360"
        });
        return done(null, newUser);
      }
    }
  )
);

// passport.use(
//   "fb",
//   new FbStrategy(
//     {
//       clientID: process.env.FB_ID,
//       clientSecret: process.env.FB_SECRET
//     },
//     async (accessToken, refreshToken, fbProfile, next) => {
//       try {
//         const user = await User.findOne({ facebookID: fbProfile.id });
//         if (user) {
//           return next(null, user);
//         } else {
//           const newUser = await User.create({
//             role: "User",
//             facebookID: fbProfile.id,
//             username: fbProfile.emails[0].value
//           });
//           return next(null, newUser);
//         }
//       } catch (error) {
//         return next(error);
//       }
//     }
//   )
// );

module.exports = {
  getToken: user =>
    jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 360000 })
};
