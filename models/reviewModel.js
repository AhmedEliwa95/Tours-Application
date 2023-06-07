const mongoose = require('mongoose');
const Tour = require('./toursModel');

const reviewSchema = mongoose.Schema({
    review:{
        type:String,
        required:[true,'Review can not be empty ']
    },
    rating:{
        type:Number,
        min:1,
        max:[5,'Rating must not exceed 5']
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    tour:{
            type:mongoose.Schema.ObjectId,
            ref:'Tour',
            required:[true , 'Review must belong to a tour']
        }
    ,
    user:{
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true , 'Review must belong to a user']
        }
    
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/// to prevent a single user making more than a review on a singlr tour 
reviewSchema.index({ tour: 1 ,user: 1 } , { unique: true });

/// query middleware
reviewSchema.pre(/^find/,function(next){
    this
        .populate({path:'user', select:' name photo'})
        // .populate({path:'tour', select:' name'})
    next()

});

/// to calculate the average rating for each TOUR we have to aggregate the Review Model and group 
/// the reviews with the tourId and then calculate the average of rating for each  
/// we use statics because this keyword will refer to the Review Model
reviewSchema.statics.calcAverageRatings =async function(tourId){
    console.log(tourId);
    const stats = await this.aggregate([
        {
            $match:{tour: tourId}
        },
        {
            $group:{
                /// in the id we specify the common field that all of document have in common that we want group 
                _id:"$tour",
                // to cal the quantity of ratings on each tour and add 1 for each one
                nRating:{$sum:1},
                avgRating:{$avg:"$rating"}
            }
        }
    ]);
    if(stats.length > 0 ){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage:4.5
        });
    }
    // console.log(stats);
};
// we have to use post instead of pre because at pre save the current review is not really exist 
// and the post middleware not access to next 
reviewSchema.post('save', function(){
    // to get the Review model we will use this.constructor
    this.constructor.calcAverageRatings(this.tour);
});

/// now we need to implement this aggegate during findOneAndUpdate and findOneAndDelete queries 
/// then we have to use query middleware but we will have an issue which we can't use this.costructor
/// because in this case this will refer to find, so le's see how we can solve this issue
/// we have to use post but we can't do this because the query has already excuted 
reviewSchema.pre(/^findOneAnd/ ,async function(next){
    /// this Hack to access to the review and to save this var to the next middleware
    this.r =await this.findOne()
    // console.log(this.r)
    next();
})
/// now we can use post on the query middleware
reviewSchema.post(/^findOneAnd/ , async function(){
    // this.r =await this.findOne() :: does not work here because the query has already excuted
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = new mongoose.model('Review' , reviewSchema);

module.exports = Review