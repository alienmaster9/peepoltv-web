'use strict';

angular.module('peepoltvApp')
  .service('streamService', function streamService($resource, $q, settings) {

    var cache = {};
    var resource = $resource(settings.apiHost + '/streams/:streamId', {}, {
      get: {
        method: 'GET',
        params:{
          clientId: '@clientId'
        },
        withCredentials: true
      },
      'save': {
        method: 'PUT',
        params:{
          clientId: '@clientId'
        },
        withCredentials: true
      },
      'search': {
        method:'GET',
        params: {},
        isArray: true,
        withCredentials: true
      },
      'new': {
        method: 'POST',
        params: {},
        withCredentials: true
      }
    });

    // Public API here
    return {
      resource: resource,
      stream: undefined,
      localStream: undefined,
      room: undefined,
      resolve: function(streamId){

        var deferred = $q.defer();

        // Do not reload the stream if we are trying to get
        // the same stream as current stream stored in the navigation service
        if(parseInt(streamId, 10) === cache.id){
          deferred.resolve(cache);
        }
        else{
          resource.get({streamId: streamId}, function(r){
          // Get more info the stream based on the url
            //angular.extend($scope.stream, r);
            if(r){
              cache = r;
              deferred.resolve(r);
            }
            else
            {
              deferred.reject();
            }

          });
        }
        return deferred.promise;
      }

    };
  });
