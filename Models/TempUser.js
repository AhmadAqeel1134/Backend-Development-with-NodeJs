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
TempUser.pre('save',async function(next){
    console.log('User Schema Pre');
    try {
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(this.Password,salt);
        this.Password=hashedPassword;
        next();
        
    } catch (error) {
        console.log('Unable to hash password');   
        next(error);
    }

})

const Temp=mongoose.model('Temp',TempUser);
module.exports=Temp;