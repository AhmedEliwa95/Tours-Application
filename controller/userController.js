// const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne , updateOne ,getAll, getOne} = require('./handlerFactory');

///////// Multer Upload Options
// const multerStorage = multer.diskStorage({
//     /// the destination which multer will upload the image to it
//     destination: (req , file , cb) =>{
//         cb(null , 'public/img/users' , )
//     },
//     /// the updated photo will save with this name
//     filename:(req,file,cb)=>{
//         /// photo name will be: user-id-timestamp.ext
//         const ext = file.mimetype.split('/')[1];
//         cb(null , `user-${req.user._id}-${Date.now()}.${ext}`)
//     }
// });
const multerStorage = multer.memoryStorage();

/// this option will filter only photos to be uploaded
const multerFilter = (req,file,cb) =>{
    if(file.mimetype.startsWith('image')) {
        cb(null,true);
    }else{
        cb(new AppError('Not an image, please upload only images' , 400) , false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

const uploadUserPhoto = upload.single('photo');

/// to resize the uploaded photos, we will use this middleware before excuing updateMe
const resizeUserPhoto =catchAsync( async (req , res , next ) =>{
    if(!req.file) return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`)
    next()
})

const filterObj = (obj,...allowedFiled) =>{
    const newObj={}
    Object.keys(obj).forEach(el=>{
        if(allowedFiled.includes(el)) newObj[el] = obj[el]
    });
    return newObj
};

const getMe = (req,res,next)=>{
    req.params.id = req.user.id;
    next()
}

const updateMe = catchAsync(async (req,res,next)=>{

    // 1) create Error if user post password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route not use for password updates, please use /updateMyPassword',400 ));
    };

    // 2) filter the allowed updated fields
    const filteredBody = filterObj(req.body,'name','email');
    if(req.file) filteredBody.photo = req.file.filename

    // 3) updated the user  
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody ,{
        new:true,
        runValidators:true
    });
     
    res.status(200).send({
        status:'success',
        data:{
            user:updatedUser
        }
    });
});

const deleteMe = catchAsync( async (req,res,next) =>{
    // 1) catch the user
    // eslint-disable-next-line no-unused-vars
    const user = await User.findByIdAndUpdate(req.user.id,{active:false});
    
    res.status(204).json({
        status:'success',
        data:null
    })

});

const getAllUsers = getAll(User);

const getUser =getOne(User);

const updateUser =updateOne(User)

const deleteUser = deleteOne(User)

module.exports = {
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto
}