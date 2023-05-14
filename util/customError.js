class CustomError extends Error {
	constructor(message, code){
		super(message);
		this.code = code;
	}

	// function error(req, res, next) {
	// 	return res.status(this.code).send(this.message)
	// }
}

module.exports = CustomError;