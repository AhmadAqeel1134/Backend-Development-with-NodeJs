const express=require('express');
const axios=require('axios');
require('dotenv').config();
const port=3000;
const app=express();
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Weather Detection');
})

//setting up a router to fetch/get the area
app.get('/:AreaInfo',async(req,res)=>{
    const area=req.params.AreaInfo;
    const apiKey='79b0e0b53b5870340d67415aae510df9';
    console.log('Area ' + area);
    try {
        const Weather= await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${area}&users=imperial&appid=${apiKey}`);
        const myResponse=Weather.data;
        res.status(200).json({myResponse});       
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Can not able to fetch weather'});
    }

})
app.listen(port,(error)=>{
    if(error)
    {
        console.log('Unable to listen to port');
        res.status(500).json({message:error.message});
    }
    else{
        console.log(`Server is listening to the port ${port}`);
    }
}
)

