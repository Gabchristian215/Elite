import jwt from "jsonwebtoken"
import User from './userModel.js';

export const signup = async (req, res, next) => {
    try{
        const newUser = await User.create({
           username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });

        const token = jwt.sign({id:newUser._id}, process.env.jwtSecret, {expiresIn:process.env.jwtExpiresIn});

        res.status(201).json({
            status: 'success',
            token,
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

export const login = async (req, res, next) => {
    try {
        const {username, password} = req.body;
         // 1) check if username and password exist
        if(!username || !password){
            return res.status(400).json({
                status: "error",
                message: "invalid username or password"
            });
        }

        const user = await User.findOne({username}).select('+password');
        console.log(user);
        
        //2) check if user exist &&  password is correct
        if(!user || !(await user.correctPassword(password, user.password))){
            return res.status(401).json({
                status: "error",
                message: "invalid username or password"
            });
        }
         //3) if everything is ok, send token to client
        const token = jwt.sign({id: user._id}, process.env.jwtSecret, {expiresIn: process.env.jwtExpiresIn});

        res.status(200).json({
            status: 'success',
            token
        });
    } catch(err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};
