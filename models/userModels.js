const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/blogs');

const userSchema = mongoose.Schema({
    username: {
        type: String
    },
    name:{
        type: String
    },
    age:{
        type: Number
    },
    email:{
        type: String
    },
    password:{
        type: String
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post'
        }
    ]
});

module.exports = mongoose.model('user', userSchema);