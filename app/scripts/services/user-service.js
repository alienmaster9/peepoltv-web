'use strict';

angular.module('peepoltvApp')
  .service('userService', function userService($resource, settings, $q) {
    var resource = $resource(settings.apiHost + '/users/:username', {}, {
      get: {
        method: 'GET',
        params:{
          username: '@username'
        },
        withCredentials: true
      }
    });

    // Public API here
    return {
      resource: resource
    };
  });
