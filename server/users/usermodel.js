var mongoose = require('mongoose');


//from facebook
//displayName, emailAddress, profileImageURL

//additionally
//destination(str), favorite(array or obj), contacts(obj)

var UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: false,
    unique: false
  },
  profileImageURL: {
    type: String,
    required: false,
    unique: false
  },
  destination: {
    type: String,
    required: false
  },
  
  miles: {
    type: Number,
    required: false
  },

  isInMiles: {
    type: Boolean,
    required: false
  },

  favorites : [mongoose.Schema.Types.Mixed],

  contact: mongoose.Schema.Types.Mixed

});

module.exports = mongoose.model('users', UserSchema);