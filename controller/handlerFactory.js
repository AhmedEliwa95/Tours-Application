const AppError = require("../utils/appError");
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require("../utils/catchAsync");



exports.deleteOne = Model => catchAsync( async(req,res,next)=>{
    const doc = await Model.findByIdAndDelete(req.params.id);
     
    if(!doc){
        return next(new AppError(`no document with this ID:${req.params.id}` , 404));
    };
    
    res.status(204).send({
        status:'Success',
        data:{
            tour: doc
        }
    });
});

exports.updateOne =Model => catchAsync( async(req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id , req.body , {
    new:true,
    runValidators:true
    });

    if(!doc){
        return next(new AppError(`no Document with this ID:${req.params.id}` , 404));
    };

    res.status(200).send({
        status:'Success',
        data:{data: doc}
    });
});

exports.createOne = Model => catchAsync( async(req,res,next)=>{
    const newDoc = await Model.create(req.body);


    res.status(201).send({
        status:'success',
        data:{
            data: newDoc}
        })
});

exports.getOne = (Model , popOptions) => catchAsync( async(req,res,next)=>{
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions)

    const doc = await query;

    if(!doc){
        return next(new AppError(`no document with this ID:${req.params.id}` , 404));
    }

    res.status(200).send({
        status:'success',
        data:{data: doc}
    })
});

exports.getAll = Model => catchAsync( async(req,res,next)=>{
    // to allow for nested GET Reviews on tour (HACK)
    let filter = {};
    if(req.params.tourId) filter = {tour:req.params.tourId};       
    /// Excute Query
    const features = new APIFeatures(Model.find(filter),req.query)
        .filter()
        .sort()
        .paginate()
        .limitFields();

        // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).send({
        status:'success',       
        results:doc.length,
        
        data:{ data: doc}
    })
});