'use strict';

angular.module('peepoltv.models')
  .factory('VjStream', function ($restmod, SyncMask) {
    return $restmod.model('streams_pool', {
      stream: { hasOne: 'Stream' },
      token: { ignore: SyncMask.ENCODE }
    }, function(){
      this.setPrimaryKey('streamId');

      this.on('after-add', function(vjStream){

        var collection = this;

        // Add the stream id to the vj stream
        vjStream.streamId = vjStream.stream.id;

        // Add a hook the each element to mantain the active status
        // when a vj stream is set as active
        vjStream.$on('after-save', function(){
          _.each(collection, function(vjs){
            if(vjs.active && vjs.streamId !== vjStream.streamId){
              vjs.active = false;
            }
          });
        });


      });
    });
  });
