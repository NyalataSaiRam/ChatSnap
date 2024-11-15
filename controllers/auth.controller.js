const { generateToken } = require("../middlewares/authentication.middleware");
const User = require("../models/user.model");
const { createHmac } = require('crypto');

const signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        await User.create({
            fullname,
            email,
            password
        });
        return res.status(201).json({ message: "user created!" });

    } catch (error) {

        return res.status(201).json({ error });
    }


};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "user not found" });

        const hashpass = createHmac('sha256', user.salt).update(password).digest('hex');
        if (hashpass !== user.password) return res.status(401).json({ error: "Invalid Credentials" });

        const token = generateToken(user);

        return res.status(200).json({ token: token });

    } catch (error) {
        return res.status(404).json({ error: "User not found" });
    }
};

module.exports = {
    signup,
    login
};