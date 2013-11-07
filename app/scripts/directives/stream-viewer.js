'use strict';

angular.module('peepoltvApp')
  .directive('streamViewer', function () {
    var DEFAULT_SIZE = 'large';

    var TEMPLATE_PATH = '/views/templates/stream-viewer/';

    var URL = {
      mini: 'stream-viewer-mini.html',
      large: 'stream-viewer-large.html'
    };

    return {
      templateUrl: function(e){
        return TEMPLATE_PATH + (URL[e.attr('size')] || URL[DEFAULT_SIZE]);
      },
      scope: {
        stream: "="
      },
      restrict: 'EA'
    };
  });
