//This .js file contain definitions of routers to create user, sign in, updating credentials and deletion of account.

const User=require('../Models/UserSchema.js');
const TempUser=require('../Models/TempUser.js');
const TempAdmin=require('../Models/tempAdmin.js');
const Admin=require('../Models/Admin.js');
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
    pass: process.env.myPass//less secure app password
    }
});

//Functions to send information/verification codes to Registered Users

const sendVerificationEmail = async (newUser,userName,verCode)=>{
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

const sendInformingMailToUser=async(adminName,userName,UserEmail)=>{
   try
   { 
    await transporter.sendMail({
        from:process.env.myMail,
        to:UserEmail,
        subject:'Admin Updated Your Credentials',
        text:`Dear ${userName}, admin ${adminName} had updated your credentials. Log in to see the changes.\n`
    });
   }catch(error)
   {
       console.log('Unable to send Email');
      return res.status(404).json({message:`Unable to send Email`});
  }
}

const sendDeletionEmailbyAdmin=async(userName, userEmail,adminName)=>{
   try 
   {
    transporter.sendMail({
        from:process.env.myMail,
        to:userEmail,
        subject:'Account Deletion',
        text:`Dear ${userName} , Admin ${adminName} has deleted your account.`
    });
   } 
   catch (error) {
    console.log('Error ' + error);
    return res.status(404).json({message:error.message});
   }
}

const sendPasswordVerCode=async(userName,userEmail,SecCode)=>{
    try {
        transporter.sendMail({
            from:process.env.myMail,
            to:userEmail,
            subject:'Verification Code for Password Change',
            text:`Dear ${userName} , your code for password change verification is ${SecCode}`
        });
        
    } catch (error) {
        console.log('Unable to send mail');
        return res.status(500).json({message:`Unable to Send Mail`});
    }
}

let SecNum=0;

function generateRandomNumber(){
    return Math.floor(10000+Math.random()*90000);
}

exports.welcome=async(req,res)=>{
    res.send('Authorization Api');
}

//end points for user functionality

exports.registerUser=async(req,res)=>{
    try
     {
      const newUser=await TempUser.create(req.body);
      console.log('Recepient Email : ', req.body.Email);
       SecNum=generateRandomNumber();
      await sendVerificationEmail(newUser.Email,newUser.UserName,SecNum);
     
      //defining a token  
         console.log('Secret Num = ' + SecNum); 
         const token=jwt.sign(
           { firstName:newUser.FirstName,secondName:newUser.SecondName,userName:newUser.UserName,email:newUser.Email,number:newUser.Number},
            process.eny.SecStamp,
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
        //deleting from temporary database 
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
        console.log('Sec Num ' +SecNum);
        if (enteredCode === SecNum) {
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
               process.eny.SecStamp,
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

exports.Seeuser=async(req,res)=>{
    const { userName } = req.params;
    console.log('Username   ' + userName);
    const isUserExist=await User.findOne({UserName:userName});
    if(!isUserExist)
    {
        console.log('This user is not registred');
        res.status(404).json({message:'User not registered'});
    }
    else
    {
        const token=jwt.sign(
            {firstName:isUserExist.FirstName,secondName:isUserExist.SecondName,userName:isUserExist.UserName,number:isUserExist.Number},
            process.eny.SecStamp,
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
    const { FirstName, SecondName, UserName,Email, Number, Password } = req.body;

    try {
        const isUserExist = await User.findOne({ Email:Email });
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
            process.eny.SecStamp,
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
         process.eny.SecStamp,
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

//Forgot Password Flow
exports.forgetPassword=async(req,res)=>{
    const{Email}=req.body;
    console.log('Email : ' + Email);
    const isUserExist=await User.findOne({Email:Email});
    if(!isUserExist)
    {
        console.log('Email not found');
        return res.status(404).json({message:error.message});
    }
     console.log('User Found');
     SecNum=generateRandomNumber();
     console.log('Sec Num  ' +  SecNum);
   await  sendPasswordVerCode(isUserExist.UserName,isUserExist.Email,SecNum);
     return res.status(200).json({message:`Verification code sent to ${isUserExist.Email}`});
}
exports.changePassword=async(req,res)=>{
    const{Email,NewPassword,enteredCode}=req.body;
    console.log('Email = ', Email);
    console.log('Secret Number = ' , SecNum);
    console.log('EnterdCode = ',enteredCode);
    try{
        console.log('try mein aya hai');
    if(enteredCode===SecNum)
    {
        console.log('if condition chali hai');
          //let us update its password
          const isUserExist=await User.findOne({Email});
          isUserExist.Password=NewPassword;
          await isUserExist.save();
          console.log('Password changes successfully');
          return res.status(200).json({message:`Password Changed Successfully`});
        }
        else
        {
           console.log('Verification Failed');
           return res.status(500).json({message:`Can't verify Email`});
        }
    }
    catch(error)
    {
        console.log('Unable to Change Password');
        return res.status(500).json({message:`Unable to Change Password`});
    }
} 
//endpoints for admin funtionality
exports.adminRegister=async(req,res)=>{
    try
    {
     const newAdmin=await TempAdmin.create(req.body);
     console.log('Admin Email : ', req.body.Email);
      SecNum=generateRandomNumber();
     await sendVerificationEmail(newAdmin.Email,newAdmin.UserName,SecNum);
    
     //defining a token  
        console.log('Secret Num = ' + SecNum); 
        const token=jwt.sign(
          { firstName:newAdmin.FirstName,secondName:newAdmin.SecondName,userName:newAdmin.UserName,email:newAdmin.Email,number:newAdmin.Number},
          process.eny.SecStamp,
           {expiresIn:'2h'}
    );
        return res.status(200).json({
          newAdmin,
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

exports.verifyAdmin= async (req, res) => {
    const { adminName } = req.params;
    const { enteredCode } = req.body;
    console.log('Entered Code: ' + enteredCode);
    console.log('UserName: ' + adminName);

    try {
        const adminToVerify = await TempAdmin.findOne({ UserName: adminName });
        if (!adminToVerify) {
            console.log('Admin Not Found');
            return res.status(404).json({ message: `Admin ${userName} not found` });
        }
        console.log('Sec Num ' +SecNum);
        if (enteredCode === SecNum) {
            adminToVerify.isVerify = true;
            adminToVerify.isAdmin=true;
            await adminToVerify.save();
        } else {
         
            console.log('Invalid verification code');
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        if (adminToVerify.isVerify && adminToVerify.isAdmin) {
            console.log('Admin has been verified successfully');
            const adminObject = adminToVerify.toObject();
            const VerifiedAdmin= await Admin.create(adminObject);
            await TempAdmin.deleteOne({ Email: VerifiedAdmin.Email });

            return res.status(200).json({
                message: `Admin has been verified successfully.`,
                VerifiedAdmin
            });
        }
    } catch (error) {
        console.log('Error verifying Admin: ', error);
        await Admin.deleteOne({Email:VerifiedAdmin.Email});
        await TempAdmin.deleteOne({Email:VerifiedAdmin.Email});
        return res.status(500).json({ error });
    }
};

exports.signInAsAdmin=async(req,res)=>{
    const {Email,Password}=req.body;
    console.log('Email : ' + Email);
    console.log('Password : ' + Password);
    try{
    const isAdminExist=await Admin.findOne({Email});
    if(!isAdminExist)
    {
        console.log('Admin Record not Found');
       return res.status(404).json({message:`Admin not Found`});
    }
    const isValidPassword=await bcrypt.compare(Password,isAdminExist.Password);   
    if(!isValidPassword)
    {
            console.log('Password does not match');
            return res.status(404).json({message:`Password does not match`});
    }
    const token=jwt.sign(
        { id:isAdminExist._id, email:isAdminExist.Email},
        process.eny.SecStamp,
        {expiresIn:'2h'}
    );
      console.log(`Successfully logged into your account`);
      return res.status(200).json({
        message:`Successfully logged into account registered on mail : ${Email}`,
        token 
        });
}
catch(error){
    console.log('Failed to login as Admin');
    return res.status(500).json({message:`Failed to login as Admin`});
} 
}

exports.updateAsAdmin=async(req,res)=>{
   const{adminName}=req.params;
   try{
   const isValidAdmin =await Admin.findOne({UserName:adminName});
   if(!isValidAdmin)
   {
    console.log('Admin not found');
    return res.status(404).json({message:`Admin not Found`});
   }
   console.log(`Admin ${adminName} Found`);
   //user whose credentials are to be updated

   const {FirstName,SecondName,UserName,Email,Number}=req.body;
    console.log(Email);
   const isUserExist=await User.findOne({Email:Email});
   if(!isUserExist)
   {
    console.log(`User does not found`);
    return res.status(404).json({message:`User not found`});
   }
        console.log(`User Found`);
        isUserExist.FirstName = FirstName;
        isUserExist.SecondName = SecondName;
        isUserExist.UserName=UserName;
        isUserExist.Number = Number;
    const token=jwt.sign(
        {firstName:isUserExist.FirstName,secondName:isUserExist.SecondName,userName:isUserExist.UserName,number:isUserExist.Number},
        process.eny.SecStamp,
       { expiresIn:'2h'}
    );
    console.log('Updated the changes successfully');
 //   informing user that admin have updated your credentials.
    await sendInformingMailToUser(adminName,isUserExist.UserName,isUserExist.Email);
    res.status(200).json(
        {
        isUserExist,
        token
    });
}
catch(error){
    console.log('Error ' + error);
    console.log('Failed To Update Changes');
    return res.status(500).json({message:error.message});
}
}
exports.deleteAsAdmin=async(req,res)=>{
    const {adminName} =req.params;
    console.log('Admin Name : ' + adminName);
    try{
    const isValidAdmin=await Admin.findOne({UserName:adminName});
    if(!isValidAdmin)
    {
        console.log('Admin not found');
        return res.status(404).json({message:`Admin not found`});
    }
    const {UserName}=req.body;
     console.log(UserName);
   console.log('Admin Found');
   const isUserExist=await User.findOne({UserName:UserName});
   if(!isUserExist)
   {
    console.log('User not found');
    return res.status(404).json({message:`User ${UserName} not found`});
   }
   console.log('User Found');
   await User.findOneAndDelete({UserName:UserName});
     console.log('Account Deleted Successfully');
     const token=jwt.sign(
         {_id:isUserExist._id,Email:isUserExist.Email},
         process.eny.SecStamp,
        {expiresIn:'2h'}
     );
     res.status(200).json({
        message:`Account with username ${UserName} has been deleted by admin`,
        token
    });
    await sendDeletionEmailbyAdmin(isUserExist.UserName, isUserExist.Email,adminName);

  } 
   catch(error)
   {
    console.log('Error deleting the user');
    return res.status(500).json({message:error.message});
   }
}