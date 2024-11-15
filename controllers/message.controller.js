const Message = require("../models/message.model");

const saveMessage = async (req, res) => {
    const { message, receiverId } = req.body;

    try {

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            message: message
        });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'try again' });

    }

};

module.exports = {
    saveMessage
};