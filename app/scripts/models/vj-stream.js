'use strict';

angular.module('peepoltv.models')
  .factory('VjStream', function ($restmod, SyncMask) {
    return $restmod.model('streams_pool', {
      stream: { hasOne: 'Stream' },
      token: { ignore: SyncMask.ENCODE }
    }, function(){
      this.setPrimaryKey('streamId');

      this.on('after-add', function(vjStream){
          vjStream.streamId = vjStream.stream.id;
        });
    });
  });
