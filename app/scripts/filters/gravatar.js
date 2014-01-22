'user strict';

/* global SparkMD5: false */

angular.module('peepoltv.filters')
  .filter('gravatar', function() {
    return function(input, size, defaultImage){
      if (input) {
        var emailHash = SparkMD5.hash(input.toLowerCase().trim());
        return '//www.gravatar.com/avatar/' + emailHash + '?s=' + size;
      } else {
        return defaultImage;
      }
    };
  });
