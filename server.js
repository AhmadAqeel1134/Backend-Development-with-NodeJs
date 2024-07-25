const express = require('express');
const app = express();
const port = 4000;
const Product = require('./Models/productModel');
app.use(express.json());

const mongoose = require('mongoose');

// to access this website through the browser, we create a route
app.get('/', function (req, res) {
    res.send('Hello World');
});

// saving the data in the database
//storing the data in MongoDB
app.post('/product', async (req, res) => {
    // saving the data into the database
    try {
        const product = await Product.create(req.body);
        res.status(200).json(product);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

//fetching the entire data from database
app.get('/product',async(req,res)=>{
    try {
        const product=await Product.find({});
        res.status(200).json(product)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message:error.message})
    }

})

//fetching a single item/product from database
app.get('/product/:id',async(req,res)=>{
try {
    const {id}=req.params;
    const singleProduct=await Product.findById(id);
    res.status(500).json(singleProduct);
   }
     catch (error) {
    console.log(error.message);
    res.status(200).json({message:error.message});
    
}
})

//updating the data in database
app.put('/product/:id',async(req,res)=>
{
    try {
        const {id}=req.params;
        const product=await Product.findByIdAndUpdate(id,req.body);
       if(!product)
       {
        return res.status(200).json({message:`Product data with id ${id} can't be updated`});
       }
       else{
        const updatedProduct=await Product.findById(id);
        return res.status(200).json(product);
       }
        res.status(500).json(product);
    } catch (error) {
        console.log(error.message);
        res.status(200).json({message:error.message})
    }
}
)

//deleting the data from database
app.delete('/product/:id', async(req,res)=>
{
   try {
    const {id}=req.params;
    const product=await Product.findByIdAndDelete(id);
    if(!product)
    {
       return res.status(200).json({message:`Product with id ${id} can't be found`});
    } 
   else
   {
    return res.status(200).json(product);
   }
}
   catch (error) {
    console.log(error.message);
    res.status(200).json({message:error.message})
   }
   
})


mongoose.connect('mongodb+srv://ahmadmirza9987:Yegt4gmYCEpneVb9@crudapi.fsxjke5.mongodb.net/NodeAPI?retryWrites=true&w=majority&appName=crudAPI')
    .then(() => {
        console.log('Connected to MongoDB HeHe');
        app.listen(port, () => {
            console.log(`Node API app is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });
