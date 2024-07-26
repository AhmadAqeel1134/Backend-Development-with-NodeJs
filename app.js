const mongoose=require('mongoose');
const express=require('express')
const port=5000;
const app=express();

//middleware
app.use(express.json());

const Person=require('./Model/userModel')

app.get('/',function(req,res){
    res.send('Voting App');
})

//router to add citizen in database
app.post('/addCitizen',async(req,res)=>{
    try {
        const Citizen=await Person.create(req.body);
        res.status(200).json(Citizen);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({messsage:error.message});
        
    }
})

app.post('/vote',async(req,res)=>
    {
    const {CNIC,voteSym}=req.body;
    try 
    {
        const validCitizen=await Person.findOne({CNIC});
        if(!validCitizen)
        {
            return res.status(500).json({message:'Citizen Not Found'});
        }
        else{
            console.log('Valid Citizen Found')
            if(voteSym=='drum')
            validCitizen.DrumVoteCount+=1;
        else if(voteSym=='stick')
            validCitizen.StickVoteCount+=1;
        else
        return res.status(500).json({message:'Invalid Vote Type'})
        }
        await validCitizen.save();

    } catch(error)  
    {
        console.log(error.message);
        res.status(500).json({message:error.message});
    }
})

//router to get final results
app.get('/result',async(req,res)=>
{
    try {
        const[drumVotes,stickVotes]=await Promise.all([
            Person.aggregate([{ $group: { _id: null, totalDrumVotes: { $sum: "$DrumVoteCount" } } }]),
            Person.aggregate([{ $group: { _id: null, totalStickVotes: { $sum: "$StickVoteCount" } } }])
        ])

        const totalDrumVotes = (drumVotes[0] && drumVotes[0].totalDrumVotes) || 0;
        const totalStickVotes = (stickVotes[0] && stickVotes[0].totalStickVotes) || 0;

        const winner=totalDrumVotes>totalStickVotes? 'drum' : 'stick';
        res.status(200).json({
            drumVotes:totalDrumVotes,
            stickVotes:totalStickVotes,
            winner:winner
        });
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
        
    }
})
//now connecting to the dataabse
mongoose.connect('mongodb+srv://ahmadmirza9987:S5G0BzHDC1MypNBh@citizensdata.4h6ox35.mongodb.net/?retryWrites=true&w=majority&appName=CitizensData')
   .then(()=>
{
    console.log('Connected to Citizens Database');
    app.listen(port,(error)=>

        {
            if(error)
            {
                console.log(`Unable to listen port ${port}`);
            }
            else
            {
                console.log(`Server is listening to port ${port}`)
            }
        })
        
        
})
   .catch((error)=>
{
    console.log('Unable to Connect To The DataBase')
})