const express=require('express');
const mongoose=require('mongoose');
const port =6000;
const UserModel=require('./ModelSchemas/UserSchema');


const app=express();
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Grocery Store Application');
});
//router to create account
app.post('/CreateAccount',async(req,res)=>{
  try{
    const userData= await UserModel.create(req.body);
    res.status(200).json(userData)
  }
  catch{
console.log(error.message);
res.status(500).json({message:error.message});
  }

})

//router to Sign In the account
app.post('/SignIn',async(req,res)=>{
    const{email,password}=req.body;
    try {
        const validUser=await UserModel.findOne({email});
        if(validUser)
        {
           const validPassword=await UserModel.findOne({password});

           if(validPassword)
           {
             res.status(200).json({message:'Successfully Logged In'})
           }
           else
           {
            return res.status(500).json('Password Does not match');
           }

        }
        else{
          res.status(500).json({message:'Email not found. Try Creating a new Account'}
           
          );
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message:error.message});
    }
})




mongoose.connect('mongodb+srv://ahmadmirza9987:EsDADS9oMwvyw22F@grocerydata.pawgtnw.mongodb.net/?retryWrites=true&w=majority&appName=GroceryData')
.then(()=>{
    console.log('Connected to Grocery Store database');
    app.listen(port,()=>
    {
        console.log(`Server is listening to the port : ${port}`);
    })

})
.catch((error)=>{
    console.log(error);
})
