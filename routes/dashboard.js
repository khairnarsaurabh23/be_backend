var express = require('express');
var router = express.Router();
var {UserActivity} = require('../models/UserActivity');
var {Applications} = require('../models/application.js');
var {UserActivityIncomplete} = require('../models/UserActivityIncomplete');
const { log,auth, userRole } = require('../middleware/user');

//TESTED:OK
  router.get('/getuserclicks',log, auth, userRole('alumni'), function(req, res) {
    console.log("Received Body ", req.query)
    UserActivity.find({recruiterName:req.query.mail}).then((app)=> {
     //   console.log("\n Number of Clicks for" + app + "\n");
      //  console.log(app.length);
        res.writeHead(200,{
            'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(app));
    }, (err) => {
        console.log("error : " + err)
        console.log("inside 400");
        res.writeHead(400,{
            'Content-Type' : 'text/plain'
        })
       res.end("Invalid details");
    })
  });

  //NEED TO BE TESTED AGAIN
  router.get('/savedJobs',log, auth, userRole('alumni'), function(req, res) {
    console.log("Received Body ", req.query)
    Applications.find({Saved:"true",RecruiterEmail:req.query.mail}).then((app)=> {
       // console.log("\nJobs are " + app + "\n");
       // console.log(app.length);
        res.writeHead(200,{
            'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(app));
    }, (err) => {
        console.log("error : " + err)
        console.log("inside 400");
        res.writeHead(400,{
            'Content-Type' : 'text/plain'
        })
       res.end("Invalid details");
    })
  });

  //TESTED:OK
  router.get('/halffilled',log, auth, userRole('alumni'), function(req, res) {
    console.log("Received Body for HALF FILLED", req.query)
    UserActivityIncomplete.find({RecruiterEmail:req.query.mail}).then((app)=> {
        console.log("\n Number of HALFFILLED" + app + "\n");
        console.log(app.length);
        res.writeHead(200,{
            'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(app));
    }, (err) => {
        console.log("error : " + err)
        console.log("inside 400");
        res.writeHead(400,{
            'Content-Type' : 'text/plain'
        })
       res.end("Invalid details");
    })
  });

  //NEED TO BE TESTED AGAIN
  router.get('/fullfilled',log, auth, userRole('alumni'), function(req, res) {
    console.log("Received Body ", req.query)
    Applications.find({Applied:"true",RecruiterEmail:req.query.mail}).then((app)=> {
        console.log("\n Fully applied jobs" + app + "\n");
        console.log(app.length);
        res.writeHead(200,{
            'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(app));
    }, (err) => {
        console.log("error : " + err)
        console.log("inside 400");
        res.writeHead(400,{
            'Content-Type' : 'text/plain'
        })
       res.end("Invalid details");
    })
  });

  module.exports = router;
