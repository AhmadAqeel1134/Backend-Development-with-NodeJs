//Here we require different dependencies used in our "Authorization App"
const mongoose=require('mongoose');
const express=require('express');
const dotenv=require('dotenv');
const cors = require('cors');
const app=express();
const authRoutes=require('./routers/authRouters');

app.use(express.json());
app.use(cors());
dotenv.config();


app.use('/api/auth', authRoutes);

//now connecting to our mongoDB database 
mongoose.connect(process.env.MongoDBConnection,{
})
.then( ()=>{
  console.log('Connected to MongoDB Database');
})
.catch((error)=>{
    console.log('Failed to connect to databse');
}
)
module.exports=app;