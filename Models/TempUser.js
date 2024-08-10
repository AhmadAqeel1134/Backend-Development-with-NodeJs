const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const TempUser=mongoose.Schema({
    FirstName:{
        type:String,
        required:true
    },
    SecondName:{
        type:String,
        required:true
    },
    UserName:{
        type:String,
        required:true,
        unique:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    Number:{
        type:Number,
        required:true,
        unique:true
    },
    Password:{
        type:String,
        required:true
    },
    isVerify:{
        type:Boolean,
        default:false
    }
});

const Temp=mongoose.model('Temp',TempUser);
module.exports=Temp;