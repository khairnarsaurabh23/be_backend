var express = require('express');
var router = express.Router();
// var mysql=require('./mysql.js')                              ;
const upload = require('../util/multer');
const cloudinary = require('../util/cloudinary');
const { log,auth, userRole } = require('../middleware/user');
// var localStorage=require('localStorage');
// var fs=require('file-system');
// var filename="";
// const storage=multer.diskStorage({
//   destination :function(req,file, cb) {
//     console.log("Property id passed is: ",req.body.applicant_id)
//     var currentFolder = 'public/resumeFolder/' + req.body.applicant_id +'/';
//     fs.mkdir(currentFolder, function(err){
//       if(!err) {
//         console.log("no error");
//         cb(null , currentFolder);
//       } else {
//          console.log("error");
//         cb(null , currentFolder);
//       }
//     });
//   },
//   filename: function(req,file,cb){
//     console.log(file.originalname);
//     filename=Date.now()+'-'+file.originalname;
//     cb(null, filename);
//   }
// });

// const fileFilter =(req,file, cb) => {
//   console.log("Mime type: ", req.file);
//   if(file.mimetype==='application/pdf') {
//     cb(null,true);
//   }
//   else {
//     cb(null,false);
//   }
// }

// const upload=multer({
//     storage: storage,
//     limits: {
//       fileSize :1024*1024*5
//     },
//   });

//TESTED:OK
router.post('/uploadresume',log, auth, userRole('student'), upload.single('resume') , function(req , res , next) {
  const file = req.file
  if(file){
      console.log("Username passed is: ",req.user.applicant_id);
      console.log("Mime type: \n", file);
      cloudinary.uploader.upload(file.path, {
        folder:file.destination, 
        use_filename:true
      })
      .then(result => {
        console.log("result from cloudinary:\n",result)
        res.status(200).json({

          message: "resume uploaded successfully",
          result
        })
        .catch(err => {
          console.log(err)
          res.status(400).json({
            message: "resume upload failed, please try again",
            err
          })
        })
      })
  }
  else {
    console.log("please send the resume, file not received")
    next()
  }
  // upload.single('photos')
  // upload.uploadresume(req,res, function(err){
	// 	if(err){
	// 		console.log(err)
	// 		return res.end('something went wrong')
	// 	}
	// 	else{
  //     console.log("Username passed is: ",req.body.applicant_id);
  //     console.log("Mime type: ", req.file);
  //     res.status(200).json({
  //           message : "Resume uploaded successfully!",
  //           filename : req.body.applicant_id + "_resume"
  //           })
	// 	}
	// })
})
  // console.log("Inside upload resume pic API");
//   console.log("Username passed is: ",req.body.applicant_id);
//   console.log("Mime type: ", req.file);
//   res.status(200).json({
//         message : "Resume uploaded successfully!",
//         filename : req.body.applicant_id + "_resume"
//         })
// });

module.exports = router;
