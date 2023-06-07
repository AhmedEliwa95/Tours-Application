const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'A tour must Have a NAME'],
        unique:[true,'The name of the tour must be Unique'],
        trim:true,
        maxlength:[40 , 'A tour name must have less or equal 40 charachters'],
        minlength:[10 , 'A tour name must have more or equal 10 charachters'],
        // validate:[validator.isAlpha,'Tour name must only contain characters  ']
    },
    slug:{
        type:String
    },
    duration:{
        type:Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'A tour must have a maxGroupSize']
    },
    difficulty:{
        type:String,
        enum:{
            values:['easy' , 'medium' , 'difficult'],
            message:'Diffculty is either: easy, meduim, difficult'
        },
        required:[true,'A tour must have the difficulty']
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        max:[5,'Rating must be less than Five'],
        min:[1,'Rating must be above Zero'],
        set: val=> Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A Tour Must Have the PRICE'],
        
    },
    priceDiscount:{
        type:Number,
        validate : {
            validator:function(val){
                /// this will points to current document on NEW document creation and will not work on UPDATE
                /// so we have to install npm validator
                return val < this.price 
            },
            message:'Discount Price ({VALUE}) must be below the regular price '
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'A tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a imageCover']
    },
    images:[String],
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false 
    },
    // it's for embedded object
    startLocation:{
        // GoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    // to embed dataset we have to use an Array of object : [{}]
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[{
        type: mongoose.Schema.ObjectId,
        ref:'User'
    }
    ],
    /// by this way we do child referecncing to get reviews but this is not agood way 
    /// because it will be indefinetly space indide this array of IDs so we need to use Virtual Population 
    // reviews: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref:'Review'
    //     }
    // ]
    

},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

/// 1 means that we are sorting the price index in an ascending order -1 means des
// tourSchema.index({price:1})
tourSchema.index({ price: 1 , ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

/// we can't use this virtual property in query because it's not a part of the database
tourSchema.virtual('durationWeeks').get(function() {
    return Math.round(this.duration / 7);
});

// virtual population to make virtual connection between reviews and tours
tourSchema.virtual('reviews',{
    ref:'Review',
    localField:'_id',
    foreignField:'tour'

});

// tourSchema.pre(/^find/ , function(next){
//     this.populate('reviews');
//     next()
// })
/// DOCUMENT Middleware (save) runs only before .save() & .create() and not will work on Update
tourSchema.pre('save' , function(next){
    this.slug = slugify(this.name , {lower:true});
    next();
});

// tourSchema.pre('save',async function(next){
//     const guidesPromises = this.guides.map(async id =>  await User.findById(id) );
//     // when we call array of promisses then we have to run Promise.all(Array)
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

/// QUERY Middleware
tourSchema.pre(/^find/ , function(next){
// tourSchema.pre('find' , function(next){
    this.find({secretTour:{$ne:true}})
    
    next();
});

tourSchema.pre(/^find/ , function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt '
    });
    next()
})

/// Aggregation Middleware
// tourSchema.pre('aggregate',function(next){

//     this.pipeline().unshift({$match : {secretTour :{$ne:true}}});
//     console.log(this.pipeline())
//     next()
// });
tourSchema.pre('aggregate', function(next) {
    // Hide secret tours if geoNear is NOT used
    if (!(this.pipeline().length > 0 && '$geoNear' in this.pipeline()[0])) {
      this.pipeline().unshift({
        $match: { secretTour: { $ne: true } }
      });
    }
    next();
  });

const Tour =new  mongoose.model('Tour' , tourSchema);

module.exports = Tour;