const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Create an instance of express
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, './')));

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/Smart-Power-tracker')
    .then(() => {
        console.log('DB Connected!');
    })
    .catch((err) => {
        console.log('Connection Error:', err);
    });

// Creating a schema for registration
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Creating a model
const UserModel = mongoose.model('Register-detail', userSchema);

// Route to serve the welcome page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './welcome.html'));
});

// Route to serve the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, './register.html'));
});

// Route to serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './login.html'));
});

// Route to handle registration form submission
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Save the new user
        const newUser = new UserModel({ username, email, password });
        await newUser.save();
        console.log('User registered:', newUser);
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Route to handle login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists and password matches
        const user = await UserModel.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        console.log('User logged in:', username);
        res.status(200).json({ message: 'Login successful', redirectUrl: '/main.html' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
