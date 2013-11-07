'use strict';

describe('Directive: streamViewer', function () {

  // load the directive's module
  beforeEach(module('peepoltvApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<stream-viewer></stream-viewer>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the streamViewer directive');
  }));
});
