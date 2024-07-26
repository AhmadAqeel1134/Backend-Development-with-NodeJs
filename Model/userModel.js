const mongoose=require('mongoose');
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter name of person']
    },
    age:{
        type:Number,
        required:[true,'Please enter age of person'],
        default:0
    },
    CNIC:{
        type:Number,
        required:[true,'Enter CNIC of person'],
        default:0
    },
    DrumVoteCount:{
        type:Number,
        default:0
    },
    StickVoteCount:{
        type:Number,
        default:0
    }
});

const Citizen=mongoose.model('Citizen',userSchema);
module.exports=Citizen;