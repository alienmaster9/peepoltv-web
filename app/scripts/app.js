'use strict';

angular.module('peepoltvApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'pl-licode', 'plRestmod'])
  .config(function ($routeProvider, $locationProvider, $restmodProvider, settings) {
    $locationProvider.html5Mode(true);
    $routeProvider

      // Main
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'MainCtrl',
        section: 'explore'
      })

      // Explore
      .when('/explore', {
        templateUrl: '/views/explore.html',
        controller: 'ExploreCtrl',
        section: 'explore'
      })

      // Search
      .when('/search', {
        templateUrl: '/views/search-results.html',
        controller: 'SearchResultsCtrl',
        section: 'search'
      })

      // Golive
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

      // Streams
      .when('/streams/:streamId', {
        templateUrl: '/views/stream.html',
        controller: 'StreamCtrl'
      })

      // Profile
      .when('/profile', {
        templateUrl: '/views/profile.html',
        controller: 'ProfileCtrl'
      })

      // Channels
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
        controller: 'ChannelCtrl',
        resolve: {
          channel: ['$route', 'Channel', function($route, Channel){
            return Channel.$find($route.current.params.channelName).$promise;
          }]
        }
      })

      .otherwise({
        redirectTo: '/'
      });

      $restmodProvider.pushModelBase(function(){
        this.setRestUrlOptions({
          baseUrl: settings.apiHost
        })
      });
  })
  .run(function($location, $rootScope, authService){
    $rootScope.$on('$routeChangeSuccess', function(event, current){
      $rootScope.section = current.$$route.section || null;
    });

    $rootScope.$on('$routeChangeError', function (event, parameters) {
      // Navigate to main page
      console.log("error", event, parameters);
      $location.path('/');
    });

    authService.resource.status({}, function(e){
      authService.user.email = e.email;
      authService.user.name = e.name;
    });
  });
