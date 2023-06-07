const express= require('express');

const userRouter = express.Router();
const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto
} = require('../controller/userController')

const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword,
    restrictTo,
    logout} = require('../controller/authController');



userRouter.post('/signup',signup);
userRouter.post('/login',login);
userRouter.get('/logout',logout);

userRouter.post('/forgotPassword',forgotPassword);
userRouter.patch('/resetPassword/:token',resetPassword);


// all coming lines will use this middleware before excuting
userRouter.use(protect);

userRouter.patch('/updateMyPassword', updatePassword);
userRouter.get('/me',getMe,getUser);
userRouter.patch('/updateMe',uploadUserPhoto , resizeUserPhoto , updateMe);
userRouter.delete('/deleteMe', deleteMe);

// to make all next lines only restricted to admins
userRouter.use(restrictTo('admin'))
userRouter
    .route('/')
    .get(getAllUsers)
    // .post(createUser);

userRouter
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(restrictTo('admin') ,deleteUser);

module.exports = userRouter
