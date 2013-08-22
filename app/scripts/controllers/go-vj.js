'use strict';

angular.module('peepoltvApp')
  .controller('GoVjCtrl', function ($scope, streamService) {
    // Get all the live streams
    $scope.streams = streamService.resource.search({ live: true , limit: 20});

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
        var stream = dragEl.scope().stream;
        // Prevent to add the stream to times to the pool
        if (_.findWhere($scope.streampool, {id: stream.id})) {
          return false;
        }

        // On drop add the stream to the pool through the streampool service
        return true;
      }
    };
  });
