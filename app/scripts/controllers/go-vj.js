'use strict';

angular.module('peepoltvApp')
  .controller('GoVjCtrl', function ($scope, streamService) {
    $scope.streams = streamService.resource.search();
  });
