var mongoose = require('mongoose');

// article schema
var articleSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    author : {
        type: String,
        required: true
    },
    body : {
        type: String,
        required: true
    }
});

var article = module.exports = mongoose.model('Article', articleSchema);