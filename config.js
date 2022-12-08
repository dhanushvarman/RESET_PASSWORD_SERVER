var mongodb = require('mongodb');
var dotenv = require('dotenv').config();
var mongoClient = mongodb.MongoClient;
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

module.exports = { connectDb, closeConnection, db, connection }