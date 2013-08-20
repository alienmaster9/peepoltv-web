'use strict';

angular.module('peepoltvApp')
  .directive('streamModule', function () {
    var DEFAULT_SIZE = 'large';
    var DEFAULT_TYPE = 'static';

    var TEMPLATE_PATH = '/views/snippets/';

    var URL = {
      mini: 'module-mini.html',
      large: 'module-large.html',
      xlarge: 'module-xlarge.html'
    };
    var TYPE_PREFIXES = {
      vj: 'vj-',
      'static': ''
    };

    return {
      templateUrl: function(e){
        var size = URL[e.attr('size') || DEFAULT_SIZE];
        var prefix = TYPE_PREFIXES[e.attr('type') || DEFAULT_TYPE];

        return TEMPLATE_PATH + prefix + size;
      },
      restrict: 'EA'
    };
  });
