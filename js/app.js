(function () {
  'use strict';
  // idk why, but adding ngMessages makes the messages stop working
  var app = angular
    .module('taxiFare', ['ngMaterial', 'ngMessages'])
    .config(function($mdThemingProvider) {
      $mdThemingProvider
        .theme('default')
        .primaryPalette('teal');
    })
    .config(function($httpProvider){
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
    });
  app.controller('MainCtrl', MainCtrl)

  function MainCtrl ($timeout, $q, $log, $http) {
    var self = this;
    $http.defaults.cache = true;
    self.simulateQuery = false;
    self.isDisabled    = false;
    // list of `state` value/display objects
    self.states = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    self.newState = newState;
    self.numRiders;
    self.currentText;

    var urlTop = "https://maps.googleapis.com/maps/api/place/autocomplete/json?input="
    var urlBtm = "&location=40.7128,-74.0059&radius=605000000"

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
      $log.info('Text changed to ' + text);
      // if(text !== "")
      //   placesAjax();
    }

    function placesAjax() {
      $http.get(urlTop + self.searchText + urlBtm)
        .success(function (response) {
          var autocomplete;
          response.predictions.map(function(item) {
            autocomplete = autocomplete + ": "
          });
          loadAll(autoComplete);
        });
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
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
  function DialogCtrl($scope, $mdDialog) {
    
    $scope.getInfo = function (ev, dest, numRiders) {
      var info = dest + " " + numRiders;
      var destLatLng = addressToLatLng(dest);
      var currLatLng;
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
    function addressToLatLng(address) {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': address}, function(results, status){
        if(status == google.maps.GeocoderStatus.OK) {
          results[0].geometry.location;
        } else {
          console.log("Error getting address: " + address);
        }
      });
    }
  }
})();