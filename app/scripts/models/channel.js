'use strict';

angular.module('peepoltvApp')
  .factory('Channel', function ($restmod, settings) {
    return $restmod('channels', {
      streams: { hasMany: 'Stream' }
    });
  });
