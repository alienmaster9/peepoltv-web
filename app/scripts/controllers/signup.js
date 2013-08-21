'use strict';

angular.module('peepoltvApp')
  .controller('SignupCtrl', function ($scope, authService) {
    $scope.registerUser = function(){

      // Reset the alerts
      $scope.alert = null;

      var userData = {
        user: $scope.regUser
      };

      authService.resource.register(userData, function(e){
        //authService.cookies.setToken(e.data['auth_token']);
      },
      function(e){
        if(angular.isObject(e.data)){
          if(e.data.info.email && e.data.info.email[0] === 'has already been taken'){
            // The email is already taken
            $scope.alert = 'email';
          }
          else if(e.data.info.username && e.data.info.username[0] === 'has already been taken'){
            // The email is already taken
            $scope.alert = 'username';
          }
          else{
            $scope.alert = 'other';
          }
        }
        else{
          $scope.alert = 'other';
        }
      });
    };
  });
