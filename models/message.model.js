const { Schema, model } = require("mongoose");


const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);


const Message = model('message', messageSchema);

module.exports = Message;