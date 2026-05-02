 
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


    //verification token




    //if user still exist


    //check if user password was changed after token was issued 
    


  next(); // move to next middleware if token exists
};