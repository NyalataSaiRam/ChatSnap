const express = require('express');
const { getUser, addToConnections, updateUserProfile, getSelectedUser } = require('../controllers/user.controller');
const upload = require('../middlewares/fileUpload');

// user is already verified
const router = express.Router();


router.get('/', getUser);
router.post('/updateProfile', upload.single('file'), updateUserProfile);
router.patch('/addToConnection', addToConnections);


router.get('/:id', getSelectedUser);


module.exports = router;