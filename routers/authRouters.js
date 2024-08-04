const express=require('express');
const {registerUser,signIn,seeUser,updateUser,welcome,deleteUser,verifyUser}=require('../controllers/authControllers');
const router=express.Router();

//now regsitering a new user
router.post('/register',registerUser);
router.post('/verify/:userName',verifyUser);
router.post('/SignIn',signIn);
router.get('/seeUser/:email',seeUser);
router.put('/updateUser/:userName', updateUser);
router.delete('/DeleteUser/:userName',deleteUser)
router.get('/',welcome);

module.exports=router;


