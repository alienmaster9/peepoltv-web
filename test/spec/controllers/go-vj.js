'use strict';

describe('Controller: GoVjCtrl', function () {

  // load the controller's module
  beforeEach(module('peepoltvApp'));

  var GoVjCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GoVjCtrl = $controller('GoVjCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
