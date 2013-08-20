'use strict';

describe('Directive: streamModule', function () {
  beforeEach(module('peepoltvApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<stream-module></stream-module>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the streamModule directive');
  }));
});
