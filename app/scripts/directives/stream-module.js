'use strict';

angular.module('peepoltvApp')
  .directive('streamModule', function () {
    var DEFAULT_SIZE = 'large';

    var TEMPLATE_PATH = '/views/snippets/';

    var URL = {
      mini: 'module-mini.html',
      large: 'module-large.html',
      xlarge: 'module-xlarge.html'
    };

    return {
      templateUrl: function(e){
        var size = URL[e.attr('size') || DEFAULT_SIZE];

        return TEMPLATE_PATH + size;
      },
      restrict: 'EA',
      scope: {
        stream: '='
      }
    };
  });
