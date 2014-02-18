'use strict';

angular.module('peepoltv.controllers')
  .controller('VjSessionCtrl', function ($scope, channel, user, VjService) {

    $scope.self = $scope;

    // The current channel
    $scope.channel = channel;

    // The current user
    $scope.user = user;

    // The streams in the user vj pool
    $scope.vjstreams = user.vjstreams.$fetch();

    // Create a socket data connection with the user token
    VjService.startListening(user.vjToken);

    // Set the active stream as the current stream in the scope
    $scope.$on('licode-video-created', function(event, stream){

      // Only when there is no current stream
      if(!$scope.currentStream){
        var eventStream = _.find($scope.vjstreams, function(s){return s.stream.streamId === stream.getID();});

        // Choose the one that's active to play in the main screen
        if(eventStream.active){
          // Set the current stream
          $scope.currentStream = eventStream.stream;
        }
      }
    });
  });
