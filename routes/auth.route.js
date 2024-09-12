const router = require('express').Router();
const User = require('../models/user.model');
const {body, validationResult} = require('express-validator');
const passport = require('passport');
const connectEnsure = require('connect-ensure-login')

router.get('/login', connectEnsure.ensureLoggedOut({redirectTo: '/'}), async (req, res, next) => {
    res.render('../views/login');

});

router.post('/login',connectEnsure.ensureLoggedOut({redirectTo: '/'}), passport.authenticate('local', {
    // successRedirect: "/",
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true 
}));


router.get('/register', connectEnsure.ensureLoggedOut({redirectTo: '/'}), async (req, res, next) => {    
    res.render('../views/register');
});

router.post('/register', connectEnsure.ensureLoggedOut({redirectTo: '/'}), [
    body('email').trim().isEmail().withMessage('Email must be a valid email').normalizeEmail().toLowerCase(),
    body('password').trim().isLength(2).withMessage("Password is required minimum 2 charecters"),
    body('password2').custom((value, {req})=>{
        if(value !== req.body.password){
            throw new Error('Confirm password do not match')
        }
        return true;
    })

],async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            errors.array().forEach((error) => {
                req.flash('error', error.msg)                
            });
            res.render('../views/register', {address: req.body.address, pincode: req.body.pincode, city: req.body.city, state: req.body.state, name: req.body.name, email: req.body.email, messages: req.flash()});
            return;
        }

        const {email} = req.body;
        const doesExist = await User.findOne({email});
        if(doesExist){
            req.flash('error', 'Email already registered' )
            res.redirect('/auth/register')
            return;
        }

        const user = new User(req.body);
        await user.save();
        req.flash('success', `${user.email} registered successfully. You can now login`)
        res.redirect('/auth/login')
        // res.send(user);
        // res.send(req.body);

    } catch (error) {
        next(error);
    }
});


router.get('/logout', connectEnsure.ensureLoggedIn({redirectTo: '/'}), (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'You have logged out successfully');
        res.redirect('/');
    });
});


module.exports = router;

// function ensureAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//         next();
//     }else{
//         res.redirect('/auth/login');
//     }
// }    

// function ensureNOTAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//         res.redirect('back');
//     }else{
//         next();
//     }
// }    