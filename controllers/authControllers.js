//This .js file contain definitions of routers to create user, sign in, updating credentials and deletion of account.

const User=require('../Models/UserSchema.js');
const TempUser=require('../Models/TempUser.js');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const dotenv=require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();


const transporter=nodemailer.createTransport({
    service:'gmail',
    secure:true,
    port:465,
    auth:{
        //sender credential
    user:process.env.myMail,
    pass:process.env.myPass//less secure app password
    }
});

const sendVerificationEmail = async (newUser,userName,verCode)=>{
console.log(newUser);
console.log(userName);
console.log(verCode);
        try{
             await transporter.sendMail({
                   from:process.env.myMail,
                   to:newUser,
                   subject:'Account Verification',
                   text:`Dear ${userName}, Your account verification code is ${verCode}`});
          }
          catch(error)
          {
            console.log(error);
          }
   
}
const sendDeletionEmail=async(deleteUser,userName)=>{
    try {
        await transporter.sendMail({
            from:process.env.myMail,
            to:deleteUser,
            subject:'Request for Account Deletion',
            text:`Dear ${userName}, you request for account deletion has been approved.`
            });
    } catch (error) {
        console.log(error);
        res.status(404).json({message:`Unable to deliver mail`});
    }
}
const sendUpdateEmail=async(userEmail,userName)=>
{
    try  {
    await transporter.sendMail({
        from:process.env.myMail,
        to:userEmail,
        subject:'Update Account',
        text:`Dear ${userName}, Your account credentials have been updated`
    });
    } 
    catch (error) {
        console.log('Updating Email Sent');
        res.status(404).json();
     }
}
let secNum=0;
function generateRandomNumber(){
    return Math.floor(10000+Math.random()*90000);
}
//const jwt=require('jasonwebtoken');
exports.welcome=async(req,res)=>{
    res.send('Authorization Api');
}
exports.registerUser=async(req,res)=>{
    try
     {
      const newUser=await TempUser.create(req.body);
      console.log('Recepient Email : ', req.body.Email);
      secNum=generateRandomNumber();
      await sendVerificationEmail(newUser.Email,newUser.UserName,secNum);
     
      //defining a token  
         console.log('Secret Num = ' + secNum); 
         const token=jwt.sign(
           { firstName:newUser.FirstName,secondName:newUser.SecondName,userName:newUser.UserName,email:newUser.Email,number:newUser.Number},
            process.env.tokenCode,
            {expiresIn:'2h'}
     );
         return res.status(200).json({
           newUser,
            token
         });
       
    } 
    catch (error) 
    {
        console.log('Unable to register ',error); 
        //deleting from database
        await TempUser.deleteOne({Email:req.body.Email});
        res.status(500).json({error}); 
    }
}
exports.verifyUser = async (req, res) => {
    const { userName } = req.params;
    const { enteredCode } = req.body;
    console.log('Entered Code: ' + enteredCode);
    console.log('UserName: ' + userName);

    try {
        const userToVerify = await TempUser.findOne({ UserName: userName });
        if (!userToVerify) {
            console.log('User Not Found');
            return res.status(404).json({ message: `User ${userName} not found` });
        }
        
        if (enteredCode === secNum) {
            userToVerify.isVerify = true;
            await userToVerify.save();
        } else {
            console.log('Invalid verification code');
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (userToVerify.isVerify) {
            console.log('User has been verified successfully');
            const userObject = userToVerify.toObject();
            const VerifiedUser = await User.create(userObject);
            await TempUser.deleteOne({ Email: VerifiedUser.Email });

            return res.status(200).json({
                message: `User has been verified successfully.`,
                VerifiedUser
            });
        }
    } catch (error) {
        console.log('Error verifying user: ', error);
        return res.status(500).json({ error });
    }
};

exports.signIn=async(req,res)=>{
    const {Email,Password}=req.body;
    console.log('Email Entered :' + Email + '\n Password :' + Password);
    try {
        const validEmailHolder=await User.findOne({Email});
        if(!validEmailHolder)
        {
            return res.status(401).json({message:'Email not found'});
        }
        else
        {
            const isValidPassword=await bcrypt.compare(Password,validEmailHolder.Password);
            if(!isValidPassword)
            {
                return res.status(401).json({message:'Password does not match'});
            }
        }

        const token=jwt.sign(
               { id:validEmailHolder._id, email:validEmailHolder.Email},
               process.env.tokenCode,
               {expiresIn:'2h'}
        );
        console.log(`Successfully logged into your account`);
        return res.status(200).json({
            message:`Successfully logged into account registered on mail : ${Email}`,
            token
    } );
        
    } catch (error) {
        console.log('Unable to log in');
        res.status(500).json({message:error.message});
    }
}

exports.seeUser=async(req,res)=>{
    const {email}=req.params;
    const isUserExist=await User.findOne({Email:email});

    if(!isUserExist)
    {
        console.log('This user is not registred');
        res.status(404).json({message:'User not registered'});
    }
    else{
        const token=jwt.sign(
            {firstName:isUserExist.FirstName,secondName:isUserExist.SecondName,userName:isUserExist.UserName,number:isUserExist.Number},
            process.env.tokenCode,
            {expiresIn:'2h'}
        );
        res.status(200).send({
            FullName:`${isUserExist.FirstName} ${isUserExist.SecondName}`,
            Number:isUserExist.Number,
            token
        });
    }
}
exports.updateUser = async (req, res) => {
    const { userName } = req.params;
    console.log(userName);
    const { FirstName, SecondName, UserName,Email, Number, Password } = req.body;

    try {
        const isUserExist = await User.findOne({ UserName:userName });
        if (!isUserExist) {
            return res.status(401).json({ message: 'User Not Exists' });
        }

        const isValidPassword = await bcrypt.compare(Password, isUserExist.Password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Password does not match' });
        }
        isUserExist.FirstName = FirstName;
        isUserExist.SecondName = SecondName;
        isUserExist.UserName=UserName;
        isUserExist.Number = Number;
        isUserExist.Password = Password;
        await isUserExist.save();
        const token=jwt.sign(
            {firstName:isUserExist.FirstName,secondName:isUserExist.SecondName,userName:isUserExist.UserName,number:isUserExist.Number},
            process.env.tokenCode,
           { expiresIn:'2h'}
        );

        console.log('Updated the changes successfully');
        await sendUpdateEmail(Email,UserName);
        res.status(200).json(
            {
            isUserExist,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteUser=async(req,res)=>{
    const {userName}=req.params;
    const {Email,Password}=req.body;
    try{
    const isUserExist= await User.findOne({UserName:userName});
    if(!isUserExist)
    {
        console.log('User Does not Exist');
        res.status(404).json(error);
    }
     const isValidPassword=bcrypt.compare(isUserExist.Password,Password);
     if(!isValidPassword)
     {
        console.log('Password does not match credential');
        res.status(500).json(error);
     }
     //user name and password matched
     console.log('User Verified');
     await User.findOneAndDelete({UserName:userName});
     console.log('Account Deleted Successfully');
     const token=jwt.sign(
         {_id:isUserExist._id,Email:isUserExist.Email},
         process.env.tokenCode,
        {expiresIn:'2h'}
     );
     res.status(200).json({
        message:`Account with username ${userName} has been deleted`,
        token
    });
     await sendDeletionEmail(Email,userName);
    }
    catch(error){    
         console.log(error);
         res.status(404).json({message:'Unable To Delete Account'});
    }
     
};
