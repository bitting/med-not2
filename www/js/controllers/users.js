var app = angular.module('med.controllers', ['med.services', 'ionic', 'ngCordova', 'ngResource', 'ngMessages'])



.controller("usersCtrl", function($scope, Users, Hours, Tomas, $state, $stateParams, $window, $ionicPopup, $ionicModal, $http, $filter, $cordovaLocalNotification){


  /* MODAL DíaAS*/
  $ionicModal.fromTemplateUrl('templates/days.html',{
      scope:$scope
  })
  .then(function(modal){
      $scope.modalDays = modal;
  })

  $scope.openDaysForm = function(user){

      $scope.user = user;

      if (angular.isDefined( $scope.user ) && angular.isDefined($scope.user.days )) {
        var days = $scope.user.days;
        $scope.days =
             { "l": days.indexOf("L") > -1,
               "m": days.indexOf("M") > -1,
               "x": days.indexOf("X") > -1,
               "j": days.indexOf("J") > -1,
               "v": days.indexOf("V") > -1,
               "s": days.indexOf("S") > -1,
               "d": days.indexOf("D") > -1
             };
      }

      $scope.modalDays.show();
  }

  $scope.closeDaysForm = function(){
      $scope.modalDays.hide();
  }


  /* MODAL LISTA HORAS*/

  $ionicModal.fromTemplateUrl('templates/hours.html',{
      scope:$scope
  })
  .then(function(modal){
      $scope.modalHours = modal;
  })

  $scope.openHoursForm = function(hours){

      if(hours == null){
          hours = [];
      }
      $scope.user.hours = hours;

      if (angular.isDefined($scope.user) && angular.isDefined($scope.user.hours)) {
      //  var days = $scope.user.hours;
        /*$scope.days =
             { "l": days.indexOf("L") > -1,
               "m": days.indexOf("M") > -1,
               "x": days.indexOf("X") > -1,
               "j": days.indexOf("J") > -1,
               "v": days.indexOf("V") > -1,
               "s": days.indexOf("S") > -1,
               "d": days.indexOf("D") > -1
             };*/
      }

      $scope.modalHours.show();
  }

  $scope.closeHoursForm = function(){
      $scope.modalHours.hide();
  }

  /*****/


  $scope.openLink = function() {
         window.open("http://www.google.com/", "_system", "location=yes");
  }


  $scope.initUsers = function(){

    Users.all().then(function(users){
      $scope.users = users;
      console.log(users);

/*
       for(var u = 0; u < users.length; u++){

            var usrId = users[u].id;
             console.log(JSON.stringify(users[usrId]));

             Hours.getByMed(usrId).then(function(res, $timeout){
                console.log("uir id "+usrId);
                var hours = [];
                for(var i = 0; i < res.length; i++){
                  hours.push(res[i].hour);
                  //console.log(JSON.stringify(hours));

                  console.log("user -> "+ $scope.users[1].name);
                  //usr.hours.push(res[i].hour);
                }

             });

       }
*/
    })



    $scope.remove = function(userId){

      $ionicPopup.confirm({
            title: "Eliminar",
            template: "¿Esta seguro que quiere eliminar este medicamento?",
            scope: $scope,
            buttons: [
              {
                text: "Aceptar",
                type: "button-positive",
                onTap: function(e){

                      Users.remove(userId).then(
                        function(res){
                          $window.location.reload();
                        },
                        function(error){
                          console.log(error);
                        }
                      )
                }
              },
              {
                text: "Cancelar"
              }
            ]
        })

    }

  }



  $scope.initSelectMed = function(){

    var cat = [
          {
           "id" : 1,
           "name" : "cat 1"
          },{
           "id" : 2,
           "name" : "cat 2"
          }
    ];

    $scope.categories = cat;
  };



  $scope.initAddUsers = function(){

     var catId = $stateParams.catId;

      //Cargar datos predefinidos del medicamento segun el Id recibido


      if(!angular.isDefined($scope.user)){
         var user = {
            //name : "",
            name: catId,
            days : "",
            //daycodes : "",
            hours : ["09:08","10:08","11:08"]
          }

        $scope.user = user;
      }



   // Guardado con formulario
    $scope.saveMed = function(form, user){



       if(form.$valid) {

         var alarm = true;

               if(!angular.isDefined(user) || user.name ==""){
                      alert("No se ha especificado el nombre");
               }else if (user.date_ini.getTime() > user.date_end.getTime()) {
                      alert("La fecha de inicio no puede ser posterior a la fecha de fin");
               }else{

                    if(!angular.isDefined(user.days)){
                         user.days="";
                       }

                       if(!angular.isDefined(user.hours)){
                         user.hours=[];
                       }


                       console.log("save "+ JSON.stringify(user));
                       for(var i=0; i < user.hours.length; i++){
                          console.log("Hora-> "+user.hours[i]);
                       }

                       //alert(JSON.stringify(user));




                        Users.add(user).then(
                            function(res){

                            //alert("lastId "+res.insertId);
                             $scope.medId = res.insertId;

                              for(var i=0; i < user.hours.length; i++){
                                 var hora = user.hours[i];
                                  console.log("Va a guarda hora-> "+hora);
                                  Hours.add(res.insertId, hora).then(
                                      function(res){
                                        console.log("guardo hora ok ");
                                          //$state.go("users");
                                      },
                                      function(error){
                                          console.log(error);
                                      }
                                  );
                              }

                              $state.go("users");

                            },
                            function(error){
                                console.log(error);
                            }
                        );


                       var day = new Date(user.date_ini.getTime());
                       var dayEnd = user.date_end;

                      //si hay alarma
                       $scope.prepareNotifications();  /*******/

                       var selectedDays = $filter('arrayNameDays')(user.days);

                       while (day.getTime() <= dayEnd.getTime()){
                          console.log("Día - " + day);


                          var nameDay =  $filter('date')(day,"EEE");
                          console.log("Día - " + nameDay );

                          if (selectedDays.indexOf(nameDay) > -1){
                              console.log("Es uno de los dias seleccionados "+ nameDay);

                              for(var i=0; i < user.hours.length; i++){
                                  var hora = user.hours[i];
                                  var dateTomaString = $filter('date')(day,"yyyy-MM-dd")+"T"+ hora+":00";
                                  dateToma = new Date(dateTomaString);
                                  /*este new date ca un invalid date en ios*/
                                  console.log("Guardado toma "+ dateToma);

                                  alert("toma: "+dateToma);

                                  Tomas.add(user.id, user.name, dateToma, 0).then(
                                    function(res){
                                       console.log("guardo toma ok ->"+$scope.medId+" "+user.name+" "+dateToma);


                                    //  if (alarm == true){

                                             $scope.createNotification(res.insertId); /**************/

                                   //   }


                                    },
                                    function(error){
                                        console.log(error);
                                    }
                                  );

                              }

                          }

                          day.setDate(day.getDate() + 1);

                       }

                       /*
                       console.log("date end"+ user.date_ini);
                       console.log("date end"+ user.date_end);
                       console.log("horas "+ user.hours);
                       */

                       //var testdate = $filter('date')(user.date_ini,"yyyy-MM-dd") + "T22:00:00";
                       // '2002-04-26T09:00:00';







                  }
            }

    }

  /*
    $scope.save = function(user){


         if(!angular.isDefined(user) || user.name==""){
                alert("No se ha especificado el nombre");
           }else{

              if(!angular.isDefined(user.days)){
                   user.days="";
                 }

                 if(!angular.isDefined(user.hours)){
                   user.hours=[];
                 }


                 console.log("save "+ JSON.stringify(user));
                 for(var i=0; i < user.hours.length; i++){
                    console.log("Hora-> "+user.hours[i]);
                 }

                 //alert(JSON.stringify(user));

                  Users.add(user).then(
                      function(res){

                      //alert("lastId "+res.insertId);

                        for(var i=0; i < user.hours.length; i++){
                           var hora = user.hours[i];
                            console.log("Va a guarda hora-> "+hora);
                            Hours.add(res.insertId, hora).then(
                                function(res){
                                  console.log("guardo hora ok ");
                                    //$state.go("users");
                                },
                                function(error){
                                    console.log(error);
                                }
                            );
                        }

                        $state.go("users");
                      },
                      function(error){
                          console.log(error);
                      }
                  );


                var day = new Date(user.date_ini.getTime());
                var dayEnd = user.date_end;


                while (day.getTime() <= dayEnd.getTime()){
                   console.log("Día - " + day);
                   day.setDate(day.getDate() + 1);

                }

                console.log("date end"+ user.date_ini);
                console.log("date end"+ user.date_end);



                }
          }

          */

    }



      $scope.initEditUsers = function(){

           var id = $stateParams.userId;
           Users.get(id).then(function(user){


          // alert('dia '+ $filter('date')(user.date_ini, 'YYYY/MM/DD');


            //$scope.datetestformat = $filter('date')(x,"dd/MM/yyyy");

            user.date_ini = new Date(user.date_ini);
            user.date_end = new Date(user.date_end);
            $scope.user = user;


            //Recupera las horas guardadas y las añade al objeto
             Hours.getByMed(user.id).then(function(res){
                 var hours = [];
                 for(var i = 0; i < res.length; i++){
                   hours.push(res[i].hour);
                 }
                 $scope.user.hours = hours;

                 console.log("hours-> "+JSON.stringify($scope.user));

            });


          });


          $scope.update = function(user){

            Users.update(user).then(
              function(res){
                /*
                console.log("Guarda hora-> "+user.name);
                Hours.add(user.id, user.hour).then(
                    function(res){
                        $state.go("users");
                    },
                    function(error){
                        console.log(error);
                    }
                );
                */
                $state.go("users");
              },
              function(error){
                consoloe.log(error);
              }
            )
          }





      }


      $scope.initDays = function(){

          $scope.setDays = function(days){

             var selectedDays = "";
             if(days){
               if(days.l) selectedDays = selectedDays+"L";
               if(days.m) selectedDays = selectedDays+"M";
               if(days.x) selectedDays = selectedDays+"X";
               if(days.j) selectedDays = selectedDays+"J";
               if(days.v) selectedDays = selectedDays+"V";
               if(days.s) selectedDays = selectedDays+"S";
               if(days.d) selectedDays = selectedDays+"D";
             }

            $scope.user.daycodes = selectedDays;
            $scope.user.days = selectedDays.split("") ;
            $scope.closeDaysForm();
          }

      }


      $scope.initHours = function(){

          $scope.addHour = function(){

             /*
              var hours = [];
              hours = $scope.user.hours;
              var dd = hours.concat(["fdfd"]);
              */
              var hours = [];
              var dd = hours.concat($scope.user.hours);
              dd.push("15:50");

            //  alert($scope.user.hours);

              $scope.user.hours = dd;

            //  alert($scope.user.hours);

          }

      }




      /**** Test Local Notifications *****/

      $scope.getNotifications = function(){

        cordova.plugins.notification.local.getScheduled(function (notifications) {
            alert(JSON.stringify(notifications));
        });

      }

      $scope.cancelNotifications = function(){

        var tomas = new Array();
        for (var i = 1; i < 50; i++) {
            tomas.push(i);
        }

        cordova.plugins.notification.local.cancel(tomas, function () {
              // Notifications were cancelled
        }, $scope);
      }

      $scope.notification = function(){

        //Cancela las notificaicones ocn id 1 y 2
        //cordova.plugins.notification.local.cancel([10, 11]).then(function (result) {
          // ...
        //});

        alert("Notification: ");

           cordova.plugins.notification.local.registerPermission(function (granted) {});


            var check = 'window.cordova NOT available';
            if (cordova.plugins.notification.local) {
                  check = 'window.cordova YES is available';

                  var collectionDate = '2016-03-29T19:52:00';

                  var fecha  =new Date(collectionDate);
                  //var fecha  =new Date();

                  alert("fecha "+fecha);
/*
                  cordova.plugins.notification.local.schedule({
                    id: 11,
                    title: "Aviso de toma",
                    text: "Medicamento XX",
                    at: fecha,
                    data: {tomaId: "121221"},
                    autoClear:  true
                    //every: "thursday",
                    //every: 5,
                    //sound: sound
                  });
*/

                  for(var i=1; i<5; i++){
                      cordova.plugins.notification.local.schedule({
                        id: i,
                        title: "Aviso de toma",
                        text: "Medicamento "+i,
                        at: fecha,
                        data: {tomaId: i},
                        autoClear:  true
                        //every: "thursday",
                        //every: 5,
                        //sound: sound
                      });
                  }



                  cordova.plugins.notification.local.on("click", function (notification) {
                         alert("toma -> "+ notification.id);
                         var data = JSON.parse(notification.data);
                         alert("toma -> "+ data['tomaId']);
                         $state.go("tomas");
                  });





                /*
                  var date = document.getElementById('date').value;
                  var time = document.getElementById('time').value;

                  console.log('date ' + date);
                  console.log('time ' + time);

                  if(date == "" || time == ""){
                    alert("Please enter all details");
                    return;
                  }

                  var schedule_time = new Date((date + " " + time).replace(/-/g, "/")).getTime();
                  schedule_time = new Date(schedule_time);

                  var d= new Date();
                  d.setHours(20);
                  d.setMinutes(40);
                  d.setSeconds(0);


                  window.cordova.plugins.notification.local.schedule({
                    id: 1,
                    text: "Single Notification. jueves 20:40",
                    //at: schedule_time
                    at: hoy
                    //every: "thursday",
                    //every: 5,
                    //sound: sound
                  });

                  if(cordova.plugins.notification.local.getScheduledIds){
                     console.log("Hay shedules "+cordova.plugins.notification.local.getScheduledIds.length);
                  }else{
                    console.log('no hay shedules');
                  }



                // An elaborate, custom popup
                var myPopup = $ionicPopup.show({
                  template: '<input type="password" ng-model="data.wifi">',
                  title: 'Check',
                  subTitle: check,
                  scope: $scope,
                  buttons: [
                    { text: 'Cancel' },
                  ]
                });


                // Al clicar en la notificación
                cordova.plugins.notification.local.on("click", function(notification)
                {
                    alert("clicked: " + notification.id);
                });
            */
          }

          alert("Notification: " + check);
      }


      // Crea una toma
      $scope.prepareNotifications = function(){

            cordova.plugins.notification.local.registerPermission(function (granted) {});

            cordova.plugins.notification.local.on("click", function (notification) {
                   //alert("toma -> "+ notification.id);
                   var data = JSON.parse(notification.data);
                   var id = data['tomaId'];
                   $state.go('toma',{tomaId: id});

                  // enviar a pantalla de toma, según el id
            });


      }

      $scope.createNotification = function(tomaId){

          Tomas.get(tomaId).then(function(toma){

            var date = new Date(toma.date);
            var hour = $filter('date')(date,"HH:mm");

            if (cordova.plugins.notification.local) {

                  //cordova.plugins.notification.local.registerPermission(function (granted) {});

                  cordova.plugins.notification.local.schedule({
                    id: tomaId,
                    title: "Aviso de toma",
                    text: toma.med_name+" "+hour,
                    at: date,
                    data: {tomaId: tomaId},
                    //autoClear:  true

                  });

/*
                  cordova.plugins.notification.local.on("click", function (notification) {
                         alert("toma -> "+ notification.id);
                         var data = JSON.parse(notification.data);
                         alert("toma -> "+ data['tomaId']);
                         $state.go("tomas");
                        // enviar a pantalla de toma, según el id
                  });
*/
            }

        })

      }
      /********/









})

.filter('toDia', function($filter) {
  return function(input) {
      var result = $filter('date')(input,"EEE");
      var res = "";
      if(result=="Mon") result = 'Lunes';
      if(result=="Tue") result = 'Martes';
      if(result=="Wed") result = 'Miércoles';
      if(result=="Thu") result = 'Jueves';
      if(result=="Fri") result = 'Viernes';
      if(result=="Sat") result = 'Sabado';
      if(result=="Sun") result = 'Domingo';

      return result;
  };
})


.filter('arrayNameDays', function($filter){
  return function(letersDays) {

      var nameDays = [];
      if(letersDays.indexOf("L") > -1){
         nameDays.push("Mon");
      }
      if(letersDays.indexOf("M") > -1){
         nameDays.push("Tue");
      }
      if(letersDays.indexOf("X") > -1){
         nameDays.push("Wed");
      }
      if(letersDays.indexOf("J") > -1){
         nameDays.push("Thu");
      }
      if(letersDays.indexOf("V") > -1){
         nameDays.push("Fri");
      }
      if(letersDays.indexOf("S") > -1){
         nameDays.push("Sat");
      }
      if(letersDays.indexOf("D") > -1){
         nameDays.push("Sun");
      }

      return nameDays;
  }
})

.filter('toDiaNum', function($filter) {
  return function(input) {
      var date = new Date(input);
      var dia = $filter('date')(date,"EEE");
      var num = $filter('date')(date,"dd");
      var res = "";
      if(dia=="Mon") res = 'Lunes';
      if(dia=="Tue") res = 'Martes';
      if(dia=="Wed") res = 'Miércoles';
      if(dia=="Thu") res = 'Jueves';
      if(dia=="Fri") res = 'Viernes';
      if(dia=="Sat") res = 'Sabado';
      if(dia=="Sun") res = 'Domingo';

      return res+" "+num;
  };
})


.filter('toHour', function($filter) {
  return function(input) {
      var date = new Date(input);
      return $filter('date')(date,"HH:mm");
  };
})


.filter('mesAno', function($filter) {
  return function(input) {
      var date = new Date(input);
      var mes = $filter('date')(date,"MM");
      var ano = $filter('date')(date,"yyyy");
      var res = "";
      if(mes==01) res = 'Enero';
      if(mes==02) res = 'Febrero';
      if(mes==03) res = 'Marzo';
      if(mes==04) res = 'Abril';
      if(mes==05) res = 'Mayo';
      if(mes==06) res = 'Junio';
      if(mes==07) res = 'Julio';
      if(mes==08) res = 'Agosto';
      if(mes==09) res = 'Septiembre';
      if(mes==10) res = 'Octubre';
      if(mes==11) res = 'Noviembre';
      if(mes==12) res = 'Diciembre';

      return res+" "+ano;
  };
})





app.controller("tomasCtrl", function($scope, Tomas, $state, $stateParams, $filter){

  $scope.initTomas = function(){
    Tomas.all().then(function(tomas){
      $scope.tomas = tomas;
      console.log(tomas);
    })
  }

  $scope.initToma = function(){
    var tomaId = $stateParams.tomaId;
    Tomas.get(tomaId).then(function(toma){
      $scope.toma = toma;
    })
  }

  $scope.tomada = function(tomaId){
    Tomas.setTomada(tomaId, 1).then(function(toma){
      $state.go("tomas");
    })
  }


})



.filter('groupByMonthYear', function($parse, $filter) {
    var dividers = {};

    return function(tomas) {

        if (!tomas) return;

        var output = [],
            previousDate,
            currentDate;

        if(tomas.length > 1){



            for (var i = 1; i < tomas.length; i++) {
                item = tomas[i];
                itemAnt = tomas[i-1];

                currentDate = new Date (item.date);
                previousDate = new Date (itemAnt.date);

                //Si es la primera añade separador de mes
                //if(i==1) item.sep = $filter('date')(currentDate,"MMMM yyyy") ;

                if(i==1) item.sep = $filter('mesAno')(currentDate) ;

                //console.log("mes "+ $filter('date')(currentDate,"MM") +" "+ $filter('date')(previousDate,"MM") );


               if ( $filter('date')(currentDate,"MM") != $filter('date')(previousDate,"MM") ){
                   item.sep = $filter('mesAno')(currentDate) ;
                }

                output.push(item);
            }
        }

        return output;
    };
})
