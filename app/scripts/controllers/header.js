'use strict';

angular.module('peepoltvApp')
  .controller('HeaderCtrl', function ($scope, $location, $rootScope, authService, streamService) {

    $scope.$on('$locationChangeSuccess', function (){
      var path = $location.path();
      var match = path.match(/(?:explore|channels|peepol|golive|govj)/);
      $scope.section = (match)? match[0] : 'explore';
    });

    // Catch the unauthorized pages
    $rootScope.$on('$routeChangeError', function (event, parameters) {
      if(parameters.$$route.redirectAfterLogin){
        redirectTo = parameters.$$route.originalPath;
        loginAndRedirect();
      }
    });

    // The user
    $scope.user = authService.user;

    // Show options
    $rootScope.streamingOptions = {
      show: false
    };
    $scope.toggleOptions = function(){
      $rootScope.streamingOptions.show = !$rootScope.streamingOptions.show;
    };

    // Emit stop broadcast event
    $scope.stopBroadcast = function(stay){
      $rootScope.$broadcast('liveStreamStopped', { stay: stay});
    };

    // flag for going live
    $scope.goLiveAfterLogin = false;

    // Options for the modal
    $scope.loginModalOpts = {
      backdropFade: true,
      dialogFade:true
    };

    // launches the Go Live if the user is logged in
    var redirectTo = "/";
    var loginAndRedirect = function() {
      $scope.goLiveAfterLogin = false;
      if ($scope.user && $scope.user.email) {
        $location.path(redirectTo);
      } else {
        $scope.openLoginModal();
        $scope.goLiveAfterLogin = true;
      }
    }

    // Login in and signing up
    $scope.openLoginModal = function(){
      $scope.loginModalInit = true;
      $scope.$$childHead.loginModalAction = 'login';
    };

    // Close callback
    $scope.closeLoginModalCallback = function(){
      $scope.loginModalInit = false;
      if ($scope.goLiveAfterLogin && $scope.user && $scope.user.email) {
        loginAndRedirect();
      }
    };

    $scope.logout = function(){
      if(authService.user.email){

        authService.resource.logout(function(){
          authService.user.email = null;
          authService.user.name = null;
        });

      }
    };
  });
