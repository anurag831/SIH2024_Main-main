const router = require('express').Router();
const User = require('../models/user.model');
const Warning = require('../models/warning')

router.get('/profile', async(req, res, next)=>{
    console.log(req.user);
    const person = req.user;
    const userId = req.user._id;

    const warnings = await Warning.find({ userId: userId }).sort({ createdAt: -1 }) || [];
    res.render('../views/profile', {person, data: warnings });

});

module.exports = router;