require('dotenv').config({path:'./config.env'})
const connect = require('./db/connectDB')
const app = require('./app');


// to catch Uncaught Exceptions or all bugs return from the synchronous code 
process.on("uncaughtException" , err=>{
    console.log(err.name , err.message);
    console.log('Uncught Exception Error: Shutting down ')
    process.exit(1);
});

const port =process.env.PORT || 3000;
const server = app.listen(port,()=>{
    connect();
    console.log(`listenning on port: ${port} & Environment is ${process.env.NODE_ENV} `)
});

// to catch unhandeledRehection errors: if we have any type of these errors then we have to shutdown our app
process.on('unhandledRejection',err=>{
    console.log({ErrorName:err.name} ,{Message:err.message});
    console.log('Unhandeled Rejection : Shutting down')
    server.close(()=>{
        process.exit(1)
    })
});

// console.log(x)

