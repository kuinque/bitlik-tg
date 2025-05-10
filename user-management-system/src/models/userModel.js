const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.saveUser = async function() {
    return await this.save();
};

userSchema.statics.findById = async function(id) {
    return await this.findById(id);
};

userSchema.statics.deleteUser = async function(id) {
    return await this.findByIdAndDelete(id);
};

const User = mongoose.model('User', userSchema);

module.exports = User;