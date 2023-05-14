var { User } = require('./../models/user');
var jwt = require("jsonwebtoken");
var customError = require('../util/customError')

exports.log = (req, res, next) => {
  console.log(`${req.method} request received at route ${req.url}`)
  next()
}


//middleware for restricting routes to logged in user
exports.auth = (async function (req, res, next) {
  // check token first in cookies
  let token = req.cookies.token;

  // if token not found in cookies, check if header contains Auth field
  if (!token && req.header("Authorization")) {
    token = req.header("Authorization").replace("Bearer ", "");
  }

  if (!token) {
    return res.status(401).json({
      "status": "failed",
      "message": "User not authenticated to access this route. Login to start using Affinity.",
    })
    // console.log("Invalid access to the route")
    // next()
    // const error = Error("Login first to access this page");
    // error.statusCode = 401
    // throw error
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET, {complete: true});

  req.user = await User.findById(decoded.payload.id);

  //get the applicant_id from decoder/token
  // console.log(JSON.parse(atob(token.split('.')[1])))
  // console.log("token", token)
  // console.log("decoder", )
  next();
});


//middleware for checking the role of user
exports.userRole = (...role) => {
  //by spreading role array parameter sent by route will
  //auto added to the role array
  return (req, res, next) => {
    //check if user had specific role
    //typo in user model :roll
    // console.log(req.user.role, role)
    if (!role.includes(req.user.role)) {
      // console.log(role, req.user.roll)
      return res.status(403).json({
        "status": "failed",
        "message": "You are not permited to perform this activity.",
    })
      // return next(new customError('You are not permited to perform this activity', 403));
    }
    next();
  };
};