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
    return {
      templateUrl: '/views/directives/vj-module.html',
      restrict: 'EA',
      scope: {
        maxStreams: '@',
        streams: '=streamsPool'
      },
      link: function postLink(scope, element, attrs) {
        var canvas, ctx, video, interval, currentStream;

        // The streams that are going to be connected
        scope.streamsConnected = [];

        // Watch when streams are added or removed from the pool
        scope.$watch('streams', function(value, oldValue){
          // Return if not streams defined
          if(!value){
            return;
          }

          if(value.length > scope.maxStreams){
            console.log('Streams reached the max amount of streams in the pool');

            // Remove the extra streams
            value.length = scope.maxStreams;
          }

          // Find all the new stream and add them to the pool
          var newIds = _.pluck(_.pluck(value, 'stream'), 'id');
          var oldIds = _.pluck(_.pluck(oldValue, 'stream'), 'id');
          var newStreamsIds = _.difference(newIds, oldIds);

          // Post to the api the new streams
          _.each(newStreamsIds, function(id){
            streampoolService.resource.post({'stream_id': id}).$promise.then(
              function(r){
                // add the stream to the pool to trigger connection
                scope.streamsConnected.push(r.stream);

                // Connect to the data room if it is not connected
                if(scope.localDataStream.stream.room === undefined){
                  scope.token = r.token;
                  drawScreen(true);
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
        }, true);

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
          // TODO:

        };

        var broadcastEvent = function(event, params){
          scope.localDataStream.stream.sendData({
            'event': event,
            params: params
          });
        };

        // clear big stream
        var clearBigScreen = function(){
          // Stop the interval
          if(interval){
            clearInterval(interval);
          }

          // Clear the big screen
          drawScreen(true);
        };

        var showStreamBig = function(stream){
          if(!stream.token){
            return;
          }

          var elementId = JSON.parse(window.atob(stream.token)).tokenId;
          // shut off the video
          // if(video){
          //   video.muted = true;
          // }

          // Get the video from the licode directive
          video = angular.element('video', '#licode_' + elementId)[0];
          // Set video volume
          // if(!$scope.globalMute){
          //   video.muted = false;
          // }

          // Clear the interval to start a new one
          if(interval){
            clearInterval(interval);
          }

          // Create a new interval to render the video
          interval = setInterval(drawScreen, 33);
        };

        // Redrew at framerate to the canvas
        var drawScreen = function(clear){
          // dont't clear
          clear = clear || false;

          var width = canvas.width();
          var height = canvas.height();

          // Destination size
          var dWidth = height*video.videoWidth/video.videoHeight;
          var dHeight = height;
          var widthDiff = (width-dWidth)/2;

          // Paint the frame
          if(clear){
            // paint it black
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect (0, 0, width, height);
          }
          else {
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
