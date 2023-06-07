const express = require('express');

// to merge review router inside the tour router 
const reviewRouter = express.Router({mergeParams:true});
const {createReview, getAllReviews, deleteReview, updateReview, setTourUserIds, getReview} = require('../controller/reviewController');
const { protect, restrictTo } = require('../controller/authController');


//////// NESTED ROUTES \\\\\\\\\\\
/// Post /tour/:id/reviews :::: to create new review on specifeied tour
/// Get /tour/:id/reviews  :::: to get all reviews on specified tour
/// Get /tour/:id/reviews/:id : to get specified review from specified tour 
/// we have to implement these routes inside tour Routes 

/// because of {mergeParams: true} we can call review by tow ways
//// /reviews  || /tour/:tourId/reviews

reviewRouter.use(protect);
reviewRouter
    .route('/')
    .post(
        restrictTo('user'),
        setTourUserIds,
        createReview)
    .get(getAllReviews);

reviewRouter.route('/:id')
    .get(getReview)
    .patch(
        restrictTo('user' , 'admin'),
        updateReview)
    .delete(
        restrictTo('user' , 'admin'),
        deleteReview)

module.exports = reviewRouter