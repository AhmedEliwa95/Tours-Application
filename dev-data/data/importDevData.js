const fs = require('fs');
const mongoose= require('mongoose');
// require('dotenv').config({path:'../../config.env'});
require('dotenv').config({path:'./config.env'})
const Tour = require('../../models/toursModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');


const DB = process.env.DATABASE.replace
    ('<PASSWORD>',
    process.env.DATABASE_PASSWORD)



    mongoose.connect(DB,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false
        }).then(() =>{
        // console.log(con.connections)
        console.log('DB Connection Successful!')
    });

/// Read JSON File

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

/// import data into database
const importData = async()=>{
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave:true});
        await Review.create(reviews);
        console.log('Data Successfuly Loaded')
    } catch (error) {
        console.log(error)
    };
    process.exit();
};

/// delete all data from the collections;
const deleteAll = async()=>{
    
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('All Data deleted Successfuly');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

if(process.argv[2] === '--import'){
    importData();
};
if(process.argv[2] === '--delete'){
    deleteAll();
}

// console.log(process.argv);