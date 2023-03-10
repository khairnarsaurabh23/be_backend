// const mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
const mongo_url = require('./../constants/constants.js').MONGO_URI;
var _db;

const connectMongo = async function(){
    try{
        const db = await MongoClient.connect(mongo_url,{useNewUrlParser:true});
        _db = db
        return Promise.resolve(db);
    }catch(error){
        return Promise.reject("Could not connect to MLAB Mongo db in mongoconnectiondb.js");
    }
}
// const connect = () => {
// 	mongoose.connect(process.env.DB_URL)
// 	.then(console.log('DB CONNECTION SUCCESSFULLY ESTABLISHED'))
// 	.catch(error => {
// 		console.log('DB CONNECTION FAILED');
// 		console.log(error);
// 		process.exit(1);
// 	})
// };

// module.exports = connect;


module.exports = {connectMongo};
