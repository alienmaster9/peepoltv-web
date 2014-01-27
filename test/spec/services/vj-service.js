'use strict';

describe('Service: VjService', function () {

  // load the service's module
  beforeEach(module('peepoltvApp'));

  // instantiate service
  var VjService;
  beforeEach(inject(function (_VjService_) {
    VjService = _VjService_;
  }));

  it('should do something', function () {
    expect(!!VjService).toBe(true);
  });

});
