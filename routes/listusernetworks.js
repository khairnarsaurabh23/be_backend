var express = require('express');
var router = express.Router();
var utils = require('../util/utils');
var mysql=require('./mysql.js');
var {mongoose} = require('../db/mongoose');
// const bodyParser = require('body-parser');
// var kafka = require('./../kafka/client');
var app = express();
var {User} = require('../models/user');
var {Notification}=require('../models/notification');
const { log, auth, userRole } = require('../middleware/user');
//const io = require('socket.io')();
//io.listen(3000)


router.get('/listallconnections', function(req, res, next) {
	console.log("listallconnections request",req.query.email )
	var list=[];
	User.find({
	email:{$ne:req.query.email }
	}, function(err, users) {
		//var emailuser = req.query.email;
		User.find({
			email:{$eq:req.query.email }
			}, function(err, userone) {
				users.map(user=>{
				//	console.log("connections",userone.connections.length)
					console.log("user--->",userone[0])
					console.log(user)
					if(userone[0].connections.length) //all connection
					{
					for(var i=0;i<userone[0].connections.length;i++) //for all conn
					{
						if(user.email!=userone[0].connections[i].email) // if not in conection
						{ 
							list.push(user);
						}
					}}
					else{	
						list.push(user)		
						console.log(list)
					}
			})
			console.log("before sending response is ",list)
			res.status(200).json({responseData:list});
		})
	});
});




//sending connection request
//review: time complexity ir very bad
//TESTED:OK
router.post('/requestConnection',log, auth, userRole('student','alumni'), function(req, res, next) {
	console.log("sending friend request to connection...",req.body)
	console.log("from",req.body.from);
	console.log("to",req.body.to)
	var from = req.body.from;
	var to = req.body.to;
	const name = req.user.first_name+" "+req.user.last_name

	//var username = req.body.from;
	// first add 'to' to 'from's waiting list
	User.findOne({_id:req.user.applicant_id},function(err,data){
		console.log("from user data->",data)
		var wtn = data.waiting;
	
		wtn.push(to);
		console.log("waiting req",wtn)
		var dataChange = {waiting:wtn};
		User.updateOne({_id: req.user.applicant_id}, dataChange, function (err, user) {
			// now add 'from' to 'to's pending list
			User.findOne({email:to},function(err,data){
				var pnddata={
					email: from,
					first_name:req.user.first_name,
					last_name:req.user.last_name,
					job_title:req.user.job_title
				}
				// pnd.push(from);
				console.log("pending request before query sending pnd",pnddata)
				//dataChange = {pending:pnd};
				User.updateOne({email:to}, { $push: {pending: pnddata }},function(err,user){
					// if all successful, send notification message
					var notification = new Notification( { 
						body: name+" has sent you a friend request!",
						time: new Date().getTime(),
						status: "not_read",
						from: from,
						to: to,
						type : "req"
					});
					notification.save( function (err) {
						//io.sockets.emit('notification', {notificationData: notification});
						res.status(200).json({ disabled:true, success: true, notifData: notification });
						//res.status(200).json("notifData",notification);
						//res.redirect('/users/'+to);
					});
				});
			});
		});
	});
})

// respond to friend request
//this route needs to be redisigned
//TESTED:OK
router.post('/respondToRequest',log, auth, userRole('student','alumni'), function (req, res) {
	console.log("user response",req.user)
	var ans = req.body.ans;
	if(ans === 1)
		console.log("Request Accepted...");
	else if(ans===0)
		console.log("Request Rejected...");
	var from = req.body.from;
	var to = req.body.to;
	// var toUserDetails=req.body.toUserDetails;
	// first remove 'from' from 'to's pending list
	User.findOne({_id:req.user.applicant_id},function(err,data){
		var pnd = data.pending;
		console.log("pending data of user***********",data.pending)
		for(var i=0;i<pnd.length;i++)
			if(pnd[i].email===from)
				break;
		pnd.splice(i,1);
		var friend = data.connections;
		if(ans === 1) //here cud be problem *1
		friend.push(from);
		User.findOne({email:from},function(err,data){
			console.log("after acceptiong...data..is..",data)
			var friend={
			email:from,
			first_name:data.first_name,
			last_name:data.last_name,
			job_title:data.job_title,
			experience:data.experience,
			}
			console.log("friendlist 1->",friend)
			console.log("Data changed  after accept", pnd)
			if(ans === 1) 
				var dataChange={$push: { connections: friend},$set:{pending:pnd}}
			if(ans==0)
				var dataChange={$set:{pending:pnd}}
			User.updateOne({_id:req.user.applicant_id},dataChange, function (err, user) {

				// now remove 'to' from 'from's waiting list
				User.findOne({email:from},function(err,data){
					var existingWaitingList = data.waiting;
					for(var i=0;i<existingWaitingList.length;i++)
						if(existingWaitingList[i]===to)
							break;
							existingWaitingList.splice(i,1); //removed that particular element from list

					var friendList = data.connections;
					if(ans ===1)
					friendList.push(to);
					var friend={
						email:to,
						first_name:req.user.first_name,
						last_name:req.user.last_name,
						job_title:req.user.job_title,
						experience:req.user.experience,
					}
					console.log("friendlist 2->",friend)
					if(ans === 1)
					var dataChange={ $push: { connections: friend} ,$set:{waiting: existingWaitingList }}
					if(ans === 0)
					var dataChange={$set:{waiting: existingWaitingList }}
					User.updateOne({email:from},dataChange,function(err,data){
						// send notification of acceptance
						if(ans === 1){
							var notification = { 
								body: req.user.first_name+" "+req.user.last_name+" has accepted your friend request!",
								time: new Date().getTime(),
								status: "not_read",
								from: from,
								to: to,
								type : "res",
								connections:friendList,
								pending:pnd
							};
							var newNotify = new Notification(notification).save(function (err) {
								//io.sockets.emit('notification', {notificationData: notification});
								res.status(200).json({ disabled:true, success: true, notifData: notification });
								//res.status(200).json({notification})
								//res.redirect('/users/'+from);
							});
						}
					
						// send notification of rejection
						else{
							var notification = { 
								body: req.user.first_name+" "+req.user.last_name+" has rejected your friend request!",
								time: new Date().getTime(),
								status: "not_read",
								from: from,
								to: to,
								type : "res",
								pending:pnd
							};
							var newNotify = new Notification(notification).save(function (err) {
								//io.sockets.emit('notification', {notifData: notifData});
								res.status(200).json({ disabled:true, success: true, notifData: notification });
								//res.status(200).json({notifData})
								//res.redirect('/users/'+username);
							});
						}
					});	
				});
			});
		});
	});
});



module.exports = router;