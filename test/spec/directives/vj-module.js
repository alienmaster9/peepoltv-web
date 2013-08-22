'use strict';

describe('Directive: vjModule', function () {
  beforeEach(module('peepoltvApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<vj-module></vj-module>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the vjModule directive');
  }));
});
