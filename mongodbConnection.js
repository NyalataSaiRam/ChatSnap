const mongoose = require('mongoose');

const connectToDB = async (url) => {
    try {
        await mongoose.connect(url);
        console.log('Connected to MongoDB');
    } catch (error) {
        throw new Error('error connecting to mongodb - ', error);
    }
};

module.exports = {
    connectToDB
};