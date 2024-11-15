const { Schema, model } = require('mongoose');
const { randomBytes, createHmac } = require('crypto');

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
    },
    profilePic: {
        type: String,
        default: "profilePic.png"
    },
    messages: [ {
        type: Schema.Types.ObjectId,
        ref: 'message'
    } ],
    connections: [ {
        type: Schema.Types.ObjectId,
        ref: 'user'
    } ],
    gender: {
        type: String
    },
    age: {
        type: String
    },
    profession: {
        type: String
    },
    description: {
        type: String
    }
}, { timestamps: true });

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hash = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hash;

    next();
});

const User = model('user', userSchema);

module.exports = User;