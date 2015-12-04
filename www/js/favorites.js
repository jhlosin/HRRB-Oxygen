/*========================================
=            LEGACY BASE CODE(NOT IN USE)            =
========================================*/

// TODO: Replace url with actual database url
var db = new Firebase('FILL_IN_URL_TO_DATABASE');
var routes = db.child('routes');

// TODO: Verify this method is functioning as expected
// Start and end arguments should be objects with .long and .lat properties
var saveRoute = function(user, routeName, start, end) {
  routes.child(user).push({
    'start': start,
    'name': routeName,
    'end': end
  });
};

// TODO: Debug?
var getRoutes = function(user) {
  var routes = [];
  routes.child(user).on('value', function(route) {
    routes.push(route);
  });
  return routes;
};

// TODO: Debug?
var getSpecificRoute = function(user, routeName) {
  var result;
  routes.child(user).orderByChild('name').equalTo(routeName).on('value', function(route) {
    result = route.val();
  });
  return result;
};