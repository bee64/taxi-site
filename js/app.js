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
    $http.defaults.cache = true;
    self.simulateQuery = false;
    self.isDisabled    = false;
    // list of `state` value/display objects
    self.states = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange  = selectedItemChange;
    self.searchTextChange    = searchTextChange;
    self.numRiders;

    function newState(state) {
      alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }
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
      if(text !== "")
        placesAjax();
    }

    function placesAjax() {
      // $http.get(urlTop + self.searchText + urlBtm)
      //   .success(function (response) {
      //     var autocomplete = "";
      //     console.log(response);
      //     response.predictions.forEach(function(item) {
      //       autocomplete = autocomplete + ": "
      //     });
      //     loadAll(autocomplete);
      //   });
      var req = {
        method: 'POST',
        url: '/autocomplete',
        data: {
          text: self.searchText
        }
      }
      $http(req)
        .then(function success(res) {
          console.log(res);
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
      var info = curr + " " + dest + " " + numRiders;
      calcDistDuration(curr, dest);

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
    }

    function calcDistDuration(start, end) {
      var geocoder = new google.maps.Geocoder();
      var spos;
      var epos;
      geocoder.geocode({'address': start}, function(results, status){
        if(status == google.maps.GeocoderStatus.OK) {
          spos = results[0].geometry.location;
          
          geocoder.geocode({'address': end}, function(results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
              epos = results[0].geometry.location;
              var urlTop = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=";
              var urlPos = spos.lat() + "," + spos.lng()
                + "&destinations=" + epos.lat() + "," + epos.lng();
              var urlBtm;
              $http.get(urlTop + urlPos)
                .success(function(response) {
                  console.log(response);
                });
            } else {
              console.log("Error getting end address: " + end);
            }
          });
        } else {
          console.log("Error getting address: " + start);
        }
      });

    }
  }
})();