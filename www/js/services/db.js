angular.module("med.services", [])

.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform) {
  var self = this;

  // Handle query's and potential errors
  self.query = function (query, parameters) {
    parameters = parameters || [];
    var q = $q.defer();

    $ionicPlatform.ready(function () {
      $cordovaSQLite.execute(db, query, parameters)
      .then(function (result) {
        q.resolve(result);
      }, function (error) {
        console.warn('I found an error');
        console.warn(error);
        q.reject(error);
      });
    });
    return q.promise;
  }

  // Proces a result set
  self.getAll = function(result) {
    var output = [];

    for (var i = 0; i < result.rows.length; i++) {
      output.push(result.rows.item(i));
    }
    return output;
  }

  // Proces a single result
  self.getById = function(result) {
    var output = null;
    output = angular.copy(result.rows.item(0));
    return output;
  }

  return self;
})

.factory('Users', function($cordovaSQLite, DBA) {
  var self = this;

  self.all = function() {
    return DBA.query("SELECT id, name, days, date_ini, date_end, alarm FROM med")
    .then(function(result){
      return DBA.getAll(result);
    });
  }

  self.get = function(medId) {
    var parameters = [medId];

    return DBA.query("SELECT id, name, days, date_ini, date_end, alarm FROM med WHERE id = (?)", parameters)
    //return DBA.query("SELECT id, name, days, date_ini, date_end FROM med WHERE id = (?)", parameters)
    .then(function(result) {
      return DBA.getById(result);
    });
  }

  self.add = function(med) {
    var parameters = [med.name, med.days, med.date_ini, med.date_end, med.alarm];

    //return DBA.query("INSERT INTO med (name, days, date_ini, date_end) VALUES (?, ?, strftime('$s', ?), strftime('$s', ?))", parameters);
    return DBA.query("INSERT INTO med (name, days, date_ini, date_end, alarm) VALUES (?, ?, ?, ?, ?)", parameters);
  }


  self.remove = function(medId) {
    var parameters = [medId];
    return DBA.query("DELETE FROM med WHERE id = (?)", parameters);
  }

  self.update = function(editMed) {
    var parameters = [editMed.name, editMed.days, editMed.date_ini, editMed.date_end, editMed.alarm, editMed.id];
    return DBA.query("UPDATE med SET name = (?), days = (?), date_ini = (?), date_end = (?), alarm = (?) WHERE id = (?)", parameters);
  }

  return self;
})


.factory('Hours', function($cordovaSQLite, DBA) {
  var self = this;

  self.all = function() {
    return DBA.query("SELECT id, med_id, hour FROM hours")
    .then(function(result){
      return DBA.getAll(result);
    });
  }

  self.getByMed = function(medId) {
    var parameters = [medId];
    return DBA.query("SELECT id, med_id, hour FROM hours WHERE med_id = (?)", parameters)
    .then(function(result) {
      return DBA.getAll(result);
    });
  }

  self.get = function(hourId) {
    var parameters = [hourId];
    return DBA.query("SELECT id, med_id, hour FROM hours WHERE id = (?)", parameters)
    .then(function(result) {
      return DBA.getById(result);
    });
  }

  self.add = function(med_id, hour) {
    var parameters = [med_id, hour];
    console.log("db guarda hora "+hour);
    return DBA.query("INSERT INTO hours (med_id, hour) VALUES (?,?)", parameters);
  }

  self.remove = function(hourId) {
    var parameters = [hourId];
    return DBA.query("DELETE FROM hours WHERE id = (?)", parameters);
  }

  self.update = function(editHour) {
    var parameters = [editHour.med_id, editHour.hour, editHour.id];
    return DBA.query("UPDATE hours SET med_id = (?), hour = (?) WHERE id = (?)", parameters);
  }

  return self;
})


.factory('Tomas', function($cordovaSQLite, DBA) {
  var self = this;

  self.all = function() {
    return DBA.query("SELECT id, med_id, med_name, date, tomada FROM tomas ORDER BY date ASC ")
    .then(function(result){
      return DBA.getAll(result);
    });
  }

  self.getByMed = function(medId) {
    var parameters = [medId];
    return DBA.query("SELECT id, med_id, dmed_name, date, tomada FROM tomas WHERE med_id = (?)", parameters)
    .then(function(result) {
      return DBA.getAll(result);
    });
  }

/*
  Fecha hoy con 00:00:00
  Buscar fecha entre fecha de hoy y fecha +1
  self.getByDay = function(date) {
    var parameters = [date];
    return DBA.query("SELECT id, med_id, med_name, date FROM tomas WHERE date = (?)", parameters)
    .then(function(result) {
      return DBA.getAll(result);
    });
  }
*/

  self.get = function(tomaId) {
    var parameters = [tomaId];
    return DBA.query("SELECT id, med_id, med_name, date, tomada FROM tomas WHERE id = (?)", parameters)
    .then(function(result) {
      return DBA.getById(result);
    });
  }

  self.add = function(med_id, med_name, date, tomada) {
    var parameters = [med_id, med_name, date, tomada];
    console.log("db guarda toma dia "+date);
    return DBA.query("INSERT INTO tomas (med_id, med_name, date, tomada) VALUES (?,?,?,?)", parameters);
  }

  self.remove = function(tomaId) {
    var parameters = [tomaId];
    return DBA.query("DELETE FROM tomas WHERE id = (?)", parameters);
  }

  self.update = function(editToma) {
    var parameters = [editToma.med_id, editToma.med_name, editToma.date, editToma.tomada, editToma.id];
    return DBA.query("UPDATE tomas SET med_id = (?), med_name = (?), date = (?), tomada = (?) WHERE id = (?)", parameters);
  }

  self.setTomada = function(tomaId, tomada) {
    var parameters = [tomada, tomaId];
    return DBA.query("UPDATE tomas SET tomada = (?) WHERE id = (?)", parameters);
  }

  return self;
})
