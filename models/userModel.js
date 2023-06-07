const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'User name is required'],
    },
    email:{
        type:String,
        validate:[validator.isEmail , 'Please insert a valid Email'],
        unique:[true , 'User email must be unique'],
        lowercase:true,        
    },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:{
            values:['user' , 'guide' , 'lead-guide' , 'admin'],
            message:`the role should be "user" | "guide" | "lead-guide" | "admin"`
        },
        default:'user'
    },
    password:{
        type:String,
        required:[true , 'Please provide a password'],
        minlength:[8,'Please insert more than 8 chars in the password'],
        validate:[validator.isStrongPassword,'please insert strong password'],
        select:false
    },
    passwordConfirm:{
        type:String,
        validate:{
            // this only work on save and create!!
            validator:function(val){return val === this.password},
            message:'must be typical of password'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});

/// to hash th password befor saving in the database
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password =await bcrypt.hash(this.password , 12);

    this.passwordConfirm = undefined;
    next();
});

/// update changePasswordAt to Date.now() when changing the password
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

/// query middleware to prevent finding not active users 
userSchema.pre(/^find/, function(next){
    // this refer to current query
    this.find({active:{$ne:false}})
    next();
})

/// comparing between the bassword in the req.body with the hashed password in the database
// inside login controller
userSchema.methods.correctPassword =async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};

// to check if the password is changed after creting the token
// inside protect controller, which check if the controller verofoed or not 
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimeStamp < changedTimestamp
    }
    return false;
};


// to create temporary password for 10 min which you can use it if you forgot your password
userSchema.methods.createPasswordResetToken = function(){
    // we shouldn't store this token in the database 
    const resetToken = crypto.randomBytes(32).toString('hex');

    /// hashed the value of reset token by crypto before saving it in the database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // you have to await user.save() in the forgot password to save this value in the database
    this.passwordResetExpires =Date.now() + 10 * 60 * 1000;
    
    return resetToken 
};


const User = new mongoose.model('User' , userSchema);

module.exports = User
