const multer = require('multer')

var fs=require('file-system');
var filename="";

//storage for the multer
const storage=multer.diskStorage({
  destination :function(req,file, cb) {
    console.log("Property id passed is: ",req.body.applicant_id)
    var currentFolder = 'public/resumeFolder/' + req.body.applicant_id +'/';
    // var currentFolder = 'public/resumeFolder/';
    fs.mkdir(currentFolder, function(err){
      if(!err) {
        console.log("no error");
        cb(null , currentFolder);
      } else {
         console.log("error");
        cb(null , currentFolder);
      }
    });
  },
  filename: function(req,file,cb){
    console.log(file.originalname);
    filename=Date.now()+'-'+file.originalname;
    cb(null, filename);
  }
});

const fileFilter =(req,file, cb) => {
  console.log("Mime type: ", req.file);
  if(file.mimetype==='application/pdf') {
    cb(null,true);
  }
  else {
    cb(null,false);
  }
}

const upload = multer({
  storage:storage,
  limits:{
    fileSize: 1024*1024*5
  }
})

// const uploadresume = multer({
//     storage: storage,
//     limits: {
//       fileSize :1024*1024*5
//     },
//   }).single('resume')

// const uploadpost = multer({
//   storage:storage,
//   limits: {
//     fileSize : 1024*1024*5
//   }
// }).array('post', 5)

module.exports = upload
  // module.exports = {uploadresume, uploadpost}