exports.log = (req, res, next) => {
  console.log(`${req.method} request eceived at route ${req.url}`)
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
    return next(new customError("Login first to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});
//middleware for checking the role of user
exports.userRole = (...role) => {
  //by spreading role array parameter sent by route will
  //auto added to the role array
  return (req, res, next) => {
    //check if user had specific role
    //typo in user model :roll
    if (!role.includes(req.user.roll)) {
      return next(new customError('You are not permited to perform this activity', 403));
    }
    next();
  };
};