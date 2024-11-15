const jwt = require('jsonwebtoken');
const generateToken = (user) => {
    const payload = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        messages: user.messages
    };
    return jwt.sign(payload, process.env.JWT_SECRET);


};

const verifyUser = (req, res, next) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) return res.status(401).json({ error: "You are not authorized!" });

    const token = authHeaders.split(' ')[ 1 ];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
};

module.exports = {
    generateToken,
    verifyUser
};