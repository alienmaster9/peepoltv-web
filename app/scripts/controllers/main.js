'use strict';

angular.module('peepoltvApp')

  .controller('MainCtrl', function ($scope, streamService, geolocation, $location) {

    // Change the location when is changed
    $scope.$on('locationChanged', function (event, parameters) {
      // Create map
      if(!$scope.map)
        $scope.map = L.mapbox.map('map', 'peepoltv.map-ujvx87td');

      // Disable scroll to zoom
      $scope.map.scrollWheelZoom.disable();

      var zoom = 16;
      if(parameters.type && parameters.type !== 'street_address' && parameters.type !== 'route'){
        zoom = 13;
      }
      $scope.map.setView(new L.LatLng(parameters.coords.lat, parameters.coords.lng), zoom );
    });

    // Get current location
    $scope.geolocation = geolocation;
    geolocation.getCurrent();

    // Get the streams based on geolocation
    streamService.resource.search({limit: 20}, function(r){
        $scope.streams = _.map(r, function(s){
          s.properties['marker-size'] = 'medium';
          s.properties['marker-color'] = '#A954F5';
          s.properties['marker-symbol'] = 'cinema';
          return s;
        });

        if(!$scope.map) return;
        // Create and add marker layer
        var markerLayer = L.mapbox.markerLayer();
        markerLayer.setGeoJSON({
          type: 'FeatureCollection',
          features: $scope.streams
        });
        markerLayer.addTo($scope.map);

        markerLayer.eachLayer(function(marker) {
          var feature = marker.feature;

          // Create custom popup content
          var popupContent = '<div class="popup clearfix">' +
          						'<div class="popup-left pull-left">' +
          							'<div class="video-popup">' +
          								'<a href="/streams/{{stream.id}}">' +
											'<img src="' + feature.thumbs.medium + '">' +
										'</a>' +
          							'</div>' +
          							'<div class="specs-popup clearfix">' +
          								'<ul class="no-bullets">' +
          									'<li class="thumb-user pull-left">' +
          										'<a href="#" title="username">' +
													'<img src="http://fakeimg.pl/54x54/?text=User">' +
												'</a>' +
          									'</li>' +
          									'<li class="specs-title">' + feature.title + '</li>' +
          									'<li class="specs-tags">' + feature.tags.join(", ") + '</li>' +
          								'</ul>' +
          							'</div>' +
		  						'</div>' +
		  						'<div class="popup-right pull-left">' +
		  							'<a target="_blank" href="/streams/' + feature.id + '">' +
		  								'<button class="play-btn"><span class="visually-hidden">click to play video</span></button>' +
		  							'</a>' +
		  						'</div>' +
                             '</div>';

          // http://leafletjs.com/reference.html#popup
          marker.bindPopup(popupContent,{
            closeButton: false,
            minWidth: 320
          });

        });

        // Set inital center and zoom
        //$scope.map.fitBounds(markerLayer.getBounds());
      });

    // Address search
    // $scope.address defined in the view
    $scope.searchAddress = function(){
      geolocation.reverseGeocode($scope.address);
    };

    // Search streams
    $scope.searchStreams = function(){
      $location.url("/search?q=" + $scope.searchString);
    };

    $scope.getCurrent = function(){
      $scope.address = '';
      geolocation.getCurrent();
    };
  });
