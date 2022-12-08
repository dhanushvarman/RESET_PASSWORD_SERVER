var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
let db;
let connection;

async function connectDb(req, res, next) {

    connection = await mongoClient.connect(process.env.DB);
    db = await connection.db("Reset");
    return db
}

async function closeConnection(req, res, next) {
    if (connection) {
        await connection.close()
    } else {
        console.log("No Connection")
    }

}

module.exports = { connectDb, connection, db, closeConnection }