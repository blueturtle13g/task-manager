const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    avatar:{
        type: Buffer,
    },
    name:{
        type: String,
        unique: true,
        required: true,
        minlength: 3,
        maxlength: 20,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        validate(v){
            if(!validator.isEmail(v)){
                throw new Error('Email is not a valid one')
            }
        },
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
        trim: true,
    },
    gender:{
        type: String,
        trim: true,
        enum: ['male', 'female', 'trans'],
    },
    age:{
        type: Number,
        min: 18,
        max: 150,
    },
    tokens: [{
        token:{
            type: String,
            required: true,
        }
    }]
}, {
    timestamps: true,
});

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.methods.toJSON = function(){
    const user = this.toObject();

    delete user.avatar;
    delete user.tokens;
    delete user.password;
    return user;
};

userSchema.methods.generateJWT = async function (){
    const token = await jwt.sign({ _id: this._id}, process.env.JWT_SECRET, {expiresIn: '2 days'});
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
};

userSchema.pre('save', async function (next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const tasks = await Task.deleteMany({owner: this._id});

    next()
});

userSchema.statics.findByCredentials = async credentials=>{
    const user = await User.findOne({email: credentials.email});
    if(!user){
        return {error: 'email is invalid'}
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if(!isMatch){
        return {error: 'password is invalid'}
    }
    return {user};
};

const User = mongoose.model('User', userSchema);

module.exports = User;