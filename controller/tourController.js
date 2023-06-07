const sharp = require('sharp');
const multer = require('multer');
const Tour = require('../models/toursModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne , updateOne, createOne , getOne , getAll} = require('./handlerFactory');


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

const uploadTourImages = upload.fields([
    {name:'imageCover' , maxCount:1},
    {name:'images' , maxCount:3}
]);
/// upload.single('image'): req.file
/// upload.array('images',5) req.files

const resizeTourImages =catchAsync(async (req,res,next)=>{
    if(!req.files.images || !req.files.imageCover) return next();

    ///-1) CoverImage
    req.body.imageCover= `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${req.body.imageCover}`)
    
    ///-2) Images
    req.body.images = []
    await Promise.all(
        req.files.images.map(async(file , i) =>{
            const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
            await sharp(file.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({quality:90})
                .toFile(`public/img/tours/${filename}`)
            req.body.images.push(filename)
        })
    );

    next()
})

const getAllTours = getAll(Tour)

const aliasTopTours = (req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-rantingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,dufficulty';
    next();
}

const getTour =getOne(Tour,'reviews')



const createTour = createOne(Tour)

const updateTour = updateOne(Tour)


const deleteTour = deleteOne(Tour)

// const deleteTour =catchAsync( async(req,res,next)=>{
//     const tour = await Tour.findByIdAndDelete(req.params.id);
     
//     if(!tour){
//         return next(new AppError(`no tour with this ID:${req.params.id}` , 404));
//     };
    
//     res.status(204).send({
//         status:'Success',
//         data:{
//             tour
//         }
//     });
// });

const getTourStats =catchAsync( async(req,res,next)=>{
    const stats =await Tour.aggregate([
        {
            $match:{"ratingsAverage" :{$gte:4.5}}
        },{
            $group:{
                _id:{$toUpper:'$difficulty'},
                numTours:{$sum:1},
                totaltRatings:{$sum:'$ratingsQuantity'},
                avgRating:{ $avg: '$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'},
            }
        },{
            $sort:{avgPrice:1}
        },
        // {
        //     $match:{ _id: { $ne: 'EASY'} }
        // }
    ]);

    res.status(200).send({
        status:'Success',
        data:{stats}
    })

});

const getMonthlyPlan =catchAsync( async (req,res,next)=>{

    const year = Number(req.params.year);

    const plan = await Tour.aggregate([
        {
            $unwind:'$startDates'
        },{
            $match: {
                startDates:{
                    $gte: new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            }
        },{
            $group:{
                _id:{$month:'$startDates'},
                numTourStarts:{$sum:1},
                tours:{$push:'$name'}
            }
        },{
            $addFields:{month:'$_id'}
        },{
            $project:{_id:0}
        },{
            $sort:{numTourStarts:-1}
        },{
            $limit:12
        }
    ]);

    res.status(200).send({
        status:'Success',
        plan
    })
        
});

// /tours-within/:distance/center/latlng/unit/:unit'
// /tours-within/233/center/34.114745,-118.125124/unit/mi
// to get all distances within raduis
const getToursWithin = catchAsync(async(req,res,next)=>{
    const {distance , latlng , unit } = req.params;
    const [lat , lng] =  latlng.split(',');

    const raduis = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if(!lat || !lng){
        next(new AppError('Please provide latitude and langitude in the format lat,lng.' , 400))
    };

    console.log({distance , lat , lng , unit});
    
    const tours = await Tour.find({
        startLocation: {
             $geoWithin: { $centerSphere: [ [ lng , lat ] , raduis ] } 
        }
    });

    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    })
});

// /distances/:latlng/unit/:unit
// to get all distances from set point to all locations in the tour
const getDistances = catchAsync(async (req,res,next) =>{
    const { latlng , unit } = req.params;
    const [lat , lng] =  latlng.split(',');

    const multiplier = unit ==='mi' ? 0.000621371 : 0.001;
    if(!lat || !lng){
        next(new AppError('Please provide latitude and langitude in the format lat,lng.' , 400))
    };

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type: 'Point',
                    coordinates: [ lng*1  , lat*1 ] 
                },
                distanceField:'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ]);

    res.status(200).json({
        status:'success',
        results:distances.length,
        data:{
            data:distances
        }
    })
})

module.exports= {
    deleteTour,
    createTour,
    updateTour,
    getAllTours,
    getTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages
}