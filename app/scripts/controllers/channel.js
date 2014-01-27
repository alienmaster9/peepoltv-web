'use strict';

angular.module('peepoltv.controllers')
  .controller('ChannelCtrl', function ($scope, $stateParams, $timeout, $browser, AuthService, channel, VjStream, VjService) {

		$scope.user = AuthService.user;

    /**
     * SCOPE
     */
    $scope.self = $scope; // Expose the scope as self

    // The channel
    $scope.channel = channel;

    // The vj service
    $scope.vjService = VjService;

    // The live streams
    $scope.liveStreams = channel.streams.live(true);

    $scope.$on('stream-pool-stream-changed', function(event, stream){

      // Set the current stream
      $scope.currentStream = stream;

      // Send message new vj stream
      if(VjService.live){
        VjService.activateStream(stream);
      }

    });

    $scope.$on('stream-pool-changed', function(event, status){
      var action = status.action;
      console.log(action, status.stream);

      // Send message new vj stream
      if(VjService.live){
        if(status.action === 'add'){
          VjService.addStream(status.stream);
        }
        else if(status.action === 'remove'){
          VjService.removeStream(status.stream);
        }
      }

    });

    // Run when the video element is created
    $scope.$on('licode-video-created', function(event, stream){

      // Only when there is no current stream
      if(!$scope.currentStream){
        var eventStream = _.find($scope.liveStreams, function(s){return s.streamId === stream.getID();});

        // Choose the first strea to play in the main screen
        if(_.indexOf($scope.liveStreams, eventStream) === 0){
          // Set the current stream
          $scope.currentStream = eventStream;
        }
      }
    });

    $scope.startVj = function(){
      // The current stream id
      var currentStreamId = ($scope.currentStream)? $scope.currentStream.id : undefined;

      // Start the vj
      if($scope.liveStreams && $scope.liveStreams.length >= 1){
        VjService.startBroadcast($scope.liveStreams, currentStreamId);
      }
    };

    $scope.stopVj = function(){
      VjService.stopBroadcast();
    };

  });
