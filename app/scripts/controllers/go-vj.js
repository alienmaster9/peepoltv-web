'use strict';

angular.module('peepoltvApp')
  .controller('GoVjCtrl', function ($scope, streampoolService) {
    // Get all the live streams
    $scope.availableStreams = streampoolService.resource.getAvailableStreams({});

    // Pool of stream that are synched with the viewers
    $scope.streampool = [];

    // Options for draggable streams
    $scope.draggable = {
      placeholder: 'keep'
    };
    $scope.draggableOptions = {
      revert: 'invalid'
    };
    $scope.droppableOptions = {
      accept: function(dragEl) {
        var availableStream = dragEl.scope().availableStream;
        // Prevent to add the stream to times to the pool
        if (_.findWhere($scope.streampool, {id: availableStream.stream.id})) {
          return false;
        }

        // On drop add the stream to the pool through the streampool service
        return true;
      }
    };
  });
