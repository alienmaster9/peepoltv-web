'use strict';

angular.module('peepoltvApp')
  .service('streampoolService', function streampoolService($resource, settings) {

    // Resource to connect to the api
    var resource = $resource(settings.apiHost + '/streams_pool', {}, {
      get: {
        method: 'GET',
        withCredentials: true
      },
      post: {
        method:'POST',
        withCredentials: true
      },
      put: {
        method:'PUT',
        withCredentials: true
      },
      getAvailableStreams: {
        method:'GET',
        params: {
          live: true,
          limit:20,
          'force_check': true
        },
        url: settings.apiHost + '/streams',
        transformResponse: function(data){
          return _.map(angular.fromJson(data), function(s){
            return {
              active: false,
              stream: s
            };
          });
        },
        isArray: true,
        withCredentials: true
      }
    });

    // Public API service
    return {
      resource: resource
    };
  })
  .directive('vjModule', function ($browser, streampoolService) {
    var DEFAULT_TYPE = 'viewer';
    var TEMPLATE_PATH = '/views/directives/';
    var TEMPLATES = {
      creator: 'vj-module.html',
      viewer: 'vj-module-viewer.html'
    };

    return {
      templateUrl: function(e){
        var type = TEMPLATES[e.attr('type') || DEFAULT_TYPE];
        return TEMPLATE_PATH + type;
      },
      restrict: 'EA',
      scope: {
        token: '@?',
        maxStreams: '@',
        streamsPool: '=',
        onStreamData: '&'
      },
      link: function postLink(scope, element, attrs) {
        var canvas, ctx, interval, currentStream, previewStream;

        // Watch when streams are added or removed from the pool
        scope.$watch('streamsPool', function(value, oldValue){
          // Return if not streams defined
          if(!value){
            return;
          }

          if(value.length > scope.maxStreams){
            console.log('Streams reached the max amount of streams in the pool');

            // Remove the extra streams
            value.length = scope.maxStreams;
          }

          if(attrs.type == 'creator'){

            // Find all the new stream and add them to the pool
            var newIds = _.pluck(_.pluck(value, 'stream'), 'id');
            var oldIds = _.pluck(_.pluck(oldValue, 'stream'), 'id');
            var newStreamsIds = _.difference(newIds, oldIds);

            // Post to the api the new streams
            _.each(newStreamsIds, function(id){
              streampoolService.resource.post({'stream_id': id}).$promise.then(
                function(r){

                  // Connect to the data room if it is not connected
                  if(scope.localDataStream.stream.room === undefined){
                    scope.token = r.token;
                    clearBigScreen();
                  }
                  else
                  {
                    // Broadcast to all users that a new stream is in the pool
                    broadcastEvent('pool-change');
                  }
                },
                function(){
                  // remove the stream from the streams array
                  _.reject(value, function(s){ return s.id === id;});
                }
              );
            });
          }
        }, true);

        // Add loading listener to the video element for this stream
        scope.addLoadingListener = function(stream){
          var videoEl = getVideoElement(stream);
          videoEl.addEventListener('play', function(){
            var videoModule = angular.element("#pool-stream-" + stream.id);
            angular.element(".spinner-overlay", videoModule).removeClass(".loading");
            angular.element("img", videoModule).hide();
          });
        }

        // Preview a stream
        scope.previewStream = function(data){
          // Show this stream in the big screen
          showStreamBig(data.stream);
        };

        // Go back to the current stream
        scope.showCurrentStream = function(){
          if(currentStream){
            // Show currentstream in the big screen
            showStreamBig(currentStream);
          }
          else{
            clearBigScreen();
          }
        };

        // Change the current stream
        scope.changeStream = function(data){
          // Show this stream in the big screen
          showStreamBig(data.stream);

          // Set the current stream
          currentStream = data.stream;
          data.active = true;

          // Post to the api that the current stream changed
          streampoolService.resource.put({'stream_id': data.stream.id, active: true});

          // Send thought the data channel info of the current stream
          broadcastEvent('stream-active', { 'stream_id': data.stream.id });
        };

        scope.removeStream = function(data){
          // Remove the stream from the pool
          var indexToRemove = _.indexOf(_.map(scope.streamsPool, function(s) {
            return s.id;
          }), data.id);

          scope.$apply(function(){
            scope.streamsPool.splice(indexToRemove);
          });
        };

        scope.dataReceived = function(data){

          if(data.msg.event === 'stream-active'){
            var activeStream = _.find(scope.streamsPool, function(s){ return s.stream.id == data.msg.params.stream_id;});
            if(activeStream && activeStram.stream){
              scope.changeStream(activeStream);
            }
          }

          // Execute de callback on onStreamData event
          if(scope.onStreamData){
            scope.onStreamData({event: data.msg});
          }
        };

        var broadcastEvent = function(event, params){
          scope.localDataStream.stream.sendData({
            'event': event,
            params: params
          });
        };

        var getVideoElement = function(stream){
          // Get the id from the stream dom element
          var elementId = JSON.parse(window.atob(stream.token)).tokenId;

          // Get the video from the licode directive
          return angular.element('video', '#licode_' + elementId)[0];
        };

        // clear big stream
        var clearBigScreen = function(){
          // Stop the interval
          if(interval){
            clearInterval(interval);
          }

          // Clear the big screen
          drawScreen(null, true);
        };

        var showStreamBig = function(stream){
          if(!stream.token){
            return;
          }

          // Get the video from the licode directive
          var video = getVideoElement(stream);
          // Set video volume
          if(video){
            console.log("unmute: ", stream.id);
            video.muted = false;
          }

          // Clear the interval to start a new one
          if(interval){
            clearInterval(interval);
          }

          // Create a new interval to render the video
          if(video){
            interval = setInterval(function(){
              drawScreen(video);
            }, 33);
          }
        };

        // Redrew at framerate to the canvas
        var drawScreen = function(video, clear){
          // dont't clear
          clear = clear || false;

          var width = canvas.width();
          var height = canvas.height();

          // Destination size


          // Paint the frame
          if(clear || !video){
            // paint it black
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect (0, 0, width, height);
          }
          else {
            var dWidth = height*video.videoWidth/video.videoHeight;
            var dHeight = height;
            var widthDiff = (width-dWidth)/2;

            ctx.drawImage(video , widthDiff, 0, dWidth, dHeight);

            // paint it black
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect (0, 0, widthDiff, height);

            // paint it black
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect (widthDiff + dWidth, 0, widthDiff, height);
          }
        };

        // Prepare the canvas to show the current stream
        $browser.defer(function(){
          canvas = angular.element('#canvas');
          ctx = canvas[0].getContext('2d');
        }, 0);
      }
    };
  });
