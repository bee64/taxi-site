(function () {
  'use strict';
  // idk why, but adding ngMessages makes the messages stop working
  var app = angular
    .module('taxiFare', ['ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider, $httpProvider) {
      $mdThemingProvider
        .theme('default')
        .primaryPalette('teal');
      // $httpProvider.defaults.useXDomain = true;
      // $httpProvider.defaults.headers.common = 'Content-Type: application/json';
      // delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })
  app.controller('MainCtrl', MainCtrl)

  function MainCtrl ($timeout, $q, $log, $http) {
    var self = this;
    // $http.defaults.cache = true;
    self.simulateQuery = false;
    self.isDisabled    = false;
    // list of `state` value/display objects
    self.states = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange  = selectedItemChange;
    self.searchTextChange    = searchTextChange;
    self.searchTextChange2   = searchTextChange2;
    self.numRiders;
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }
    function searchTextChange(text) {
      // $log.info('Text changed to ' + text);
      if(text !== "" && text !== undefined)
        placesAjax(1);
    }
    function searchTextChange2(text){
      if(text !== "" && text !== undefined)
        placesAjax(2);
    }

    function placesAjax(num) {
      var text;
      if(num === 1)
        text = self.searchText;
      if(num === 2)
        text = self.searchText2;
      var req = {
        method: 'POST',
        url: '/autocomplete',
        data: {'text': text}
      }
      $http(req)
        .then(function success(res) {
          console.log("gettin' called");
          self.states = loadAuto(res);
        }, function error(res) {
          console.log(res);
        });
    }

    function selectedItemChange(item) {
      // $log.info('Item changed to ' + JSON.stringify(item));
    }

    function loadAll() {
      var allLocations = "Central Park Zoo, Carnegie Hall, Times Square, Imperial Theatre, Columbia University, American Museum of Natural History, Yankee Stadium, Bronx Zoo, Cross County Shopping Center, University Hospital"; 
      return allLocations.split(/, +/g).map( function (location) {
        return {
          value: location.toLowerCase(),
          display: location
        };
      });
    }

    function loadAuto(res) {
      var locations = res.data.predictions;
      
      return locations.map(function(loc){
        var temp = loc.terms[0].value;
        console.log(temp);
        return {
          value: temp.toLowerCase(),
          display: temp
        };
      });
    }

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  }

  app.controller('DialogCtrl', DialogCtrl);
  function DialogCtrl($scope, $mdDialog, $http) {
    
    $scope.getInfo = function (ev, curr, dest, numRiders) {
      calcDistDuration(curr, dest, function(time, dist){
        var info = "Time: " + time + ", Distance: " + dist + ", Riders: " + numRiders;
        var req = {
          method: 'POST',
          url: '/fare',
          data: {
            'time': time,
            'dist': dist,
            'riders': numRiders
          }
        }
        $http(req)
          .then(function success(res) {
            info = '$' + res.data.calc;
            $mdDialog.show(
            $mdDialog.alert()
              .parent(angular.element(document.body))
              .clickOutsideToClose(true)
              .title("Fare")
              .textContent(info)
              .ariaLabel("dialog")
              .ok('Continue')
              .targetEvent(ev)
              .openFrom('#top')
              .closeTo('#bottom')
            );
          }, function error(res){
            console.log(res);
          });
      });
    }

    function usableAddress(address){
      var temp;
      temp = address.replace(' ', '+');
      temp = temp + "+New+York+City,+NY";
      return temp;
    }

    function calcDistDuration(start, end, callback) {
      var geocoder = new google.maps.Geocoder();
      var spos;
      var epos;
      start = usableAddress(start);
      end   = usableAddress(end);
      var urlTop = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=";
      var urlBtm = start + "&destinations=" + end + "&departure_time=" + Math.round(new Date().getTime()/1000.0) + "&traffic_model=best_guess";

      $http.get(urlTop + urlBtm)
      .success(function(res) {
        var values = res.rows[0].elements[0];
        callback(values.duration.text, values.distance.text);
      });
    }
  }
})();