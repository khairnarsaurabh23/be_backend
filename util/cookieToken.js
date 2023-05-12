const cookieToken = (user, res) => {
	const token = user.getJwtToken();
	const options = {
		expiresIn: new Date(
			Date.now() + process.env.COOKIE_EXPIRY
		),
		httpOnly: true
	};

	user.password = undefined;
	res.status(200).cookie('token', token, options).json({
		success: true,
		token,
		user
	});

};
// jwt.sign({ id: this._id }, process.env.JWT_SECRET,{
//     expiresIn: "2d",
//   })



module.exports = cookieToken;