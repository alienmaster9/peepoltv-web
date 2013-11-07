'use strict';

angular.module('peepoltvApp')
  .controller('ChannelCtrl', function ($scope, $routeParams, $browser, channel) {

    /**
     * VARIABLES
     */
    var vm = {}; // Define viewmodel
    var previewStream, currentStream; // Streams
    var canvas, ctx; // Canvas and it's context

    /**
     * SCOPE
     */
    $scope.vm = vm; // Expose the viewmodel in the scope
    $scope.ctrl = this; // Expose the controller

    // The channel
    vm.channel = channel;

    // The live streams
    vm.liveStreams = channel.streams.live();

    // The stream pool
    vm.streamPool = _.first(vm.liveStreams, 4);

    // Preview a stream
    this.previewStream = function(data){
      // Mute preview
      if(previewStream){
        toggleMuteStream(previewStream, true);
      }

      // Set preview stream
      previewStream = data.stream;

      // Show this stream in the big screen
      showStreamBig(data.stream);

    };

    // Go back to the current stream
    this.showCurrentStream = function(){
      // Mute preview
      if(previewStream){
        toggleMuteStream(previewStream, true);
      }

      // Remove preview
      previewStream = undefined;

      if(currentStream){
        // Show currentstream in the big screen
        showStreamBig(currentStream);
      }
      else{
        clearBigScreen();
      }
    };

    // Change the current stream
    this.changeStream = function(data){
      // Show this stream in the big screen
      showStreamBig(data.stream);

      // Mute the old stream
      if(currentStream){
        toggleMuteStream(currentStream, true);
      }

      // Set the current stream
      currentStream = data.stream;
      data.active = true;

      // Post to the api that the current stream changed
      streampoolService.resource.put({'stream_id': data.stream.id, active: true});

      // Send thought the data channel info of the current stream
      broadcastEvent('stream-active', { 'stream_id': data.stream.id });
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

    var toggleMuteStream = function(stream, force){
      // Get the video from the licode directive
      var video = getVideoElement(stream);

      // toggle mute
      if(video){
        if(force !== null){
          video.muted = force;
        }
        else{
          video.muted = !video.muted;
        }
        console.log(video.muted? 'muted: ' : 'unmuted: ', stream.id, video);
      }
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
  });
