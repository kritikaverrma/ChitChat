const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/userModel'); // adjust path

const createGuestUser = async () => {
    await mongoose.connect(process.env.MONGODB_URI); // change DB name

    const existing = await User.findOne({ email: 'guestuser@test.com' });
    if (existing) {
        console.log('Guest user already exists');
        return process.exit();
    }


    await User.create({
        name: 'Guest User',
        email: 'guestuser@test.com',
        password: '12346789',
        pic: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
    });

    console.log('Guest user created!');
    process.exit();
};

createGuestUser();
