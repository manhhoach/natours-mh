const mongoose = require('mongoose');
const validator=require('validator');
const bcrypt = require('bcryptjs');
const crypto=require('crypto');

const userSchema= new mongoose.Schema({
    name:{ type:String, required:[true, 'Please tell us your name']},
    email: { 
        type:String, unique:true, 
        required:[true, 'Please tell us your email'],
        lowercase:true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo:{ type: String, default:'default.jpg' }, 
    password:{ 
        type:String,
        required:[true, 'Please tell us your password'],
        minLength:8,
        select:false
    }, 
    passwordConfirm:{ 
        type:String, 
        required:[true, 'Please tell us your password'],
        validate:{ 
            validator: function(el){ 
                return el===this.password;
            },
            message:'Passwords are not same'
        }
    },
    passwordChangedAt:Date, 
    passwordResetToken:String, 
    passwordResetExpires:Date, 
    role:{
        type:String,
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default:'user'
     },
    active :{ 
        type:Boolean, 
        default:true, 
        select:false
    },
    isApproval:{ 
        type:Boolean, 
        default:true
    }
});

userSchema.pre('save', async function(next){

    // only run this function if password was actually modified
    if(!this.isModified('password'))
     return next();

    // hash password with cost of 12
    this.password= await bcrypt.hash(this.password, 12);
    // delete passwordConfirm 
    this.passwordConfirm=undefined;
    next();    
})

userSchema.pre('save', function(next){

    if(!this.isModified('password')||this.isNew)
     return next();    
    this.passwordChangedAt=Date.now()-1000;
    next();
})

userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false} }); // khi find thì chỉ hiện những đứa có active là true
    next();
})

userSchema.methods.correctPassword= async function(rawPassword, hashPassword){
    return await bcrypt.compare(rawPassword, hashPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){

    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() /1000, 10);
        return JWTTimestamp<changedTimestamp;
    }     
    return false; // not change
}

userSchema.methods.createPasswordResetToken=function(){

 const resetToken=crypto.randomBytes(32).toString('hex');
 this.passwordResetToken=crypto
   .createHash('sha256')
   .update(resetToken)
   .digest('hex');

  //console.log(resetToken, this.passwordResetToken); 

  this.passwordResetExpires=Date.now()+10*60*1000; // 10 min
  return resetToken;
}

const User=mongoose.model('User', userSchema);

module.exports = User;

