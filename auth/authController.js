import jwt from "jsonwebtoken"
import User from './userModel.js';
import sendEmail from './email.js';

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
    req.body = User
    next();
};

export const forgotPassword = async (req, res, next) => {
//1) get user on posted email 
const email = req.body
const user = await User.findOne({email: req.body.email});
if(!user){
     return res.status(404).json({
                status: "error",
                message: `No user with ${email}` 
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

export const resetPassword = (req, res, next) => {
    
}
