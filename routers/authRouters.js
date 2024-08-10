const express=require('express');
const {registerUser,signIn,Seeuser,updateUser,welcome,deleteUser,forgetPassword,changePassword,verifyUser,adminRegister,verifyAdmin,signInAsAdmin,updateAsAdmin,deleteAsAdmin}=require('../controllers/authControllers');
const router=express.Router();

//routes for user functionality
router.post('/register',registerUser);
router.post('/SignIn',signIn);
router.get('/seeUser/:userName',Seeuser);
router.put('/updateUser', updateUser);
router.delete('/DeleteUser/:userName',deleteUser);
router.post('/verify/:userName',verifyUser);
router.post('/ForgetPassword',forgetPassword);
router.post('/ChangePassword',changePassword);
router.get('/',welcome);

//routes for admin functionality
router.post('/adminRegister',adminRegister);
router.post('/VerifyAdmin/:adminName',verifyAdmin);
router.post('/SignInAsAdmin',signInAsAdmin);
router.put('/UpdateAsAdmin/:adminName',updateAsAdmin);
router.delete('/DeleteAsAdmin/:adminName',deleteAsAdmin);
module.exports=router;