const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const processPFP = require('./routes/processPFP');

const router = express.Router();

// User creation route
router.post('/users', processPFP.single('profilePic'), async (req, res) => {
    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user object
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            aboutMe: req.body.aboutMe,
        });

        // Check if a profile picture was uploaded
        if (req.file) {
            // Get the uploaded file details
            const uploadedFile = req.file;

            // Generate the profile picture URL
            const profilePicUrl = `/uploads/${uploadedFile.filename}`;

            // Set the user's profile picture URL
            newUser.profilePicUrl = profilePicUrl;
        }

        // Save the user to the database
        const savedUser = await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;