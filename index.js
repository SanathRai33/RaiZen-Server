require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoConnection = require('./config/db');

const app = express();
app.use(express.json());
app.use(cors());


mongoConnection()

const port =  process.env.PORT;
app.listen(port, ()=>{
    console.log('______________________________');
    console.log(`Server running on port ${port}`);
})

app.get('/', ( req, res) =>{
    res.send('Ready to Route');
    console.log('Ready to Route')
})

const productRouter = require('./routes/productRouter');
app.use('/products', productRouter);

const userRouter = require('./routes/userRouter');
app.use('/api/users', userRouter);


// const adminRouter = require('./routes/adminRouter');
// app.use('/api/admins', userRouter);