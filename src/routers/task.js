const express = require('express');
const auth = require('../middlewares/auth');
const Task = require('../models/task');

const router = express.Router();

router.post('/tasks', auth, async (req, res)=>{
    try{
        const task = await  new Task({ ...req.body, owner: req.user._id}).save();
        res.status(201).send({task});
    }catch(e){
        console.log('e: ', e);
        
        res.status(400).send(e)
    }
});

router.patch('/tasks/:id', auth, async (req, res)=>{
    try{
        const task = await  Task.findOne({ _id: req.params.id, owner: req.user._id });
        if(!task){
            res.status(404).send({error: 'task not found'});
            return;
        }
        const allowedParams = ['title', 'description', 'completed'];
        const passedParams = Object.keys(req.body);
        if(!passedParams.every(passedParam=>allowedParams.includes(passedParam))){
            res.send({error: 'you cant update such properties'});
            return;
        }
        passedParams.forEach(passedParam=>{
            task[passedParam] = req.body[passedParam]
        });
        await task.save();
        res.send({task});
    }catch(e){
        res.status(500).send(e)
    }
});

router.get('/tasks/:id', auth, async (req, res)=>{
    try{
        const task = await  Task.findOne({owner: req.user._id, _id: req.params.id});
        if(!task){
            res.status(404).send({error: 'task not found'});
            return;
        }
        res.send({task});
    }catch(e){
        res.status(500).send(e)
    }
});

router.delete('/tasks/:id', auth, async (req, res)=>{
    try{
        const task = await  Task.findOneAndDelete({owner: req.user._id, _id: req.params.id});
        if(!task){
            res.status(404).send({error: 'task not found'});
            return;
        }
        res.send({task, message: 'successfully deleted the task'});
    }catch(e){
        res.status(500).send(e)
    }
});

router.get('/tasks', auth, async (req, res)=>{
    const { completed, sortBy, limit, skip } = req.query;

    const match = {};
    const sort = {};

    if(completed){
        match.completed = completed === 'true'
    }

    if(sortBy){
        const parts = sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try{
        // const tasks = await Task.find({owner: req.user._id});
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(limit),
                skip: parseInt(skip),
                sort
            },
        }).execPopulate();
        res.send({tasks: req.user.tasks});
    }catch(e){
        res.status(500).send(e)
    }
});

module.exports = router;