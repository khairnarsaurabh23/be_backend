var express = require('express');
var router = express.Router();
var {Applications} = require('./../models/application');
var {JobPostings} = require('../models/jobpostings');
var {User} = require('./../models/user');


// var kafka = require('./../kafka/client.js');

//apply custom job
// router.post('/job', function(req, res, next) {
//     console.log("inside custom apply");
//     console.log("req sent from custom apply", req.body);
//     const customApplyDetail = new Applications({
//         HowDidYouHear: req.body.hear,
//         Email : req.body.email,
//         resume: req.body.resume,
//         First_name: req.body.firstname,
//         Last_name: req.body.lastname,
//         Address : req.body.address,
//         Phone : req.body.contact,
//         Gender : req.body.gender,
//         Race : req.body.race,
//         Veteran : req.body.veteran,
//         Disability : req.body.disability,
//         CompanyName : req.body.company,
//         JobTitle : req.body.jobtitle,
//         JobLocation : req.body.joblocation,
//         Applied : true,
//         Saved : false,
//         CompanyLogo : req.body.companyLogo,
//         Job_id : req.body.id,
//         easyApply : req.body.easyApply
//     });
//     customApplyDetail.save().then((result)=> {
//         console.log("apply successful : ",result);
//                          // res.sendStatus(200).end();
//                          res.writeHead(200,{
//                              'Content-Type' : 'application/json'
//                          });
//                          res.end(JSON.stringify("Applied successfully"));
//     },(err)=>{
//         console.log("Error While applying custom job");
//     })

//   });
// router.post('/job', function(req, res, next) {
//     console.log("inside custom apply");
//     console.log("req sent from custom apply", req.body);
//     Applications.findOne({Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Saved:true, Applied:false},function(err, doc) {
//         if(err){res.status(400).send("error occured")}
//         else{
//             if(doc){
//                 console.log("\n..found saved application....\n");
//                 Applications.update(
//                     {Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Saved:true, Applied:false},
//                     {$set :
//                          {
//                             HowDidYouHear: req.body.hear,
//                             Email : req.body.email,
//                             resume: req.body.resume,
//                             First_name: req.body.firstname,
//                             Last_name: req.body.lastname,
//                             Address : req.body.address,
//                             Phone : req.body.contact,
//                             Gender : req.body.gender,
//                             Race : req.body.race,
//                             Veteran : req.body.veteran,
//                             Disability : req.body.disability,
//                             Applied : true,
//                             Saved : false,
//                          }
//                      })
//                     .then(item => {
//                         console.log("application after update : ", item);
//                         res.writeHead(200,{
//                             'Content-Type' : 'application/json'
//                         });
//                         res.end(JSON.stringify("Applied successfully"));
//                     })
//                     .catch(err => {
//                         console.log("error while updating saved application", err);
//                         // res.status(400).json({
//                         //     message : "User profile could not be updated"
//                         // });
//                     })
//             }
//             else{
//                 console.log("-----it's new application....")
//                 const customApplyDetail = new Applications({
//                     Applicant_id : req.body.Applicant_id,
//                     HowDidYouHear: req.body.hear,
//                     Email : req.body.email,
//                     resume: req.body.resume,
//                     First_name: req.body.firstname,
//                     Last_name: req.body.lastname,
//                     Address : req.body.address,
//                     Phone : req.body.contact,
//                     Gender : req.body.gender,
//                     Race : req.body.race,
//                     Veteran : req.body.veteran,
//                     Disability : req.body.disability,
//                     CompanyName : req.body.company,
//                     JobTitle : req.body.jobtitle,
//                     JobLocation : req.body.joblocation,
//                     Applied : true,
//                     Saved : false,
//                     CompanyLogo : req.body.companyLogo,
//                     Job_id : req.body.Job_id,
//                     easyApply : req.body.easyApply,
//                     appliedDate : req.body.appliedDate,
//                     cover_letter : req.body.cover_letter
//                 });
//                 customApplyDetail.save().then((result)=> {
//                     console.log("apply successful : ",result);
//                                      // res.sendStatus(200).end();
//                                      res.writeHead(200,{
//                                          'Content-Type' : 'application/json'
//                                      });
//                                      res.end(JSON.stringify("Applied successfully"));
//                 },(err)=>{
//                     console.log("Error While applying to custom job");

//                 })
//             }
//         }
//     })


//   });



router.post('/job', function(req, res, next) {
    console.log("inside custom apply");
    console.log("req sent from custom apply", req.body);
    Applications.findOne({Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Saved:true, Applied:false},function(err, doc) {
        if(err){
            console.log("error occured while searching for job application:\n", err)
            res.status(400).json({
                message: "Unable to find your application"
            })
        }
        else{
            if(doc){
                console.log("\n..found saved application....\n");
                Applications.updateOne(
                    {Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Saved:true, Applied:false},
                    {$set :
                         {
                            HowDidYouHear: req.body.hear,
                            Email : req.body.email,
                            resume: req.body.resume,
                            First_name: req.body.firstname,
                            Last_name: req.body.lastname,
                            Address : req.body.address,
                            Phone : req.body.contact,
                            Gender : req.body.gender,
                            Race : req.body.race,
                            Veteran : req.body.veteran,
                            Disability : req.body.disability,
                            Applied : true,
                            Saved : false,
                         }
                     })
                    .then(item => {
                        console.log("application after update : ", item);
                        JobPostings.findOneAndUpdate({"_id":req.body.Job_id},{$inc:{ "numberofApplicants":1}},(err,success)=>{
                            if(err){
                                console.log("error occured while updating job posting model:\n",err);
                                response.sendStatus(201);
                            }
                            else{
                                console.log("in success");
                                User.findByIdAndUpdate({"_id":req.body.Applicant_id},{ $addToSet:{applied_job:req.body.Job_id} },(err,success)=>{
                                    if(err){
                                        console.log(err);
                                        response.sendStatus(201);
                                    }else{
                                        console.log("In success of custom apply job");
                                        // response.sendStatus(200);
                                        res.writeHead(200,{
                                            'Content-Type' : 'application/json'
                                        });
                                        res.end(JSON.stringify("Applied successfully"));

                                    }
                                })

                            }
                        });

                    })
                    .catch(err => {
                        console.log("error while updating saved application", err);
                        // res.status(400).json({
                        //     message : "User profile could not be updated"
                        // });
                    })
            }
            else{
                Applications.findOne({Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Applied:true, Saved:false},function(err, doc) {
                    if(err){res.status(400).send("error occured")}
                    else {
                        if(doc){
                            console.log("Already applied to this job ")
                            // res.status(401).json({
                            //     message: "Already applied to this job"
                            // });
                            res.writeHead(200,{
                                'Content-Type' : 'application/json'
                            });
                            res.end(JSON.stringify("Already applied"));
                        }
                        else{console.log("-----it's new application....")
                        const customApplyDetail = new Applications({
                            Applicant_id : req.body.Applicant_id,
                            RecruiterEmail : req.body.RecruiterEmail,
                            HowDidYouHear: req.body.hear,
                            Email : req.body.email,
                            resume: req.body.resume,
                            First_name: req.body.firstname,
                            Last_name: req.body.lastname,
                            Address : req.body.address,
                            Phone : req.body.contact,
                            Gender : req.body.gender,
                            Race : req.body.race,
                            Veteran : req.body.veteran,
                            Disability : req.body.disability,
                            CompanyName : req.body.company,
                            JobTitle : req.body.jobtitle,
                            JobLocation : req.body.joblocation,
                            Applied : true,
                            Saved : false,
                            CompanyLogo : req.body.companyLogo,
                            Job_id : req.body.Job_id,
                            easyApply : req.body.easyApply,
                            appliedDate : req.body.appliedDate,
                            cover_letter : req.body.cover_letter
                        });
                        customApplyDetail.save().then((result)=> {
                            console.log("apply successful : ",result);
                            JobPostings.findOneAndUpdate({"_id":req.body.Job_id},{$inc:{ "numberofApplicants":1}},(err,success)=>{
                                if(err){
                                    console.log(err);
                                    response.sendStatus(201);
                                }
                                else{
                                    console.log("in success");
                                    User.findByIdAndUpdate({"_id":req.body.Applicant_id},{ $addToSet:{applied_job:req.body.Job_id} },(err,success)=>{
                                        if(err){
                                            console.log(err);
                                            response.sendStatus(201);
                                        }else{
                                            console.log("In success of custom apply job");
                                            // response.sendStatus(200);
                                            res.writeHead(200,{
                                                'Content-Type' : 'application/json'
                                            });
                                            res.end(JSON.stringify("Applied successfully"));

                                        }
                                    })

                                }
                            });
                        },(err)=>{
                            console.log("Error While applying to custom job", err);

                        })}
                    }

                })


            }
        }
    })


  });
// router.post('/job', function(req, res, next) {
//     console.log("inside custom apply");
//     console.log("req sent from custom apply", req.body);
//     kafka.make_request('custom_apply',req.body, function(err,results){
//         console.log('\n---- kafka  result of custom job apply----');
//         console.log("results  :" + results);
//         if (err){
//             console.log("Inside err");
//             res.json({
//                 status:"error",
//                 msg:"System Error, Try Again."
//             })
//         }else{
//             console.log("\nkafka results value : ",results.value);
//             res.writeHead(200,{
//                        'Content-Type' : 'application/json'
//              })
//             res.end(JSON.stringify(results.value));
//      }
//     })
// })




  //applied jobs in dashboard
  router.get('/applied/:ID', function(req, res, next) {
    console.log("inside appled jobs");
    console.log("req sent from applied job dashboard", req.body);
    console.log("applicant id : " + req.params.ID)
    Applications.find({Applicant_id:req.params.ID, Applied:true, Saved:false}).then((app)=> {
        console.log("\nNumber of applied jobs: " + app.length + "\n");
        console.log("Applied jobs : "+ app );
        res.writeHead(200,{
            'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(app));
    }, (err) => {
        console.log("error : " + err)
        console.log("inside 400");
        res.sendStatus(400);
    //     res.writeHead(400,{
    //         'Content-Type' : 'text/plain'
    //     })
    //    res.end("Invalid details");
    }

  );
});
// router.get('/applied/:ID', function(req, res, next) {
//     console.log("inside applied jobs");

//     console.log("applicant id : " + req.params.ID)
//     kafka.make_request('applied_jobs',req.params.ID, function(err,results){
//         console.log('\n---- kafka  result of applied jobs dashboard ----');
//         console.log("results  :" + results);
//         if (err){
//             console.log("Inside err");
//             res.json({
//                 status:"error",
//                 msg:"System Error, Try Again."
//             })
//         }else{
//             console.log("\nkafka results value : ",results.value);
//             res.writeHead(200,{
//                        'Content-Type' : 'application/json'
//              })
//             res.end(JSON.stringify(results.value));
//      }
//     })
// });

//Saved jobs in dashboard

router.get('/saved/:ID', function(req, res, next) {
    console.log("inside saved jobs");
    console.log("req sent from saved job dashboard", req.body);
    console.log("applicant id : " + req.params.ID)
    Applications.find({Applicant_id:req.params.ID, Saved:true, Applied:false}).then((app)=> {
        console.log("\nNumber of saved jobs: " + app.length + "\n");
        console.log("Saved jobs : "+ app );
        res.writeHead(200,{
            'Content-Type' : 'application/json'
        })
        res.end(JSON.stringify(app));
    }, (err) => {
        console.log("error : " + err)
        console.log("inside 400");
        res.sendStatus(400);
    //     res.writeHead(400,{
    //         'Content-Type' : 'text/plain'
    //     })
    //    res.end("Invalid details");
    }

  );
});
// router.get('/saved/:ID', function(req, res, next) {
//     console.log("inside saved jobs");
//     console.log("applicant id : " + req.params.ID)
//     kafka.make_request('saved_jobs',req.params.ID, function(err,results){
//         console.log('\n---- kafka  result of saved jobs dashboard ----');
//         console.log("results  :" + results);
//         if (err){
//             console.log("Inside err");
//             res.json({
//                 status:"error",
//                 msg:"System Error, Try Again."
//             })
//         }else{
//             console.log("\nkafka results value : ",results.value);
//             res.writeHead(200,{
//                        'Content-Type' : 'application/json'
//              })
//             res.end(JSON.stringify(results.value));
//      }
//     })
// });

//==============================================================================================
router.post('/getrecruiterdashboard', function (req,res,next) {
  console.log("inside get recuriter applicants data",req.body);
  var mydate = new Date().toISOString();
  console.log("Value of mydate: ", mydate);
  var d = new Date();
  d.setMonth(d.getMonth() - 1);
  console.log("Value of d: ", d);
  Applications.find({
              "RecruiterEmail" : req.body.RecruiterEmail

            })
  .exec()
  .then(result => {
    res.status(200).json({
        message : "Applications data fetched for the recruiter",
        userTraceDetails : result
    });
  })
  .catch(err => {
    console.log("Error : ", err.response);
    res.status(500).json({
      message: "internal server error"
    });
  });
});


router.post('/easy', function(req, res, next) {
    console.log("---Inside easy apply---");
    console.log("req sent from easy apply", req.body);
    Applications.findOne({Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Saved:true, Applied:false},function(err, doc) {
        if(err){
            console.log(err)
            res.sendStatus(201);
        }
        else{
            if(doc){
                console.log("\n..found saved application....\n");
                Applications.updateOne(
                    {Applicant_id:req.body.Applicant_id, Job_id:req.body.Job_id, Saved:true, Applied:false},
                    {$set :
                         {
                            Email : req.body.email,
                            resume: req.body.resume,
                            First_name: req.body.firstname,
                            Last_name: req.body.lastname,
                            appliedDate : req.body.appliedDate,
                            postingDate :req.body.postingDate,
                            Applied : true,
                            Saved : false,
                         }
                     })
                    .then(item => {
                        console.log("application after update : ", JSON.stringify(item));
                        JobPostings.findOneAndUpdate({"_id":req.body.Job_id},{$inc:{ "numberofApplicants":1}},(err,success)=>{
                            if(err){
                                console.log(err);
                                response.sendStatus(201);
                            }
                            else{
                                console.log("in success");
                                User.findByIdAndUpdate({"_id":req.body.Applicant_id},{ $addToSet:{applied_job:req.body.Job_id} },(err,success)=>{
                                    if(err){
                                        console.log(err);
                                        response.sendStatus(201);
                                    }else{
                                        console.log("In success of easy apply job");
                                        // response.sendStatus(200);
                                        res.writeHead(200,{
                                            'Content-Type' : 'application/json'
                                        });
                                        res.end(JSON.stringify("Applied successfully"));

                                    }
                                })

                            }
                        });

                    })
                    .catch(err => {
                        console.log("error while updating saved application", err);
                        res.sendStatus(201);
                    })
            }
            else{
                console.log("Inside else of easy apply")
            }
        }
    })

  });


  module.exports = router;
