const mongoose=require('mongoose');
const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
});
const prodModel=mongoose.model('prodModel',productSchema);
