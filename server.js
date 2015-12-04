
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./server/users/usermodel');
var twilioEnv = require('./server/config/config.js');
var client = require('twilio')(twilioEnv.accountSid, twilioEnv.authToken);


//express config
var app = express();
app.use(express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


var port = process.env.PORT || 3000;

app.listen(port);
console.log('listening on port:', port);

//connect mongo DB
var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/BusitBaby_db10';

mongoose.connect(mongoURI);


/*==============================================
=            TWILLIO IMPLEMENTATION            =
==============================================*/
//CREATE TWILLIO FUNCTION
var twillio = function(number, message) {
  console.log('twillio fired');
  //twilio #
  var twilio_number = '+12313071512';

  //require the Twilio module and create a REST client
  // var client = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

  var shanNumber = "+19493954894"
  var peterNumber = "+821074511080";
  var samNumber = "+12147251641";
  var aliceNumber = "+15049521104";

  //Send an SMS text message
  client.sendMessage({

      to: '+1'+number, // Any number Twilio can deliver to
      from: twilio_number, // A number you bought from Twilio and can use for outbound communication
      body: message // body of the SMS message

  }, function(err, responseData) { //this function is executed when a response is received from Twilio

      if (!err) { // "err" is an error received during the request, if any
          // "responseData" is a JavaScript object containing data received from Twilio.
          // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
          // http://www.twilio.com/docs/api/rest/sending-sms#example-1
          console.log(responseData.from); // outputs "+14506667788"
          console.log(responseData.body); // outputs "word to your mother."

      }
  });

};

//keep watch DB using setInterval
var watchisInMiles = setInterval(function(){
  //if isInMiles is true
  User.findOne({'isInMiles': true}, function(err, user){
    if(!err){
      //fire twillio function
      if(user){
        // twillio(user.contact.number, user.contact.message); //--------- enable this when deploying the app.
        console.log('get with isInMiles true', user);
        clearInterval(watchisInMiles);
      }
    } else {
      console.error("error while getting a user");
    }
  });
}, 3000);


/*=====  End of TWILLIO IMPLEMENTATION  ======*/



/*==========================================
=            API IMPLEMENTATION            =
==========================================*/


//GET : /api/users/:id : get a single user
app.get('/api/users/:id', function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      console.error('Error occured while looking for id');
    } else {
      return res.send(user);
    }
  });
});

//GET : /apu/users : get all users : used for only testing.
app.get('/api/users', function (req, res){
  User.find(function (err, users){
    if(err){
      console.error("error while getting all users");
    } else {
      return res.send(users);
    }
  })
});

//POST : /api/users : post a single user data from facebook to a server
app.post('/api/users', function (req, res){

  var user = new User({
    displayName: req.body.displayName,
    emailAddress: req.body.emailAddress,
    profileImageURL: req.body.profileImageURL,
    destination: req.body.destination,
    favorites : req.body.favorites,
    contact: req.body.contact,
    miles: req.body.miles,
    isInMiles: req.body.isInMiles
  });

  user.save(function (err){
    if(!err){
      return console.error("user has been created!");
    } else {
      return console.error("error while creating a user", err);
    }
  });

  return res.send(user);
});

//PUT : /api/users/:id : update the user info to the server
app.put('/api/users/:id', function (req, res){

  //get the user here
  User.findById(req.params.id, function(err, user) {
    if (err) {
      console.error('Error occured while looking for id');
    } else {
      //change the user info
      user.destination = req.body.destination;
      user.favorites = req.body.favorites;
      user.contacts = req.body.contacts;
      user.destination = req.body.destination;
      user.favorites = req.body.favorites;
      user.contact = req.body.contact;
      user.miles = req.body.miles;
      user.isInMiles = req.body.isInMiles;
      //save it to the db.
      user.save(function (err){
        if(!err){
          console.log("updated");
        } else {
          console.error("error while updating the user.");
        }
      });

      //send the update user to the client.
      res.send(user);
    }
  });
})
/*=====  End of API IMPLEMENTATION  ======*/



//-----------------------------------------------------//
//-------- fake user creation for DB testing ----------//
//-----------------------------------------------------//

// var user = new User({
//   displayName: "Ailce Green",
//   emailAddress: "agreen@google.com",
//   profileImageURL: "http://myurl",
//   destination: "Streetcar Depot",
//   favorites : ["des1", "dest2"],
//   contacts: {
//     name: 'mom',
//     phoneNumber : '347-123-3456',
//     message: "almost there."
//   }
// });

// var user = new User({
//   displayName: "Ailce Green1",
//   emailAddress: "agreen@google.com1",
//   profileImageURL: "http://myurl1",
//   destination: "Streetcar Depot1",
//   favorites : ["des11", "dest21"],
//   contacts: {
//     name: 'mom',
//     phoneNumber : '347-123-3456',
//     message: "almost there."
//   }
// });


// user.save(function (err){
//   if(!err){
//     return console.error("user has been created!");
//   } else {
//     return console.error("error while creating a user", err);
//   }
// })





