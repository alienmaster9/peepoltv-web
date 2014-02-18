'use strict';

angular.module('peepoltv', [
  'ui.router',
  'ui.bootstrap',
  'infinite-scroll',
  'pl-licode',
  'leaflet-directive',
  'peepoltv.models',
  'peepoltv.services',
  'peepoltv.directives',
  'peepoltv.filters',
  'peepoltv.controllers'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $restmodProvider, $sceDelegateProvider, streamViewerConfigProvider, settings) {
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
    - terms	                                  /terms
		- trademark	                              /trademark
    - privacy                                 /privacy
    - about                                   /about
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
      url: '/',
      templateUrl: '/views/main.html',
      controller: 'MainCtrl'
    })

    // Explore
    .state('explore', {
      url: '/explore/',
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
      url: '/streams/?q',
      templateUrl: '/views/search-results-streams.html'
    })
    .state('search.channels', {
      url: '/channels/',
      templateUrl: '/views/search-results-channels.html'
    })
    .state('search.peepol', {
      url: '/peepol/',
      templateUrl: '/views/search-results-peepol.html'
    })

    // Golive
    .state('golive', {
      url: '/golive/',
      templateUrl: '/views/golive.html',
      controller: 'GoliveCtrl',
      resolve: {
        session: ['AuthService', function(AuthService) {
          return AuthService.getSession();
        }]
      }
    })

    // Profile
    .state('profile', {
      url: '/profile/',
      templateUrl: '/views/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        session: ['AuthService', function(AuthService) {
          return AuthService.getSession();
        }]
      }
    })

    // Streams
    .state('stream', {
      url: '/stream/:streamId/',
      templateUrl: '/views/stream.html',
      controller: 'StreamCtrl'
    })

    // User
    .state('user', {
      url: '/user/{userName:[0-9a-zA-Z-_]+}/',
      templateUrl: '/views/user.html',
      controller: 'UserCtrl',
      resolve: {
        user: ['$stateParams', 'User', function($stateParams, User){
          return User.$find($stateParams.userName).$promise;
        }]
      }
    })

    .state('password?reset_password_token&complete', {
      url: '/profile/edit/?reset_password_token&complete',
      templateUrl: '/views/main.html',
      controller: 'MainCtrl'
    })

    // Channels
    .state('channel', {
      url: '/{channelName:[0-9a-zA-Z-_]+}/',
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
      url: '/{channelName:[0-9a-zA-Z-_]+}/{userName:[0-9a-zA-Z-_]+}/',
      templateUrl: '/views/vj-session.html',
      controller: 'VjSessionCtrl',
      resolve: {
        channel: ['$stateParams', 'Channel', function($stateParams, Channel){
          return Channel.$find($stateParams.channelName).$promise;
        }],
        user: ['$stateParams', 'User', function($stateParams, User){
          return User.$find($stateParams.userName).$promise;
        }]
      }
    })

    // Terms
    .state('terms', {
      url: '/terms',
      templateUrl: '/views/terms.html'
    })

    // Terms
    .state('trademark', {
      url: '/trademark',
      templateUrl: '/views/trademark.html'
    })

    // Privacy
    .state('privacy', {
      url: '/privacy',
      templateUrl: '/views/privacy.html'
    })

    // About
    .state('about', {
      url: '/about',
      templateUrl: '/views/about.html'
    });

    // Config restmod
  $restmodProvider.pushModelBase(function() {
    this.setUrlPrefix(settings.apiHost);
  });

  // Config whitelist for amazon s3
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'https://s3.amazonaws.com/media-peepol.tv/**'
  ]);

  // Set stream viewer size presets
  streamViewerConfigProvider.addPreset('mini', 'auto', 100);
  streamViewerConfigProvider.addPreset('large', '100%', 512);
  streamViewerConfigProvider.addPreset('auto', '100%', '100%');
  streamViewerConfigProvider.setDefaultPreset('large');
})
.run(function($state, $rootScope, AuthService, CameraService){
  $rootScope.$on('$stateChangeError', function (event, to) {
    if (to.name === 'golive') {
      AuthService.askLogin().then(function() {
        $state.go('golive');
      });
    }
    // Navigate to main page
    $state.go('main');
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

  // On state success
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
    // Add the current state to the app variable
    app.state = toState.name;

    // Stop the camera every time we leave the golive page
    if(fromState.name === 'golive' && CameraService.licodeStream.stream){
      CameraService.licodeStream.stream.stop();
    }

  });

  // Try to get a initialized session
  AuthService.getSession();

});
