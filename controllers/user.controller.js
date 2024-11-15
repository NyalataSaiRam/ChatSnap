
const User = require("../models/user.model");
const path = require('path');
const fs = require('fs');
const Message = require("../models/message.model");

const getUser = async (req, res) => {
    const user = await User.findById(req.user._id, { salt: 0, password: 0 }).populate('connections', { profilePic: 1, fullname: 1, hasUnreadMessages: 1 });

    return res.status(200).json(user);
};

const addToConnections = async (req, res) => {
    try {
        const userId = req.user._id;
        const { email } = req.body;

        // Find the friend by email
        const friend = await User.findOne({ email });
        if (!friend) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user is already connected
        const user = await User.findById(userId);
        if (user.connections.includes(friend._id)) {
            return res.status(400).json({ error: "Already connected" });
        }

        const friendUser = await User.findById(friend._id);
        if (friendUser.connections.includes(userId)) {
            return res.status(400).json({ error: "Already connected" });
        }

        // Update both users' connections in parallel
        await Promise.all([
            User.findByIdAndUpdate(userId, { $push: { connections: friend._id } }),
            User.findByIdAndUpdate(friend._id, { $push: { connections: userId } })
        ]);

        return res.status(200).json({ message: "Connection added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const updateUserProfile = async (req, res) => {
    const userDetails = JSON.parse((req.body.userDetails));

    if (req.file) {
        const user = await User.findById(req.user._id);
        if (user.profilePic !== 'profilePic.png') {
            const oldPic = user.profilePic;

            fs.unlink(path.join('public', 'images', oldPic), (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return;
                }
                console.log('File successfully deleted');
            });
            try {

                await User.findByIdAndUpdate(req.user._id, { $set: { profilePic: req.file.filename } });
            } catch (error) {
                console.error(error);
            }
        } else {
            try {

                await User.findByIdAndUpdate(req.user._id, { $set: { profilePic: req.file.filename } });
            } catch (error) {
                console.error(error);
            }

        }
    }

    try {

        const modifiedDetails = await User.findByIdAndUpdate(req.user._id, { ...userDetails }, { new: true }).select('-password -salt');
        return res.status(200).json(modifiedDetails);
    } catch (error) {

        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getSelectedUser = async (req, res) => {
    const id = req.params.id;
    let user;
    let conversations;
    try {

        user = await User.findById(id);
        const conversations = await Message.find({
            $or: [
                { receiver: id, sender: req.user._id },
                { receiver: req.user._id, sender: id }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({ user: user, conversations: conversations });
    } catch (error) {
        console.log(error);

    }
};


module.exports = {
    getUser,
    addToConnections,
    updateUserProfile,
    getSelectedUser
};