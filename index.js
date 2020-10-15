const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

let server = require('./server');
let config = require('./config');
let middleware = require('./middleware');
const response = require('express');

const url = 'mongodb://127.0.0.1:27017';
const dbname = "hospitalsManagement";
let db

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
});

app.get('/hospitalsManagement', middleware.checkToken, (req, res) => {
    console.log("getting things ready");
    const data = db.collection("hospitals").find().toArray()
        .then(result => res.json(result));
});

app.get('/ventilatorDetails', middleware.checkToken, (req, res) => {
    console.log("getting things ready");
    const data = db.collection("ventilators").find().toArray()
        .then(result => (res.json(result)));
});

app.post('/searchventbyStatus', middleware.checkToken, (req, res) => {
    const Status = req.query.Status;
    console.log(Status);
    const ventilatorDetails = db.collection('ventilators')
        .find({ "Status": Status }).toArray().then(result => res.json(result));
});

app.post('/searchventbyname', middleware.checkToken, (req, res) => {
    const Name = req.query.Name;
    console.log(Name);
    const ventilatorDetails = db.collection('ventilators')
        .find({ 'Name': new RegExp(Name, 'i') }).toArray().then(result => res.json(result));
});

app.post('/searchhospitals', middleware.checkToken, (req, res) => {
    const Name = req.query.Name;
    console.log(Name);
    const ventilatorDetails = db.collection('hospitals')
        .find({ 'Name': new RegExp(Name, 'i') }).toArray().then(result => res.json(result));
});

app.post('/addvent', (req, res) => {
    const HID = req.query.HID;
    const ventilatorID = req.query.ventilatorID;
    const Status = req.query.Status;
    const Name = req.query.Name;
    console.log("adding ventilators, please wait a moment");
    const item = { "HID": HID, "ventilatorID": ventilatorID, "Status": Status, "Name": Name };
    db.collection("ventilators").insertOne(item, function (err, result) {
        res.json("inserted successfully");
    });
});

app.put('/updateventilators', middleware.checkToken, (req, res) => {
    const ventilatorID = { ventilatorID: req.query.ventilatorID };
    console.log(ventilatorID);
    const newvalues = { $set: { Status: req.query.Status } };
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilators").updateOne(ventilatorID, newvalues, function (err, result) {
        res.json('updated one document');
        if (err) throw err;
    });
});

app.delete('/deletevent', middleware.checkToken, (req, res) => {
    const ventilatorID = req.query.ventilatorID;
    console.log(ventilatorID);
    const temp = { "ventilatorID": ventilatorID };
    db.collection("ventilators").deleteOne(temp, function (err, obj) {
        if (err) throw err;
        res.json("deleted one element");
    });
});

app.listen(9000, (req, res) => {
    console.log("working well");
});
