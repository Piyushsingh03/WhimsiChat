const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullname: {type:String, required:true},
    username:{type:String, require:true, unique:true},
    email:{type:String, require:true, unique:true},
    password:{type:String, require:true, unique:true}
},{timestamps:true})


 const UserModel = mongoose.model('User',UserSchema);
 module.exports = UserModel