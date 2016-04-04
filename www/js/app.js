// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('med', ['ionic','ngCordova', 'med.controllers', 'med.services', 'ngResource'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      if(window.cordova){
          db = $cordovaSQLite.openDB("med.db");
      }else{
          db = window.openDatabase("med.db", "1.0", "Med", -1);
      }

      $cordovaSQLite.execute(db, "DROP TABLE med");
      $cordovaSQLite.execute(db, "DROP TABLE hours");
      $cordovaSQLite.execute(db, "DROP TABLE tomas");
      //$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS users (id integer primary key, name text)");
      //$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS users (id integer primary key, name text, days text)");
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS med (id integer primary key, name text, days text, date_ini datetime, date_end datetime, alarm INTEGER DEFAULT 0)");
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS hours (id integer primary key, med_id integer, hour text)");
      $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS tomas (id integer primary key, med_id integer, med_name text, date date, tomada INTEGER DEFAULT 0)");

  });
})


.config(function($stateProvider, $urlRouterProvider, $httpProvider){

  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common["X-Request-Width"];
  $httpProvider.defaults.headers.post["Content-type"] = "application/x-www-form-urlencoded charset=UTF-8";


  $stateProvider
    .state("users",{
      url: "/users",
      templateUrl: "templates/users.html",
      controller: "usersCtrl",
      cache: false
    })
    .state("selectMed",{
      url: "/selectMed",
      templateUrl: "templates/selectMed.html",
      controller: "usersCtrl"
    })
    .state("addUsers",{
      url: "/users/add:catId",
      templateUrl: "templates/add.html",
      controller: "usersCtrl"
    })
    .state("editUsers",{
      url: "/users/:userId",
      templateUrl: "templates/edit.html",
      controller: "usersCtrl"
    })
    .state("tomas",{
      url: "/tomas",
      templateUrl: "templates/tomas.html",
      controller: "tomasCtrl",
      cache: false
    })
    .state("toma",{
      url: "/toma/:tomaId",
      templateUrl: "templates/toma.html",
      controller: "tomasCtrl"
    })



    $urlRouterProvider.otherwise("/users");






})
