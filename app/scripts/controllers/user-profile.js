'use strict';

angular.module('peepoltvApp')
  .controller('UserProfileCtrl', function ($scope, $rootScope, $location, user, userService) {

    // Catch the unauthorized pages
    $rootScope.$on('$routeChangeError', function (event, parameters) {
      // Navigate to main page
      $location.path('/');
    });

    // Expose the resolved user in the scope
    $scope.user = user;

    $scope.getPoolStreams = function(data){
      if(true || data.msg.event == 'pool-change'){
        $scope.user.$get();
      }
    };

  });
