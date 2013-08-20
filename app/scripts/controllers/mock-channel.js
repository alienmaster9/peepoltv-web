'use strict';

angular.module('peepoltvApp')
  .controller('MockChannelCtrl', function ($scope, $browser, $sce) {

    $scope.streams = [
      {
        title: 'Protests turn violent in Oxford Street, London',
        geo: 'London, England',
        tags: ['violence', 'protest'],
        comments: 43,
        rebrodcasts: 32,
        likes: 190
      },
      {
        title: 'Three Mursi supporters reportedly shot dead at Cairo barracks protest',
        geo: 'Cairo',
        tags: ['Mursi', 'protest', 'barracks'],
        comments: 3,
        rebrodcasts: 87,
        likes: 190
      },
      {
        title: 'Seattle May Day Protest 2013',
        geo: 'Seattle, US',
        tags: ['protest', 'May day'],
        comments: 43,
        rebrodcasts: 32,
        likes: 234
      },
      {
        title: ' Turkish police brutally disperse Istanbul park demolition ',
        geo: 'Istanbul, Turkey',
        tags: ['police'],
        comments: 23,
        rebrodcasts: 12,
        likes: 654
      },
      {
        title: 'Police presence at July 11 casseroles protest',
        geo: 'Vancouver, Canada',
        tags: ['police', 'casseroles', 'protest'],
        comments: 32,
        rebrodcasts: 65,
        likes: 76
      },
      {
        title: 'Verizon at iPhone 4s launch protest',
        geo: 'San Francisco, US',
        tags: ['iPhone', 'protest'],
        comments: 22,
        rebrodcasts: 34,
        likes: 270
      }
    ];

    $scope.stream = $scope.streams[0];

    $scope.getStreamUrl = function(key){
      return $sce.trustAsResourceUrl('http://beta.peepol.tv/videos/stream' + key + '.mp4');
    };

    var drawScreen = function(){
      var width = $scope.canvas.width();
      var height = $scope.canvas.height();

      // Destination size
      var dWidth = height*$scope.video.videoWidth/$scope.video.videoHeight;
      var dHeight = height;
      var widthDiff = (width-dWidth)/2;

      // Paint the frame
      $scope.ctx.drawImage($scope.video , widthDiff, 0, dWidth, dHeight);

      // paint it black
      $scope.ctx.fillStyle = "rgb(0,0,0)";
      $scope.ctx.fillRect (0, 0, widthDiff, height);

      // paint it black
      $scope.ctx.fillStyle = "rgb(0,0,0)";
      $scope.ctx.fillRect (widthDiff + dWidth, 0, widthDiff, height);
    };
    $scope.globalMute = false;
    $scope.toggleMute= function(){
      $scope.globalMute = !$scope.globalMute;
      $scope.video.muted = $scope.globalMute;
    };

    $scope.changeStream = function(streamId){
      // shut off the video
      if($scope.video){
        $scope.video.muted = true;
      }

      $scope.video = angular.element('#stream' + streamId)[0];
      // Set video volume
      if(!$scope.globalMute){
        $scope.video.muted = false;
      }

      if($scope.interval){
        clearInterval($scope.interval);
      }

      $scope.interval = setInterval(drawScreen, 33);

      $scope.stream = $scope.streams[streamId];
    };

    $browser.defer(function(){

      $scope.canvas = angular.element('#canvas');
      $scope.ctx = $scope.canvas[0].getContext('2d');

      setTimeout(function(){
        $scope.changeStream(0);
      }, 1000);

    }, 0);

  });
