'use strict';

angular.module('busitbaby.services', [])

.factory("Auth", function($firebaseAuth) {
  //Shan >> changed line below, passing the url for my deployment of firebase into Firebase constructor
  var usersRef = new Firebase('https://hrrb-oxygen.firebaseio.com');
  return $firebaseAuth(usersRef);
})


.factory('UserService', function($rootScope, Auth, $http, $q){

  var geocoder = new google.maps.Geocoder();

  var user = {
    userId: '',
    displayName: '',
    emailAddress: '',
    profileImageURL: '',
    destination: '',
    destgeocode: '',
    previousLocation: [],
    contact: {},
    miles: 1,
    isInMiles: false

  };

  /* methods */
  var getUser = getUser;
  var setUser = setUser;
  var addPreviousLocation = addPreviousLocation;
  var getLatLong = getLatLong;
  var addContact = addContact;
  var updateUserinDB = updateUserinDB;

  return {
    getUser: getUser,
    setUser: setUser,
    addPreviousLocation: addPreviousLocation,
    addContact: addContact,
    postUserinDB: postUserinDB
  };

  
  /*=============================================
  =            METHOD IMPLEMENTATION            =
  =============================================*/
  
  function getUser() {
    // console.log("returning user info")
    return user;
  };

  function setUser(key, value) {
    user[key] = value;
    console.log("user has been updated", user);
  };

  function addPreviousLocation(title, destination){
    console.log("a new location has been added", title + '-' + destination);
    user.destination = destination;
    user.previousLocation.push({
      'title': title,
      'destination' : destination
    });
    console.log("user info has been updated", user);
    getLatLong(user.destination);
  };

  function getLatLong(destination){
    //geolocation algorithm
    //request to google geolocation URL
    //return lat & long
    geocoder.geocode( { 'address': destination}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        // user.destgeocode = {
        //   coords: results[0].geometry.location
        // };
        user.destgeocode = results[0].geometry.location;
        
        console.log(user.destgeocode);
        console.log("here are the lat and long:" + results[0].geometry.location);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    //console.log(destination);
  };

  function addContact(contact){
    user.contact = {
      'name': contact.name,
      'number': contact.number,
      'message': contact.message
    };

    console.log("a new contact has been added", user);
  };

  function postUserinDB(){ 
    var defer = $q.defer();
    $http({
        method: 'POST',
        url: '/api/users',
        cache: 'true',
        data: user
      }).success(function (user){
        console.log('user has been updated on DB', user);
        defer.resolve(user);
      });

    return defer.promise;
  };

})

.factory('fireMap', ['$firebaseObject', '$rootScope', 'UserService', function($firebaseObject, $rootScope, UserService){
  
  var myPos = {}  

  var obj = {
    map: null,
    marker: null,
    personMarker: null,
    data: null,
    coords: null,
    init: function(){
      this.populateMap();
      // this.renderBus();
      // this.setOptions();
    },

    getCurrentPos: function(){
      console.log('returning myPos', myPos);
      return myPos;
    },

    populateMap: function(scope){

      var myLatlng;

      //HTML5 geolocation method. : this will get lat,lng of the current location.
      navigator.geolocation.watchPosition(function(position) {
        
        //populating map using google API.
        myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);  

        var mapOptions = {
          zoom: 12,
          center: myLatlng,
          mapTypeId:google.maps.MapTypeId.ROADMAP,
          mapTypeControl:false,
          navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
        };

        this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(this.map);

        /* generaing multiple Markers */
        var currentPos = ['currentPos',position.coords.latitude,position.coords.longitude];
        var destinationPos = ['destinationPos',UserService.getUser().destgeocode.lat(),UserService.getUser().destgeocode.lng()];
        var markers = [currentPos, destinationPos];
        console.log(UserService.getUser().destgeocode.lat());

        // Loop through our array of markers & place each one on the map  
        for(var i = 0; i < markers.length; i++ ) {
            if(i === 0){ //currentPos - dragble, custom icon
              var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
              // bounds.extend(position);
              this.marker = new google.maps.Marker({
                  position: position,
                  map: map,
                  title: markers[i][0],
                  draggable: true,
                  icon: '../img/png/shopper1.png'
              });
              var personMarker = this.marker;
              this.marker.addListener('drag', function() {
                // console.log('lat:'+personMarker.getPosition().lat()+' lng:'+personMarker.getPosition().lng());
                currentPos.lat = personMarker.getPosition().lat();
                currentPos.lng = personMarker.getPosition().lng();
                
                myPos = [personMarker.getPosition().lat(), personMarker.getPosition().lng()];
                
                // console.log('scope.currentPos',scope.currentPos);
                //applying Async for the google data and setting it in the rootScope
                $rootScope.$applyAsync(function(){
                  $rootScope.myPos  = {
                    'latitude': personMarker.getPosition().lat(),
                    'longitude': personMarker.getPosition().lng()
                  }
                  //fire an event when ever it is dragged;
                  $rootScope.$broadcast('evtUpdateMyPos');
                });
                
              });
            } else { //destination - non-dragable
              var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
              // bounds.extend(position);
              this.marker = new google.maps.Marker({
                  position: position,
                  map: map,
                  title: markers[i][0],
              });
              var desMarker = this.marker;
              $rootScope.$applyAsync(function(){
                $rootScope.desPos  = {
                  'latitude': desMarker.getPosition().lat(),
                  'longitude': desMarker.getPosition().lng()
                }
                //fire an event when ever it is dragged;
                $rootScope.$broadcast('evtUpdateDesPos');
              });
            }
            
        }

      });
      
    },


    /*=============================================================
    =            LEGACY CODE BELOW THAT ARE NOT IN USE            =
    =============================================================*/

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
          icon: '../img/png/bus21.png',
          draggable: true
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
        // position: {lat:29.951066, lng: -90.071532},
        position: {lat:37.5356009, lng: 127.0809173},
        map: this.map,
        icon: '../img/png/shopper1.png',
        draggable: true
      });
      personMarker.addListener('drag', function() {
        that.coords = personMarker.getPosition();
        // scope.getLoc(that.coords);
      });
    },
  }

  return obj;
}]);

