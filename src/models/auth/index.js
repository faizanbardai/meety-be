const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
 
const hostSchema = new Schema({
    
});
 
hostSchema.plugin(passportLocalMongoose);
 
module.exports = mongoose.model('Host', hostSchema);