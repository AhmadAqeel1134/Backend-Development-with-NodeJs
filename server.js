//requiring the app.js file

const app=require('./app');
const port=8000;

//listening to the port
app.listen(port,(error)=>{
    if(error)
    console.log(`Server is unable to listen to the port ${port}`)
    else
    console.log(`Server is listening to the port ${port}`);
})