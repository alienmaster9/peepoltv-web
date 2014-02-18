'use strict';

angular.module('peepoltv.models')
  .factory('User', function ($restmod) {
    return $restmod.model('users', {
      streams: { hasMany: 'Stream'},
      vjstreams: { hasMany: 'VjStream', path: 'streams_pool'}
    },
    function() {
      this.on('after-save', function() {
        var user = this;
        //remove the password after signup
        delete user.password;
      });
    });
  });
