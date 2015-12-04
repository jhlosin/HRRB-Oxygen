angular.module('trackingModule', [])

  .factory('distance', function() {
    return function(lat1, lon1, lat2, lon2){
      var myPos = new google.maps.LatLng(lat1, lon1);
      var yoPos = new google.maps.LatLng(lat2, lon2);
      var a = google.maps.geometry
                 .spherical
                 .computeDistanceBetween(myPos,yoPos) * 0.00062
      // console.log('dist: ', a)
      return a;
    }
  })
  .factory('isWithinRadius', ['distance', function(distance) {
    console.log("now in the isWithinRadius");
    var usingGeolocation = false;
    return function(alertRadius, endCoords, startCoords, next) {
      // console.log('endCor', endCoords);
      // console.log('startCoords', startCoords);
      var callback = function(startCoords) {
        if( usingGeolocation ){
          startCoords = startCoords.coords;
        }
        var usersDistanceFromDestination = distance(
          startCoords.latitude, startCoords.longitude,
          endCoords.latitude, endCoords.longitude);

        if( usersDistanceFromDestination <= alertRadius ){
          next(true);
        }
        else {
          next(false);
        }
      };
      if( startCoords ){
        callback(startCoords);
      }
      else {
        // If no start coordinates given, grab the user's current location
        usingGeolocation = true;
        navigator.geolocation.getCurrentPosition(callback);
      }
    }
  }]);
