const express = require('express')

const tourRouter = express.Router();

const {
    getAllTours,
    getTour,
    deleteTour,
    updateTour,
    createTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages
} = require('../controller/tourController');

const {protect , restrictTo} = require('../controller/authController');

const reviewRouter = require('./reviewRoutes');

/// Post /tour/:id/reviews :::: to create new review on specifeied tour
/// Get /tour/:id/reviews  :::: to get all reviews on specified tour
/// Get /tour/:id/reviews/:id : to get specified review from specified tour 
/// we have to implement these routes inside tour Routes 
/// nested express routes 
tourRouter.use('/:tourId/reviews' , reviewRouter)
 

// tourRouter.param('id',checkID )

tourRouter.route('/tour-stats').get(getTourStats,getAllTours)
tourRouter.route('/monthly-plan/:year')
    .get(
        protect,
        restrictTo('admin' , 'lead-guide' , 'guide'),
        getMonthlyPlan,
        getAllTours)

tourRouter.route('/top-5-cheap').get(aliasTopTours,getAllTours)

// Getting Tours Within Location
tourRouter.route('/tours-within/:distance/center/:latlng/unit/:unit' ).get(getToursWithin)

/// calculate Distances
tourRouter.route('/distances/:latlng/unit/:unit').get(getDistances)

tourRouter
    .route('/')
    .get(  getAllTours)
    .post(
        protect,
        restrictTo('admin' , 'lead-guide'),
        createTour);

tourRouter
    .route('/:id')
    .get(getTour)
    .patch(
        protect,
        restrictTo('admin' , 'lead-guide'),
        uploadTourImages,
        resizeTourImages,
        updateTour)
    .delete(
        protect,
        restrictTo('admin','lead-guide'),
        deleteTour);

//// nested route to create a review which it's a bad approach to do that
// tourRouter
//     .route('/:tourId/reviews')
//     .post(protect , createReview)


module.exports = tourRouter