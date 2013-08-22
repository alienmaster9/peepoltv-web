'use strict';

angular.module('licode', [])
  .directive('licode', function () {
    return {
      restrict: 'EA',
      replace: true,
      template: '<div></div>',
      scope: {
        ngModel: '=?',
        options: '=?',
        token: '@',
        onAccessAccepted: '&',
        onAccessDenied: '&',
        onRoomConnected: '&',
        onRoomDisconnected: '&',
        onStreamAdded: '&',
        onStreamRemoved: '&',
        onStreamSubscribed: '&',
        onStreamData: '&'
      },
      link: function postLink(scope, element, attrs) {
        var room, elementId;
        var licode = {
          stream: null,
          permissionsGranted: false
        };

        // Set an ID
        elementId = (scope.token !== '')? 'licode_' + JSON.parse(window.atob(scope.token)).tokenId : 'licode_' + (new Date()).getTime();
        element.attr('id', elementId);

        // Set video size
        element.css({
          'width': attrs.width,
          'height': attrs.height
        });

        // Set the model
        if(attrs.ngModel){
          scope.ngModel = licode;
        }

        // Initiate the stream (camera/mic permissions)
        if(attrs.flow === "outbound"){

          // Stream options
          if(!scope.options){
            scope.options = {audio: true, video: true, data: false};
          }

          // Create the stream
          licode.stream = Erizo.Stream(scope.options);
          licode.stream.init();

          // Show the stream if persmission are accepted
          licode.stream.addEventListener('access-accepted', function () {
            console.log('Access to webcam and microphone granted');

            // Set permission status
            scope.$apply(function(){
              licode.permissionsGranted = true;
            });

            licode.stream.show(elementId);
            licode.stream.player.video.muted = true;

            // Execute access accepted callback
            if(scope.onAccessAccepted){
              scope.onAccessAccepted();
            }
          });

          licode.stream.addEventListener('access-denied', function() {
            // Set permission status
            scope.$apply(function(){
              licode.permissionsGranted = false;
            });

            // Execute access denied callback
            if(scope.onAccessDenied){
              scope.onAccessDenied();
            }
          });

        }

        // Connect to strean based on token change
        scope.$watch('token', function(value){
          // Disconnect if exist a room and it's connected
          if(room && room.state === 2){
            room.disconnect();
          }

          // Return if not token defined
          if(!value){
            return;
          }

          // Create the new room
          try {
            room = Erizo.Room({token: value});
            room.connect();
          } catch (e){
            console.log("Invalid token");
            return;
          }

          room.addEventListener('room-disconnected', function(roomEvent) {
            // Remove the room when disconnected
            room = null;

            // Execute room disconnected callback
            if(scope.onRoomDisconnected){
              scope.onRoomDisconnected();
            }
          });

          // Connected
          room.addEventListener('room-connected', function(roomEvent) {

            // Stream added to the room
            room.addEventListener('stream-added', function(event) {
              // Execute stream added callback
              if(scope.onStreamAdded){
                scope.onStreamAdded();
              }
            });

            // Stream Removed from the room
            room.addEventListener('stream-removed', function(event) {
              // Execute stream removed callback
              if(scope.onStreamRemoved){
                scope.onStreamRemoved();
              }
            });

            // Stream data into the room
            room.addEventListener('stream-data', function(event) {
              // Execute stream data callback
              if(scope.onStreamData){
                scope.onStreamData();
              }
            });

            if(attrs.flow === "outbound"){

              // Publish stream to the room
              room.publish(licode.stream);

            }
            else if(attrs.flow === "inbound"){

              if(roomEvent.streams.length < 1){
                console.log("invalid stream");
                return;
              }

              // Stream subscribed
              room.addEventListener('stream-subscribed', function(streamEvent) {
                licode.stream = streamEvent.stream;

                // Initialize the video element only if the stream has video or audio
                if(streamEvent.stream.hasVideo() || streamEvent.stream.hasAudio()){
                  licode.stream.show(elementId);
                }

                // Execute stream subscribed callback
                if(scope.onStreamSubscribed){
                  scope.onStreamSubscribed();
                }
              });

              // Subscribe to the first stream in the room stream
              room.subscribe(roomEvent.streams[0]);
            }

            // Execute room connected callback
            if(scope.onRoomConnected){
              scope.onRoomConnected();
            }
          });
        });
      }
    };
  });
