const mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }
});

// 이걸 const로 하면 안된다??
var user = module.exports = mongoose.model('User', userSchema);