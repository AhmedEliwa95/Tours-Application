const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace
    ('<PASSWORD>',
    process.env.DATABASE_PASSWORD)

// const DB = process.env.DATABASE_LOCAL
const connect = () => {

    mongoose.connect(DB,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false
        }).then(() =>{
        // console.log(con.connections)
        console.log('DB Connection Successful!')
    })
    // .catch(err=>console.log('Database connection ERROR!!'));
}


module.exports = connect
