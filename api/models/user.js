const mongoose = require('mongoose');
module.exports = mongoose.model('user', new mongoose.Schema({
    id: String,
    user: String,
    password: String,
    isAdmin: Boolean
}));