var express = require("express");
var router = express.Router();
var utils = require("./../util/utils");
var mysql = require("./mysql.js");
var { mongoose } = require("./../db/mongoose");
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
const multer = require("multer");
var app = express();
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var salt = bcrypt.genSaltSync(10);
// var kafka = require('./../kafka/client');
var {User} = require('./../models/user');
var {UserTrace} = require('./../models/usertrace');

// const redis = require('redis');
// let client = redis.createClient(6379,'127.0.0.1');
// client.on('connect', function(){
//   console.log('connected to redis');
// })

// var kafka = require('./../kafka/client');

//TODO-reddis
// const redis = require('redis');
// let client = redis.createClient(6379,'127.0.0.1');
// client.on('connect', function(){
//   console.log('connected to redis');
// })
// const userresult = "";
// console.time("Query_Time");

const storage=multer.diskStorage({
  destination :function(req,file, cb) {
    cb(null,'./public/uploads/');
  },
  filename: function(req, file, cb) {
    console.log("Profile image file name: ", req.body);
    cb(null, req.body.applicant_id + ".jpeg");
  }
});

const fileFilter =(req,file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'),false);
    }

  if(file.mimetype==='image/jpeg' || file.mimetype==='image/png' || file.mimetype==='image/jpg') {
    cb(null,true);
  }
  else {
    cb(null,false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


//get details of all users
//only for testing purpose
                                                    //search/search
// router.get('/find', function(req, res, next){
//   User.find({})
//   .then(users => {
//     console.log(users)
//     res.status(200).send(users)
//     next()
//   })
//   .catch(err=>{
//     console.log(err)
//     res.status(400).send(err)
//   })
// })
//================================================================================

//TODO-update the route
router.post("/uploadprofilepic", upload.single("photos"), function( req, res, next) {
  console.log("Inside upload profile pic API");
  console.log(req.file);
  res.status(200).json({ message: "profile photo uploaded successfully!" });
});
//==============================================================================================

router.post("/login", function(req, res, next) {
  console.log("inside login");
  let email = req.body.email;
  let password = req.body.password;
  console.log("Email entered", req.body.email);
  console.log("Password entered", req.body.password);
  const userDetails = new User({
    email: req.body.email,
    password: req.body.password
  });
  User.find({"email":req.body.email, status:'Active'})
    .exec()
    .then(doc => {
      // console.log("response got : ", doc);
      if (doc != undefined && doc.length > 0) {
        if (bcrypt.compareSync(password, doc[0].password)) {
          const server_token = jwt.sign(
            { uid: doc[0].email },
            utils.server_secret_key
          );
          console.log("user logged in successfully", server_token)
          // console.log("UID from JWT: ", doc[0].email);
          res.status(200).json({
            message: "User Logged in Successfully",
            server_token: server_token,
            current_user: doc[0].email,
            user_Details: doc[0]
          });
        } else {
          console.log("Error.!!!!!!!");
          res.status(401).json({
            message: "Applicant entered wrong password"
          });
        }
      } else {
        console.log("Applicant is not registered, First Signup");
        res.status(400).json({
          message: "Applicant is not registered, First Signup"
        });
      }
    })
    .catch(err => {
      console.log("Error : ", err);
      res.status(500).json({
        message: "internal server error"
      });
    });
});

//==============================================================================================
router.post("/signup", function(req, res, next) {
  console.log("inside signup");
  var recruiter_flag = req.body.recruiter_value == "Recruiter" ? 1 : 0;
  var passwordToSave = bcrypt.hashSync(req.body.password, salt);
  const userDetails = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: passwordToSave,
    recruiter_flag : recruiter_flag,
    status : 'Active'
  });
  User.find({ email: req.body.email })
    .exec()
    .then(doc=>{
        if(doc==undefined || doc.length==0) {
            userDetails.save().then(result=> {
                // console.log("response obtained is : ", result);
                const server_token = jwt.sign({uid:result.email},utils.server_secret_key);
                console.log("UID from JWT: ", result.email);
                User.updateOne({_id : result._id},{$set:{
                    applicant_id : result._id
                  }})
                  .then( res => {
                      // console.log("Applicant ID: " , res);
                  })
                  .catch(errors => {
                     console.log("error while updating applicant id", errors);
                  })
                res.status(200).json({
                message : "Applicant Profile Created Successfully",
                server_token: server_token,
                applicant_id: result._id,
                current_user: result.email,
                user_Details: result
              });
          })
          .catch(err => {
            console.log("error obtained is : ", err);
          });
      } else {
        res.status(400).json({
          message: "Applicant is already registered, please login"
        });
      }
    })
    .catch(err => {
      console.log(
        "error while checking if user is already signed in or not: ",
        err
      );
    });
});
//=======================================================================
router.post('/updateProfile', function (req,res,next) {
	console.log("inside update profile",req.body);
  console.log("Student flag is : ", req.body.student_flag);
  var workexperience="";
  var educationDetails="";
  if(req.body.company != undefined && req.body.experience !='') {
      workexperience = req.body.experience +" years of experience at : " + req.body.company;
  }
  if(req.body.school != undefined && req.body.education !='') {
      educationDetails = "Pursued " +req.body.education + " at " + req.body.school;
  }
  var student_flag = req.body.student_flag == true ? 1 : 0;
  var dataChange={$push: { workexperience: workexperience, educationDetails: educationDetails},$set:
  {
    last_name : req.body.last_name,
    email : req.body.email,
    job_title : req.body.job_title,
    address :req.body.city +","+req.body.state,
    state :req.body.state,
    city :req.body.city,
    country : req.body.country,
    student_flag : student_flag,
    school :req.body.school,
    zip_code :req.body.zip_code,
    company: req.body.company,
    experience :req.body.experience,
    education :req.body.education,
    skills :req.body.skills,
    profile_summary :req.body.profile_summary,
    profile_img :req.body.profileImage,
    status : req.body.status,
    headline : req.body.headline,
    resume_path : req.body.profileResume
  }}
  console.log("Work details: ", workexperience);
  User.updateOne({applicant_id : req.body.applicant_id},dataChange)
    .exec()
    .then(doc => {
      console.log("Data Obtained after updation is : ", doc);
      User.find({"applicant_id":req.body.applicant_id})
      .exec()
      .then(result => {
        console.log("Response sent after updation is : ", result);
        res.status(200).json({
            message : "User profile updated",
            userProfileDetails : result[0]
        });
      });
    })
    .catch(err => {
      console.log("error while updating user", err);
      res.status(400).json({
        message: "User profile could not be updated"
      });
    });
});

//==============================================================================================
router.post('/getProfile', function (req,res,next) {
  console.log("inside get profile post",req.body.applicant_id);
  User.find({"applicant_id": req.body.applicant_id})
    .exec()
    .then(doc => {
      console.log("response got : ", doc[0]);
      if(!doc || doc[0]=='' || doc.length==0 || doc[0] == undefined) {
        // console.log('pl')
        res.status(400).json({
              message : "Applicant_id is not correct! Please try again later."
            });
      }
      else {
        res.status(200).json({
              message : "User profile fetched successfully",
              userDetails: doc[0]
            });
          }
      })
    .catch(err => {
      console.log("Error : ", err);
      res.status(400).json({
        message: "User profile can not be fetched successfully"
      });
    });
});
//==============================================================================================
router.post('/userViewTrace', function (req,res,next) {
  console.log("inside profile trace post",req.body.applicant_id);
  // var mydate = new Date().toISOString().split('T')[0];
  var mydate = new Date().toISOString();
  console.log("Timestamp: ", mydate);
  var d = new Date();
  d.setDate(d.getDate());
  const userDetails=new UserTrace({
    applicant_id: req.body.applicant_id,
    timestamp: new Date(d).toISOString(),
    viewer_applicant_id: req.body.viewer_applicant_id
  });
  userDetails.save().then(result => {
      console.log("result: ", result);
    res.status(200).json({
          message : "User trace saved successfully"
        });
  })
  .catch(err=> {
    res.status(400).json({
            message : "User trace can not be saved"
          });
  });
});
//==============================================================================================
router.post('/getTraceData', function (req,res,next) {
  console.log("inside get applicant trace data",req.body);
  var mydate = new Date().toISOString();
  console.log("Value of mydate: ", mydate);
  var d = new Date();
  d.setMonth(d.getMonth() - 1);
  console.log("Value of d: ", d);
  UserTrace.find({
              "applicant_id" : req.body.applicant_id,
              "timestamp": {
                              $lte: new Date(mydate).toISOString()
                            },
              "timestamp": {
                              $gte: new Date(d).toISOString()
                            }
            })
  .exec()
  .then(result => {
    console.log("Response sent after fetching is : ", result);
    res.status(200).json({
        message : "User profile view trace data fetched",
        userTraceDetails : result
    });
  });
});
//==============================================================================================
router.post("/users", function(req, res, next) {
  console.time("Query_Time");
  const{first_name} = req.body;
  var result = [];
  console.log("Inside Search Post Request");

  /*
  client.get(userresult,function(err,value){
    if(err) {
      return console.log(err);
    }
    if(value) {
        console.log("First name: ",req.body.first_name);
      console.log("Type of value :", typeof(value));
      result = JSON.parse(value);
      client.expire(userresult,1);
      res.status(200).json({result});
      return console.timeEnd("Query_Time");
    }
    else {
      console.log("First name: ",req.body.first_name);
      const regexname = new RegExp(req.body.first_name,'i');
      User.find({$or :[{"first_name":regexname},{"last_name":regexname}]})
        .then(response => {
          console.log("Response from find users", response);
          client.set(userresult,JSON.stringify(response),function(err){
            if(err) {
              return console.error(err);
            }
          })
          result = response;
          res.status(200).json({result});
          return console.timeEnd("Query_Time");

        })
        .catch(err => {
          console.log("Error : ", err.response);
          res.status(500).json({
            message: "internal server error"
          });
        });
    }
  });
  */

 const regexname = new RegExp(first_name,'i');
 User.find({$or:[{"first_name":regexname},{"last_name":regexname}]})
 .then(response => {
   //console.log("Response from find users", response);

   result = response;
   res.status(200).json({result});
   console.log(result);
   //return console.timeEnd("Query_Time");

 })
 .catch(err => {
   console.log("Error : ", err.response);
   res.status(500).json({
     message: "internal server error"
   });
 });
});
// router.post("/users", function(req, res, next) {
//   console.time("Query_Time");
//   var result = [];
//   console.log("Inside Search Post Request");
//   client.get(userresult,function(err,value){
//     if(err) {
//       return console.log(err);
//     }
//     if(value) {
//       console.log("Type of value :", typeof(value));
//       result = JSON.parse(value);
//       client.expire(userresult,1);
//       res.status(200).json({result});
//       return console.timeEnd("Query_Time");
//     }
//     else {
//       kafka.make_request('search',req.body, function(err,results){
//         console.log('\n---- kafka  result of people search----');
//         console.log("results  :" + results);
//         if (err){
//             console.log("Inside err", err);
//             res.status(500).json({
//               message: "internal server error"
//             });
//         }else{
//             console.log("\nkafka results value : ",results.value);
//             res.writeHead(200,{
//                         'Content-Type' : 'application/json'
//             })
//             res.end(JSON.stringify(results.value));
//             // res.status(200).json({results.value});
//             return console.timeEnd("Query_Time");
//         }
//     })
//   }
// });
// });




module.exports = router;


