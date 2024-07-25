const express=require('express');
const app=express()
const port=4000;


//to access this website through browser, we create route
app.get('/',function(req,res){
    res.send('Hello World')
})
app.listen(port,()=>{
   console.log('Node API app is running on port 4000')
})