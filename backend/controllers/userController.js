const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


// Create a new user
const createUser = async (req, res) => {
    try {
        // Check if the username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }],
        });
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
            profilePicUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Create a new node in the tree
        const tree = await Tree.findOne({ root: savedUser._id });
        if (!tree) {
            // If the tree doesn't exist, create a new one with the user as the root
            const newTree = new Tree({
                root: savedUser._id,
                nodes: [{ user: savedUser._id }],
            });
            await newTree.save();
        } else {
            // If the tree exists, add the user as a new node
            tree.nodes.push({ user: savedUser._id });
            await tree.save();
        }

        res.status(201).json({ message: 'User created successfully', user: savedUser });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }

    res.status(201).json({ message: 'User created successfully', user: savedUser });
};

const getTree = async (req, res) => {
    try {
        const tree = await Tree.findOne().populate('nodes.user');
        res.status(200).json(tree);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a single user by ID
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a user
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user fields
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.aboutMe = req.body.aboutMe || user.aboutMe;

        if (req.body.password) {
            // If a new password is provided, hash it
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
        }

        if (req.file) {
            // If a new profile picture is uploaded, update the URL
            user.profilePicUrl = `/uploads/${req.file.filename}`;
        }

        // Save the updated user to the database
        const updatedUser = await user.save();
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the user from the database
        await user.remove();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getTree,
};