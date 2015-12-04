'use strict';

angular.module('busitbaby.controllers', [])

.controller('mapCtrl', function($scope, UserService){
	console.log("you are in mapCtrl");
  $scope.user = UserService.getUser();

})
.controller('LogoutCtrl', function($scope, Auth, $location, $timeout){

  $scope.logout = logout;

  function logout() {
    Auth.$unauth();  
    $location.path('main');
  };
  
})
.controller('WhereCtrl', function($scope, UserService){
  
  $scope.user = UserService.getUser();
  console.log($scope.destination);
  $scope.addPreviousLocation = addPreviousLocation;

  
  function addPreviousLocation(title, destination){
    UserService.addPreviousLocation(title, destination);
    $scope.title = '';
    $scope.destination = '';
  };
  
})
.controller('WhenCtrl', function($scope, UserService){
  $scope.setMiles = setMiles;

  function setMiles(miles){
    miles = miles || 1;
    UserService.setUser('miles', miles);
  };
  
  
})
.controller('WhotoMessageCtrl', function($scope, UserService){
  console.log("whotomessage page");

  $scope.saveContactInfo = saveContactInfo;
  $scope.contact = {};
  
  function saveContactInfo() {
    UserService.addContact($scope.contact);
    UserService.postUserinDB().then(function (user){
      console.log('user has been updated:client side', user);

    });
    $scope.contact = {};
  };
  

})

.controller('AboutCtrl', function($scope){
  console.log("about page!! our information goes here");

  $scope.people = [
  {name: 'Alice Green', title: 'Product Owner', image: '/img/alice.jpeg', bio: 'I like robots.'},
  {name: 'Shan Batla', title: 'Scrum Master', image: '/img/shan.jpeg', bio: 'I like git work flow.'},
  {name: 'Sam Bowler', title: 'Developer', image: '/img/sam.jpeg', bio: 'I like hats with maple leaves.'},
  {name: 'Peter Park', title: 'Developer', image: '/img/peter.jpeg', bio: 'I like touching old statues.'}
  ];

})

.controller('AlarmCtrl', function($scope) {
  console.log("Check out your alarm lists!");
   $scope.alarmList = [
    { id: 1, title: "September Remix", artist: "Kirk Franklin", url: '/music/september.mp3' },
    { id: 2, title: "Vibrate", artist: "", url: "" }
  ];
})

.controller('loginCtrl', function($scope, Auth, $location, UserService) {

  $scope.login = function(authMethod) {
    //Shan >> changed line below to use authWithOAuthPopup
    Auth.$authWithOAuthPopup(authMethod).then(function(authData) {

      //save user info
      console.log(authData);
      UserService.setUser('displayName', authData.facebook.displayName);
      UserService.setUser('profileImageURL', authData.facebook.profileImageURL);
      UserService.setUser('userId', authData.uid);
      
      //save user info to db ---------------------TODO
      
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
        });
      } else {
        console.log(error);
      }
    });
  };

  $scope.guest = function() {
    UserService.setUser('displayName', 'Guest');
    UserService.setUser('userId', 'guest');
  };

  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log('Not logged in yet');
    } else {
      console.log('Logged in as', authData.uid);
      $location.path('/where');
    }
    // This will display the user's name in our view
    $scope.authData = authData;
  });
})
.controller('MapController', 
  function($scope, UserService, fireMap, isWithinRadius, $location, $rootScope){

  $scope.user = UserService.getUser();
  console.log(UserService.destgeocode);
  $scope.currentPos = [];
  $scope.data = {
    sel: 'Going to W. Farms Rd',
    stop: '',
    miles: 'Miles'
  };
  
  //Listen on a broadcast events
  $scope.$on('evtUpdateMyPos', function (){
    // console.log('evtUpdateMyPos is fired.', $rootScope.myPos);
    $scope.currentPos = $rootScope.myPos
  });

  $scope.$on('evtUpdateDesPos', function(){
    // console.log('evtUpdateDesPos is fired');
    $scope.desPos = $rootScope.desPos;
  });

  $scope.checkContact = checkContact;
  $scope.init = init;
  $scope.options = options;
  $scope.getLoc = getLoc;

  var watchRadius = setInterval(function(){
    $scope.getLoc(function(inRadius){
      if(inRadius){
        clearInterval(watchRadius);
      }
    });
  }, 1000);
      

  /*======================================
  =            METHOD IMPLEMENTATION            =
  ======================================*/

  function checkContact(){
    if(UserService.getUser().contact.number){
      return true;
    } else {
      return false;
    }
  };

  function init(){
    // fireMap.init();
    fireMap.populateMap($scope)
		// fireMap.addDraggableMarker($scope);
  };

  function options(){
    fireMap.setOptions();
  };

  function getLoc(cb){
    //call location function
    isWithinRadius($scope.user.miles, $scope.desPos, $scope.currentPos, function(bool){
      var audio = new Audio('../music/September.mp3');
      if(bool){
        $location.path('/page4');
        
        //change isInMales pro to true;
        UserService.setUser('isInMiles', true);
        console.log('setting inInMiles to True', UserService.getUser());
        if(UserService.getUser().isInMiles){
          //update the DB.
          UserService.postUserinDB().then(function(user){
            console.log('user has been updated.',user);
          });
        }
        audio.play();
        cb(true);
      }
    })  
  }

})


.controller('MainCtrl', function($scope){
  console.log("this is the first page!");

})
.controller('EndCtrl', function($scope){
  console.log("final page");
})
.controller('SigninCtrl', function($scope){
  console.log("sign in page");
})
.controller('SignupCtrl', function($scope){
  console.log("sign up page");
});





/*=====================================================
=            LEGACY BASE CODE - NOT IN USE            =
=====================================================*/

// <--------------- EXTRA FEATURES WE DIDN'T IMPLEMENT FOR GREENFIELD ------->
// AlarmCtrl
// var getSounds = function() {
//     console.log('getSounds called');
//     Sounds.get().then(function(sounds) {
//       console.dir(sounds);
//       $scope.sounds = sounds;
//     });
//   }

//   $scope.$on('$ionicView.enter', function(){
//     console.log('enter');
//     getSounds();
//   });

//   $scope.play = function(x) {
//     console.log('play', x);
//     Sounds.play(x);
//   }

//   $scope.delete = function(x) {
//     console.log('delete', x);
//     Sounds.get().then(function(sounds) {
//       var toDie = sounds[x];
//       window.resolveLocalFileSystemURL(toDie.file, function(fe) {
//         fe.remove(function() {
//           Sounds.delete(x).then(function() {
//             getSounds();
//           });
//         }, function(err) {
//           console.log("err cleaning up file", err);
//         });
//       });
//     });
//   }

//   $scope.cordova = {loaded:false};
//   $ionicPlatform.ready(function() {
//     $scope.$apply(function() {
//       $scope.cordova.loaded = true;
//     });
//   });

// <---------------- RECORD CONTROLLER ------------------------------->
// .controller('RecordCtrl', function($scope, Sounds, $state, $ionicHistory) {
//   console.log(window.navigator);
//   console.log(navigator);
//   console.log(window.navigator.device)
//   console.log("i am inside Record Controller");

//   $scope.sound = {name:""};

//   $scope.saveSound = function() {
//     console.log('trying to save '+$scope.sound.name);

//     //error checking
//     if($scope.sound.name === "") {
//       navigator.notification.alert("Name this sound first.", null, "Error");
//       return;
//     }

//     if(!$scope.sound.file) {
//       navigator.notification.alert("Record a sound first.", null, "Error");
//       return;
//     }


//     var loc = cordova.file.dataDirectory;

//     var extension = $scope.sound.file.split(".").pop();
//     var filepart = Date.now();
//     var filename = filepart + "." + extension;
//     console.log("new filename is "+filename);

//     window.resolveLocalFileSystemURL(loc, function(d) {
//       window.resolveLocalFileSystemURL($scope.sound.file, function(fe) {
//         fe.copyTo(d, filename, function(e) {
//           console.log('success in copy');
//           console.dir(e);
//           $scope.sound.file = e.nativeURL;
//           $scope.sound.path = e.fullPath;

//           Sounds.save($scope.sound).then(function() {
//             $ionicHistory.nextViewOptions({
//                 disableBack: true
//             });
//             $state.go("home");
//           });

//         }, function(e) {
//           console.log('error in copy');console.dir(e);
//         });
//       }, function(e) {
//         console.log("error");
//         console.dir(e);
//       });


//     }, function(e) {
//       console.log('error in fs');console.dir(e);
//     });


//   }

//   var captureError = function(e) {
//     console.log('captureError', e);
//   }

//   var captureSuccess = function(e) {
//     console.log('captureSuccess');console.dir(e);
//     $scope.sound.file = e[0].localURL;
//     $scope.sound.filePath = e[0].fullPath;
//   }

//   $scope.record = function() {
//     navigator.device.capture.captureAudio(
//         captureSuccess,captureError,{duration:10});
//   }

//   $scope.play = function() {
//     if(!$scope.sound.file) {
//       navigator.notification.alert("Record a sound first.", null, "Error");
//       return;
//     }
//     var media = new Media($scope.sound.file, function(e) {
//       media.release();
//     }, function(err) {
//       console.log("media err", err);
//     });
//     media.play();
//   }
