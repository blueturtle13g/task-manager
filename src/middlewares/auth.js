const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next)=>{
    try{
        req.token = req.header('Authorization').replace('Bearer ', '');
        const {_id} = jwt.verify(req.token, process.env.JWT_SECRET);
        req.user = await User.findOne({_id, 'tokens.token' : req.token});
        if(!req.user) throw new Error();
        next();
    }catch(e){
        res.status(401).send({error: 'you are not authorized'})
    }
};

module.exports = auth;