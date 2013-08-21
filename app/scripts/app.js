'use strict';

angular.module('peepoltvApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'licode'])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        section: 'explore'
      })
      .when('/explore', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        section: 'explore'
      })
      .when('/peepol', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        section: 'peepol'
      })
      .when('/search', {
        templateUrl: '/views/search-results.html',
        controller: 'SearchResultsCtrl',
        section: 'search'
      })
      .when('/golive', {
        templateUrl: '/views/golive.html',
        controller: 'GoliveCtrl',
        section: 'golive',
        resolve: {
          user: ['authService', function(authService){
            return authService.resource.status({}).$promise;
          }]
        }
      })
      .when('/govj', {
        templateUrl: '/views/go-vj.html',
        controller: 'GoVjCtrl',
        section: 'govj'
      })
      .when('/streams/:streamId', {
        templateUrl: '/views/stream.html',
        controller: 'StreamCtrl'
      })
      .when('/channels', {
        templateUrl: '/views/channels.html',
        controller: 'ChannelsCtrl'
      })
      .when('/channels/:section', {
        templateUrl: '/views/channels.html',
        controller: 'ChannelsCtrl'
      })
      .when('/channel/protest', {
        templateUrl: '/views/mock-channel.html',
        controller: 'MockChannelCtrl'
      })
      .when('/:channelName', {
        templateUrl: '/views/channel.html',
        controller: 'ChannelCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function($location, $rootScope, authService){
    $rootScope.$on('$routeChangeSuccess', function(event, current){
      $rootScope.section = current.$$route.section || null;
    });

    $rootScope.$on('$routeChangeError', function (event, parameters) {
      // Navigate to main page
      $location.path('/');
    });

    authService.resource.status({}, function(e){
      authService.user.email = e.email;
      authService.user.name = e.name;
    });
  });
