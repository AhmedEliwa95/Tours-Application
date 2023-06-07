// const catchAsync = require("../utils/catchAsync");
const Review = require('../models/reviewModel');
const { deleteOne, updateOne  , createOne, getOne, getAll} = require("./handlerFactory");



// must to protect (reviews for the login user) 

const setTourUserIds = (req,res,next) =>{
    /// Allow nested Routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    
    next()
};

const getAllReviews =getAll(Review);

const createReview = createOne(Review);

const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review);

const getReview = getOne(Review);

module.exports = {
    getAllReviews,
    deleteReview,
    updateReview,
    setTourUserIds,
    createReview,
    getReview
}