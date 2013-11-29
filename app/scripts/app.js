'use strict';

angular.module('peepoltvApp', ['ui.router', 'ui.bootstrap', 'pl-licode', 'plRestmod'])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $restmodProvider, settings) {
    // Remove hashes and enables html push state history
    $locationProvider.html5Mode(true);

    // Force some redirections
    $urlRouterProvider
      .otherwise('/');

    // Define the application routes
    $stateProvider

      /* Routes user ui-sref="" instead of href
      ROUTE                                     URL
      - main                                    /
      - explore                                 /explore
      - search.streams                          /search/streams
      - search.channels                         /search/channels
      - search.peepol                           /search/peepol
      - golive                                  /golive
      - profile                                 /profile
      - profile.settings                        /profile/settings
      - stream({streamId: <streamId>})          /stream/:streamId
      - user({userName: <username>})            /user/:userName
      - channel({channelName: <channelname>})   /:channelName
      - vjsession({                             /:channelName/:userName
            channelName: <channelname>,
            userName: <username>
          })
      */

      // Main
      .state('main', {
        url: '/?reset_password_token',
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })

      // Explore
      .state('explore', {
        url: '/explore',
        templateUrl: '/views/explore.html',
        controller: 'ExploreCtrl'
      })

      // Search
      .state('search', {
        url: '/search',
        abstract: true,
        templateUrl: '/views/search-results.html',
        controller: 'SearchResultsCtrl'
      })
      .state('search.streams', {
        url: '/streams',
        templateUrl: '/views/search-results-streams.html'
      })
      .state('search.channels', {
        url: '/channels',
        templateUrl: '/views/search-results-channels.html'
      })
      .state('search.peepol', {
        url: '/peepol',
        templateUrl: '/views/search-results-peepol.html'
      })

      // Golive
      .state('golive', {
        url: '/golive',
        templateUrl: '/views/golive.html',
        controller: 'GoliveCtrl',
        resolve: {
          user: ['AuthService', function(AuthService) {
            return AuthService.getSession();
          }]
        }
      })

      // Profile
      .state('profile', {
        url: '/profile',
        templateUrl: '/views/profile.html',
        controller: 'ProfileCtrl'
      })

      .state('profile.settings', {
        url: '/settings',
        templateUrl: '/views/profile-settings.html',
        controller: 'ProfileSettingsCtrl'
      })

      // Streams
      .state('stream', {
        url: '/stream/:streamId',
        templateUrl: '/views/stream.html',
        controller: 'StreamCtrl'
      })

      // User
      .state('user', {
        url: '/user/{userName:[0-9a-zA-Z]*}',
        templateUrl: '/views/user.html',
        controller: 'UserCtrl'
      })

      .state('password', {
        url: '/profile/edit',
        templateUrl: '/views/main.html',
        controller: 'MainCtrl'
      })

      // Channels
      .state('channel', {
        url: '/{channelName:[0-9a-zA-Z]*}',
        templateUrl: '/views/channel.html',
        controller: 'ChannelCtrl',
        resolve: {
          channel: ['$stateParams', 'Channel', function($stateParams, Channel){
            return Channel.$find($stateParams.channelName).$promise;
          }]
        }
      })

      // Vj session
      .state('vjsession', {
        url: '/{channelName:[0-9a-zA-Z]*}/{userName:[0-9a-zA-Z]*}',
        templateUrl: '/views/vj-session.html',
        controller: 'VjSessionCtrl'
      })

      // Config restmod
      $restmodProvider.pushModelBase(function() {
        this.setRestUrlOptions({ baseUrl: settings.apiHost });
      });
  })
  .run(function($location, $rootScope, AuthService){
    $rootScope.$on('$stateChangeError', function (event, parameters) {
      // Navigate to main page
      $location.path('/');
    });

    // Create an app object in the root scope for general application variables
    var app = {
      isLoggedIn: false // Set the logged in app status
    };
    $rootScope.app = app;

    // Change the logged in status on session change
    $rootScope.$on('sessionChanged', function(event, session, logginStatus){
      app.isLoggedIn = logginStatus;
    });

    // Try to get a initialized session
    AuthService.getSession();

  });
