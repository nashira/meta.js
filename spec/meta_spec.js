var Meta = require('../lib/meta.js').Meta;
var grammar = require('fs').readFileSync('./lang/meta.meta').toString();

describe("meta.js", function() {
  var meta;
  
  beforeEach(function() {
    meta = new Meta(grammar);
  });
  
  describe("any", function() {
    it("consumes one atom from the input stream", function() {
      expect(meta.any()).toEqual('m');
    });
  });
});