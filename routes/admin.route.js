const User = require('../models/user.model');
const Warning = require('../models/warning');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');
const { Result } = require('express-validator');

// Route to list all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find();
        res.render('manage-users', { users });
    } catch (error) {
        next(error);
    }
});

// Route to display a user's profile and their warnings
router.get('/user/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error', 'Invalid Object Id');
            return res.redirect('/admin/users');
        }

        const person = await User.findById(id);
        if (!person) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        const warnings = await Warning.find({ userId: id })
            .sort({ createdAt: -1 }); // Sort warnings according to time

        res.render('profile', { person, data: warnings });
    } catch (error) {
        next(error);
    }
});


// Route to add a warning to a user
router.post('/user/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { warningValue } = req.body;

        if (!warningValue) {
            req.flash('error', 'Warning message is required');
            return res.redirect(`/admin/user/${id}`);
        }

        const warning = new Warning({
            warningValue: warningValue,
            userId: id, // Associate the warning with the user
        });

        await warning.save();

        // Redirect back to the user's profile page
        res.redirect(`/admin/user/${id}`);
    } catch (error) {
        next(error);
    }
});
// Route to update a user's role
router.post('/update-role', async (req, res, next) => {
    try {
        const { id, role } = req.body;

        // Validate id and role
        if (!id || !role) {
            req.flash('error', 'Invalid Request');
            return res.redirect('back');
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error', 'Invalid ID');
            return res.redirect('back');
        }

        const rolesArray = Object.values(roles);
        if (!rolesArray.includes(role)) {
            req.flash('error', 'Invalid Role');
            return res.redirect('back');
        }

        // Prevent an admin from removing themselves as admin
        if (req.user.id === id) {
            req.flash('error', 'Admin cannot remove themselves from admin');
            return res.redirect('back');
        }

        // Update the user's role
        const user = await User.findByIdAndUpdate(id, { role: role }, { new: true, runValidators: true });

        req.flash('info', `Updated role for ${user.name} to ${user.role}`);
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
});

module.exports = router;
