'use strict';

angular.module('peepoltvApp')
  .controller('GoliveCtrl', function ($scope, streamService, geolocation, $rootScope) {
    // Change the location when is changed
    $scope.$on('locationChanged', function (event, parameters) {
      $scope.coords = parameters.coords;
    });

    // Get current location
    geolocation.getCurrent();

    // Modal Options
    $scope.opts = {
      backdropFade: true,
      keyboard: false,
      backdropClick: false
    };

    // Open/close modal methods
    $scope.openModal = function(){
      $scope.goLiveInitModal = true;
    };

    $scope.closeModal = function(){
      $scope.goLiveInitModal = false;
    };

    // Open de dialog
    $scope.openModal();

    // Start the broadcast
    $scope.startBroadcast = function(metadata){
      if(!$scope.localStream.permissionsGranted){
        // The mic/cam permissions
        return;
      }

      // Hide the modal
      $scope.closeModal();

      // Star the broadcast
      goOnAir(metadata);

    };

    $scope.stopBroadcast = function(){
      $scope.stream.token = null;
    };

    // Stream data from the init modal
    $scope.streamOptions = {};

    // Header streaming options
    $scope.streamingOptions = $rootScope.streamingOptions;

    // Stop the broadcast
    $rootScope.$on('liveStreamStopped', function(e, r){
      // Unpublish stream from room
      $scope.localStream.stream.room.unpublish($scope.localStream.stream.getID());

      // Disconnect from room
      $scope.localStream.stream.room.disconnect();

      // Set the stream as no live
      $scope.stream.live = false;
      $scope.stream.$save({streamId: $scope.stream.id});

      // Go back
      if(!r.stay && $scope.localStream.stream){
        $scope.localStream.stream.stream.stop();
        history.back();
      }
      else{
        $scope.openModal();
      }
    });

    // Get a proportional thumbnail
    var getThumbnailURL = function(video, width, height){
      // Canvas
      var canvas = document.createElement('canvas');
      canvas.ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      // Destination size
      var dWidth = width;
      var dHeight = $(video).height()*width/$(video).width();

      // Create and return the image
      canvas.ctx.drawImage( video, 0, 0, dWidth, dHeight);
      return canvas.toDataURL('image/jpeg');
    };

    // Start the transitions
    var goOnAir = function(metadata){
      var streamData = {
        thumb: getThumbnailURL($scope.localStream.stream.player.video, 854, 480)
      };

      // Add the metadata
      if(metadata){
        streamData.caption = ($scope.streamOptions.caption)? $scope.streamOptions.caption : '';

        if($scope.coords && $scope.coords.lng && $scope.coords.lat){
          streamData.lng = $scope.coords.lng;
          streamData.lat = $scope.coords.lat;
        }
      }

      // Post the new stream to the server
      $scope.stream = streamService.resource.new(streamData);
    };

    // Hashtags
    var regexp = new RegExp('#([^\\s|^#]+)','g');
    $scope.$watch('streamOptions.caption', function(a){
      if(a){
        $scope.channels = a.match(regexp);
      }
    });

  });
