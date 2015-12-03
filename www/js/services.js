angular.module('busitbaby.services', [])

.factory("Auth", function($firebaseAuth) {
  //Shan >> changed line below, passing the url for my deployment of firebase into Firebase constructor
  var usersRef = new Firebase('https://hrrb-oxygen.firebaseio.com');
  return $firebaseAuth(usersRef);
})

.factory('UserService', function($rootScope, Auth){

  var user = {
    displayName: '',
    emailAddress: '',
    profileImageURL: '',
    destination: '',
    previousLocation: [],
    contacts: []

  };

  var getUser = function() {
    console.log("returning user info")
    return user;
  };

  var setUser = function(key, value) {
    user[key] = value;
    console.log("user has been updated", user);
  };

  var addPreviousLocation = function(title, destination){
    console.log("a new location has been added", title + '-' + destination);
    user.destination = destination;
    user.previousLocation.push({
      'title': title,
      'destination' : destination
    });
    console.log("user info has been updated", user);
  };

  var addContact = function(contact){
    user.contacts.push({
      'name': contact.name,
      'number': contact.number,
      'message': contact.message
    });
    console.log("a new contact has been added", user);
  };

  return {
    getUser: getUser,
    setUser: setUser,
    addPreviousLocation: addPreviousLocation,
    addContact: addContact
  };
})

.factory('fireMap', ['$firebaseObject', function($firebaseObject){
  var obj = {
    map: null,
    marker: null,
    personMarker: null,
    data: null,
    coords: null,
    init: function(){
      this.populateMap();
      this.renderBus();
      this.setOptions();
    },

    populateMap: function(){
      //map of Bronx,NY
      navigator.geolocation.watchPosition(function(position) {
        var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        //var homeLatlng = new google.maps.LatLng(29.936253, -90.084396);
        var mapOptions = {
          zoom: 14,
          center: myLatlng,
        };
      
        this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(this.map);

        var marker = new google.maps.Marker({
          position:myLatlng,
          map: this.map,
          title: "You are here!"
        })

        // var homeMarker = new google.maps.Marker({
        //   position:myLatlng,
        //   map: this.map,
        //   title: "You are here!"
        // })
      })
    },

    renderBus: function(){
      //save context
      var that = this;
      var ref = new Firebase('https://publicdata-transit.firebaseio.com/bronx');
      //get data for one bus
      var bus = ref.child('vehicles').child('300');
      //get initial location
      bus.once('value', function(snap){
        var it = snap.val();
        console.log(it)
        var latlng = new google.maps.LatLng(it.lat,it.lon);
        that.marker = new google.maps.Marker({
          position: latlng,
          map: that.map,
          icon: '../img/png/bus21.png'
        })
      });
      //update location on change to bus
      bus.on('value', function(snap){
        if(this.marker){
          this.marker.setPosition(new google.maps.LatLng(snap.val().lat,snap.val().lon));
        }
      })

    },

    setOptions: function(){
      //save context
      var that = this;
      //empty list of options on each call
      $('.stop').empty();
      if($('.direction').val() === 'Going to Wash. Heights'){
        $.getJSON('../json/stop1.json', function(data){
          that.data = data;
          data.stops.forEach(function(stop){
            //add list of options for wash heights direction
            $('.stop').append('<option>' + stop.name + '</option>')
          })
        })
      } else if($('.direction').val() === 'Going to W. Farms Rd'){
        $.getJSON('../json/stop2.json', function(data){
          that.data = data;
          data.stops.forEach(function(stop){
            $('.stop').append('<option>' + stop.name + '</option>')
          })
        })
      }
    },

    addDraggableMarker: function(scope){
      var that = this;
      // var image = ''; // Use your own image
      personMarker = new google.maps.Marker({
        position: {lat: 40.849462, lng: -73.882599 },
        map: this.map,
        icon: '../img/png/shopper1.png',
        draggable: true
      });
      personMarker.addListener('drag', function() {
        that.coords = personMarker.getPosition();
        scope.getLoc(that.coords);
      });
    },


  }
    return obj;
  }])


// .factory('Sounds', function($q) {

// 	var deleteSound = function(x) {
// 		console.log("calling deleteSound");
// 		var deferred = $q.defer();
// 		getSounds().then(function(sounds) {
// 			sounds.splice(x,1);
// 			localStorage.busitbaby = JSON.stringify(sounds);
// 			deferred.resolve();
// 		});

// 		return deferred.promise;

// 	}

// 	var getSounds = function() {
// 		var deferred = $q.defer();
// 		var sounds = [];

// 		if(localStorage.busitbaby) {
// 			sounds = JSON.parse(localStorage.busitbaby);
// 		}
// 		deferred.resolve(sounds);

// 		return deferred.promise;
// 	}

// 	var playSound = function(x) {
// 		getSounds().then(function(sounds) {
// 			var sound = sounds[x];


// 			var mediaUrl = sound.file;
// 			if(device.platform.indexOf("iOS") >= 0) {
// 				mediaUrl = "../Library/NoCloud/FILE" + mediaUrl.split("/").pop();
// 			}
// 			var media = new Media(mediaUrl, function(e) {
// 				media.release();
// 			}, function(err) {
// 				console.log("media err", err);
// 			});
// 			media.play();
// 		});
// 	}

// 	var saveSound = function(s) {
// 		console.log("calling saveSound");
// 		var deferred = $q.defer();
// 		getSounds().then(function(sounds) {
// 			sounds.push(s);
// 			localStorage.busitbaby = JSON.stringify(sounds);
// 			deferred.resolve();
// 		});

// 		return deferred.promise;
// 	}

// 	return {
// 		get:getSounds,
// 		save:saveSound,
// 		delete:deleteSound,
// 		play:playSound
// 	};
