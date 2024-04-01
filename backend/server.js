require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const formRoutes = require('./routes/formRoutes');
const cors = require('cors');

/**
 * Express App 
  ***/
const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Middleware
 */
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
/**
 * routes
 */
app.use('/api/user', userRoutes);
app.use('/api/contact', formRoutes)

/**
 * connect to db   
 */
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        //when db is available

        //listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB and listening port 4000');
        });

    })
    .catch((error) => {
        console.log(error);
    });