const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("./models/User");

const router = express.Router();

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

// Profile picture upload route
router.post(
    "/users/:id/profile-picture",
    upload.single("profilePic"),
    async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Get the uploaded file details
            const uploadedFile = req.file;

            // Generate the profile picture URL
            const profilePicUrl = `/uploads/${uploadedFile.filename}`;

            // Update the user's profile picture URL in the database
            user.profilePicUrl = profilePicUrl;
            await user.save();

            res.json({
                message: "Profile picture uploaded successfully",
                profilePicUrl,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
);

module.exports = router;
