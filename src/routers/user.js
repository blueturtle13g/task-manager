const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../email/account');

const router = express.Router();

router.post('/users', async (req, res)=>{
    try{
        const user = await new User(req.body).save();
        const token = await user.generateJWT();
        sendWelcomeEmail(user.email, user.name);
        res.status(201).send({user, token});
    }catch(e){
        console.log(e);
        res.status(400).send(e)
    }
});

router.post('/users/login', async (req, res)=>{
    try{
        const {user, error} = await User.findByCredentials(req.body);

        if(error){
            res.status(400).send(error);
            return;
        }
        const token = await user.generateJWT();
        res.send({user, token});
    }catch(e){
        console.log('e :', e);
        res.status(500).send(e)
    }
});

router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(({token})=>token!==req.token);
        await req.user.save();
        res.send();
    }catch(e){
        console.log(e);
        res.status(500).send(e)
    }
});

router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(e){
        console.log(e);
        res.status(500).send(e)
    }
});

router.get('/users/me', auth, async (req, res)=>{
    res.send({user: req.user})
});

router.delete('/users/me', auth, async(req, res)=>{
    try{
        await req.user.remove();
        sendGoodbyeEmail(req.user.email, req.user.name);
        res.send(req.user);
    }catch(e){
        console.log('e: ', e);
        res.status(500).send(e)
    }
});

router.patch('/users/:id', async(req, res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['password', 'name'];
    if(!updates.every(update=>allowedUpdates.includes(update))){
        res.status(400).send({errorMessage: `you can just update: ${allowedUpdates.map(au=>au)}`});
    }

    try{
        updates.forEach(update=>req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user)
    }catch(e){
        console.log('e', e);
        res.status(500).send(e)
    }
});

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter( req, file, cb){
        const allowedTypes = ['png', 'jpeg', 'jpg'];
        if(allowedTypes.includes(file.originalname.split('.')[1])){
            return cb(undefined, true)
        }
        cb(new Error('file type is not valid'))
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    try{
        req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
        await req.user.save();
        res.send()
    }catch(e){
        console.log('e: ', e);
        
        res.status(500).send({error: e});
    }

}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
});

router.get('/users/:id/avatar', auth, async (req, res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            res.status(404).send();
            return;
        }
        res.set('Content-Type', 'image/png').send(user.avatar)
    }catch(e){
        res.status(500).send({error: e})
    }
});

router.delete('/users/me/avatar', auth, async(req, res)=>{
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send({e})
    }

});

module.exports = router;