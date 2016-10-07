/**
* routes.js
*
* Callback implementation for app API endpoints.
*
*/

//======================
// Constant definitions
//======================

// Packages
const mongodb   = require('mongodb');
let ObjectId    = mongodb.ObjectId, db;

//const SUBJECTS = {"computer_science", "philosophy"};

// Prepends all API endpoints (e.g. /test -> /api/v1/test)
const api_prefix = '/api/v1'

// Associate all endpoints with respective HTTP method and callback
const routes = [
    {endpoint: '/test', method: 'get', callback: test},
    {endpoint: '/addStudent', method: 'post', callback: addStudent},
    {endpoint: '/addTutor', method: 'post', callback: addTutor},
    {endpoint: '/students', method: 'get', callback: users('students')},
    {endpoint: '/tutors', method: 'get', callback: users('tutors')},
    {endpoint: '/getTutors', method: 'post', callback: getTutorsFromId}
    //{endpoint: '/cookie', methodd: 'post', callback: makeACookie}
];

//=========================
// Callback implementation
//=========================

function dataCallback(req, res, next){
    console.log(req.params);
    return res.send('ok');
}

function test(req, res, next){
    console.log('TEST CALLBACK');
    db.collection('test', (err, coll)=>{
        if(err || !coll)
            return res.status(500).send('Unable to access test collection.');
        else coll.find().toArray((err, data)=>{
            if(err || !data.length)
              return res.status(500).send('No data in test collection.');
            return res.json(data);
        });
    });
}

function users(collection) {
  console.log("READING " + collection);
  return function(req, res, next){
    if (!db.collection(collection)) {
      console.log("creating collection " + collection);
      db.createCollection(collection);
    }
    db.collection(collection, (err, coll)=>{
        if(err || !coll)
            return res.status(500).send('Unable to access users collection.');
            else coll.find().toArray((err, data)=>{
              if(err || !data.length)
                return res.status(500).send('No data in user collection.');
              //res.send('ok');
              return res.json(data);
            });
    });
  };
}

function addStudent(req, res, next) {
  var user = req.body.user;
  user.role = 'student';
  addUser(user);
  res.send("Ok");
}

function addTutor(req, res, next) {
  var user = req.body.user;
  user.role = 'tutor';
  //console.log(user.subject);
  hasSubject(user, "computer_science");
  addUser(user);
  res.send("Ok");
}

function addUser(user) {
  console.log(user);
  let collection = user.role + 's';
  console.log(collection);
  if (!db.collection(collection)) {
    console.log("creating collection " + collection);
    db.createCollection(collection);
  }

  db.collection(collection, (err, coll)=>{
      coll.insert(user);
      res.send("Ok");
  })
  //db.collection('users').remove();
}

function hasSubject(user, subject) {
  var sub = user.subject;
  if (typeof(sub) === "string")
    return sub === subject;
  else {
    for (let key in sub) {
      console.log("key: " + key + ", value: " + sub[key]);
      if (sub.hasOwnProperty(key) && sub[key] === true && key === subject) {
        console.log(user.name + " has the subject " + key);
        return true;
      }
    }
  }
  return false;
}

function getTutorsFromId(req, res, next) {
  //let id = req.body.id;
  //console.log(id);
  //console.log(getStudentById(id));
  //let subject = s['subject'];
  //console.log("SUBJECT TO MATCH: " + subject);
  res.send('Ok');
}

function getTutorsFromStudent(student) {
  console.log(student);

}

function getStudentById(targetId) {
  /*
  var cursor = db.collection('students').find( );
  cursor.each(function(err, doc) {
      if (doc != null) {
        if (doc['_id'] == targetId) {
           getTutorsFromStudent(doc);
           return;
        }
      }
   });
   */
   //return users('students');
   //db.collection('students', (err, coll)=>{
     //coll.find().toArray((err, data)=>{
        //return data;
      //});
   //});
}



//===============================
// DB connect, set module export
//===============================

mongodb.connect('mongodb://localhost:27017/app', (err, connection)=>{
    db = connection;
    console.log('SUCCESSFUL MONGO CONNECTION');
});

module.exports = routes.map(route=>{
    return {
        endpoint: api_prefix + route.endpoint,
        method:   route.method,
        callback: route.callback
    };
});


//========
// General callbacks

function create(collection_name){
    return function(req, res, next){
        db.collection(collection_name, (err, coll)=>{
            coll.insert(req.body);
            return res.send('OK');
        });
    };
}
