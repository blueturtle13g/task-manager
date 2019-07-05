const Task = require('../../src/models/task');
const User = require('../../src/models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const FirstUserId = new mongoose.Types.ObjectId();
const FirstUser = {
    _id: FirstUserId,
	name: "first",
	gender: "male",
	age: 18,
	email: "rezashoja13g@gmail.com",
	password: "myStrongPass",
    tokens:[{
        token: jwt.sign({_id: FirstUserId}, process.env.JWT_SECRET)
    }]
};
const FirstUserAuthorization = 'Bearer '+ FirstUser.tokens[0].token;

const SecondUserId = new mongoose.Types.ObjectId();
const SecondUser = {
    _id: SecondUserId,
	name: "second",
	gender: "female",
	age: 19,
	email: "babakshoja13g@gmail.com",
	password: "myStrongPass2",
    tokens:[{
        token: jwt.sign({_id: SecondUserId}, process.env.JWT_SECRET)
    }]
};
const SecondUserAuthorization = 'Bearer '+ SecondUser.tokens[0].token;

const FirstTask = {
	title: "first",
	description: "first task",
    owner: FirstUserId,
};

const SecondTask = {
	title: "second",
	description: "second task",
    owner: FirstUserId,
};

const ThirdTask = {
	title: "third",
	description: "third task",
    owner: SecondUserId,
};

const setupDatabase = async ()=>{
    await User.deleteMany();
    await Task.deleteMany();

    await new User(FirstUser).save();
    await new User(SecondUser).save();
    await new Task(FirstTask).save();
    await new Task(SecondTask).save();
    await new Task(ThirdTask).save();
};

module.exports = {
    setupDatabase,
    FirstUser,
    SecondUser,
    FirstTask,
    SecondTask,
    ThirdTask,
    FirstUserId,
    SecondUserId,
    FirstUserAuthorization,
    SecondUserAuthorization,
};