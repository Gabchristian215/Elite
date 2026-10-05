import jwt from "jsonwebtoken"
import User from '../models/userModel.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';
import { validationResult } from "express-validator";

const signToken = id => jwt.sign(
    {id},
    process.env.jwtSecret,
    {expiresIn: process.env.jwtExpiresIn}
);

export const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({
            status: "failed",
            errors: errors.array()
        });
    }
    try{
        const newUser = await User.create({
           username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });

       return createSendToken(newUser, 201, res);

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
       return createSendToken(user, 200, res); 

    } catch(err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES) || 90) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if(process.env.NODE_ENV === "production"){ cookieOptions.secure = true};

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

export const forgotPassword = async (req, res, next) => {
//1) get user on posted email 
const email = req.body
const user = await User.findOne({email: req.body.email});
if(!user){
     return res.status(404).json({
                status: "error",
                message: `Will sent reset password to ${email} if it exist` 
            });
}

// 2) gen random tokken 
const resetToken = user.createPasswordResetToken();
await user.save({ validateBeforeSave: false });

//3) send back as email
const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`; // Creates a reset link using the raw reset token:
const message = `Forgot your password? Send a NEW request with your new password to: ${resetURL}
If you didn't forget your password, please ignore this email.`;

try {
    await sendEmail({ // Sends the email using your sendEmail helper
        email: user.email,
        subject: 'Your password reset token is valid for 10 minutes',
        message
    });

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    });
} catch(err) {
    console.error("Email send failed:", err.message);
    console.error(err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
        status: 'error',
        message: err.message
    });
}

}

export const resetPassword = async (req, res, next) => {
    // 1) getting user baed token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // find a user with matching token that has not expired
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})

    // 2) if token has not expired and there is a user set a new password 
    if(!user){
        return  res.status(404).json({
                status: "error",
                message: `Password reset token is invalid or has expired`
            });
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
 // 3) update changedPasswordAt proprty for the user

 //4) log the user in send jwt 
  const token = jwt.sign({id: user._id}, process.env.jwtSecret, {expiresIn: process.env.jwtExpiresIn});

        res.status(200).json({
            status: 'success',
            token
        });
}
export const updatePassword = async (req, res, next) => {
    try {
        const { passwordCurrent, password } = req.body;

        if (!passwordCurrent || !password) {
            return res.status(400).json({
                status: "error",
                message: "Please provide your current password and a new password"
            });
        }

        // 1) get user from database
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "user no longer exist"
            });
        }

        // 2) check if current password is correct
        if (!(await user.correctPassword(passwordCurrent, user.password))){
            return res.status(400).json({
                status: "error",
                message: "invalid password"
            });
        }

        // 3) update password
        user.password = password;
        await user.save()

        // 4) log user in again and send token
        createSendToken(user, 200, res);
    } catch(err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}
