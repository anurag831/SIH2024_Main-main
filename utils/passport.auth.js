const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user.model')

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });

            //If the Email does not exist/registered
            if (!user) {
                return done(null, false, { message: "Email is not registered" })
            }

            //Verify the password
            const isMatch = await user.isValidPassword(password);
            if (isMatch) {
                return done(null, user);
            }
            else {
                return done(null, false, { message: 'Incorrect Password!' })
            }

        } catch (error) {
            done(error)
        }
    })
);


passport.serializeUser(function(user, cb) {
    cb(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser(async function(id, cb) {
    try {
        // Retrieve the full user object from the database by ID
        const user = await User.findById(id);
        cb(null, user); // Attach the full user object to req.user
    } catch (err) {
        cb(err);
    }
});