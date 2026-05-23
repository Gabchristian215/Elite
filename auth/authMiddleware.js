 import User from './userModel.js';
 import {promisify} from "util";
 import jwt from "jsonwebtoken"
 import 'dotenv/config';
 


 export const requireLogin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "you are not logged in please login",
    });
  }
console.log(req.headers.authorization);

    //verification token
    let decoded;
    try{
decoded = await promisify(jwt.verify)(token,process.env.jwtSecret)
    }catch(error){
      return res.status(400).json({
        status: "error",
        message: "please login " + error.message
      })
    }
    


    //if user still exist
    const currentUser = await User.findById(decoded.id)
     if(!currentUser){
      return res.status(401).json({
        status: "error",
        message: "user no longer exist"
      })
     }

    //check if user password was changed after token was issued 
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "error",
        message: "user recently change password please login again"
      })
    }

// grant access to protected route
req.user = currentUser;
  next(); // move to next middleware if token exists
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "you do not have permission to perform this action"
      });
    }

    next();
  };
};
