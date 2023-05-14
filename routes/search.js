var express = require("express");
var router = express.Router();
// var { mongoose } = require("./../db/mongoose");
var { User } = require("./../models/user");


//info:route used to search the users along the platform
router.get("/users", function(req, res, next) {
  User.find({},null,{limit:10})
    .then(response => {
      console.log("Response from find users", response);
      res.status(200).send(response);
    })
    .catch(err => {
      console.log("Error : ", err.response);
      res.status(500).json({
        message: "internal server error"
      });
    });
});

module.exports = router;

