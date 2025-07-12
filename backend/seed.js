// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

// Load environment variables (DB connection string)
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('MongoDB connected...');


        // Create test users
        const users = [
            {
                name: 'Alice',
                email: 'alice@example.com',
                password: await bcrypt.hash('123456', 10),
                picture: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            },
            {
                name: 'Bob',
                email: 'bob@example.com',
                password: await bcrypt.hash('123456', 10),
                picture: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            },
            {
                name: 'Charlie',
                email: 'charlie@example.com',
                password: await bcrypt.hash('123456', 10),
                picture: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            },
            {
                name: 'Guest User',
                email: 'guest@example.com',
                password: await bcrypt.hash('123456', 10),
                picture: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            }
        ];

        await User.insertMany(users);

        console.log('✅ Test users created successfully!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
