import jwt from "jsonwebtoken"
import User from './userModel.js';

export const signup = async (req, res, next) =>{
    try{
const newUser = await User.create(req.body);
res.status(201).json({
    status: 'success',
    data: {
        user: newUser
    }
});
    }catch(err){
    res.status(400).json({
        status: 'error',
        message: err.message
    });
    }
};

// change user.create for better security
// add jws look at notes
