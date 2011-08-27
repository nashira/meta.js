var Meta = require('../lib/meta.js').Meta;
var grammar = require('fs').readFileSync('./lang/meta.meta').toString();

describe("meta.js", function() {
  var meta;
  
  beforeEach(function() {
  });
  
  describe("any", function() {
    it("consumes one atom from the input stream", function() {
      meta = new Meta('b* h');
      expect(meta.any()).toEqual('b');
      expect(meta.any()).toEqual('*');
      expect(meta.any()).toEqual(' ');
      expect(meta.any()).toEqual('h');
      meta = new Meta([{}, "Asdf", []]);
      expect(meta.any()).toEqual({});
      expect(meta.any()).toEqual('Asdf');
      expect(meta.any()).toEqual([]);
      expect(function() {meta.space()}).toThrow('3: unexpected end of input');
    });
  });
  
  describe("space", function() {
    it("consumes one space char from the input stream", function() {
      meta = new Meta(' \na');
      expect(meta.space()).toEqual(' ');
      expect(meta.space()).toEqual('\n');
      expect(function() {meta.space()}).toThrow('2: expected space, got: "a"');
    });
  });
  
  describe("spaces", function() {
    it("consumes one or more spaces from the input stream", function() {
      meta = new Meta('    \n  \naaaa');
      expect(meta.spaces()).toEqual('    \n  \n'.split(''));
      expect(function() {meta.spaces()}).toThrow('8: expected space, got: "a"');
    });
  });
  
  describe("char", function() {
    it("consumes one char (string of length 1) from the input stream", function() {
      meta = new Meta('a char');
      expect(meta.char()).toEqual('a');
      expect(meta.char()).toEqual(' ');
      expect(meta.char()).toEqual('c');
      expect(meta.char()).toEqual('h');
      expect(meta.char()).toEqual('a');
      expect(meta.char()).toEqual('r');
      meta = new Meta(['a', 'string']);
      expect(meta.char()).toEqual('a');
      expect(function() {meta.char()}).toThrow('1: expected char, got: "string"');
    });
  });
  
  describe("letter", function() {
    it("consumes one char that matches /\\w/ from the input stream", function() {
      meta = new Meta('abc 1^');
      expect(meta.letter()).toEqual('a');
      expect(meta.letter()).toEqual('b');
      expect(meta.letter()).toEqual('c');
      expect(function() {meta.letter()}).toThrow('3: expected letter, got: " "');
      meta.any();
      expect(function() {meta.letter()}).toThrow('4: expected letter, got: "1"');
      meta.any();
      expect(function() {meta.letter()}).toThrow('5: expected letter, got: "^"');
      meta = new Meta(['a', 'string', [], {}]);
      expect(meta.letter()).toEqual('a');
      expect(function() {meta.letter()}).toThrow('1: expected char, got: "string"');
      meta.any();
      expect(function() {meta.letter()}).toThrow('2: expected char, got: ""');
      meta.any();
      expect(function() {meta.letter()}).toThrow('3: expected char, got: "[object Object]"');
    });
  });
  
  describe("string", function() {
    it("consumes a single quote surrounded string", function() {
      meta = new Meta("'the'");
      expect(meta.string()).toEqual("the");
      meta = new Meta("\"quick\"");
      expect(function() {meta.string()}).toThrow('0: expected open quote, got: """');
      meta = new Meta("'brown\"");
      expect(function() {meta.string()}).toThrow('7: unexpected end of input');
      meta = new Meta("'fox\\'jumped'");
      expect(meta.string()).toEqual("fox'jumped");
    });
  });
  
  describe("token", function() {
    it("consumes one or more letters", function() {
      meta = new Meta('mary');
      expect(meta.token()).toEqual('mary');
      meta = new Meta('had a little');
      expect(meta.token()).toEqual('had');
      meta = new Meta("'lamb'");
      expect(function() {meta.token()}).toThrow('0: expected letter, got: "\'"');
    });
  });
  
  describe("identity", function() {
    it("consumes an atom from the stream if it === the item passed in", function() {
      meta = new Meta(['me']);
      expect(meta.identity('me')).toEqual('me');
      var myself = {i: 'am'};
      meta = new Meta([myself]);
      expect(meta.identity(myself)).toEqual(myself);
      meta = new Meta([{}]);
      expect(function() {meta.identity({})}).toThrow('0: expected "[object Object]" to be identical to : "[object Object]"');
    });
  });
  
  describe("_plus", function() {
    it("consumes one or more of the passed in rule, passes back an array", function() {
      meta = new Meta("aab baa");
      expect(meta._plus(meta.letter)).toEqual(['a','a','b']);
      meta = new Meta("aab baa");
      expect(meta._plus(meta.identity, 'a')).toEqual(['a','a']);
      meta = new Meta("baa aab");
      expect(function() {meta._plus(meta.identity, 'a')}).toThrow('0: expected "b" to be identical to : "a"');
    });
  });
  
  describe("_star", function() {
    it("consumes zero or more of the passed in rule, passes back an array", function() {
      meta = new Meta("aab baa");
      expect(meta._star(meta.letter)).toEqual(['a','a','b']);
      meta = new Meta("aab baa");
      expect(meta._star(meta.identity, 'a')).toEqual(['a','a']);
      meta = new Meta("baa aab");
      expect(function() {meta._star(meta.identity, 'a')}).not.toThrow();
    });
  });
  
  describe("_not", function() {
    it("returns true if the passed in rule throws a parse error, else trows an error", function() {
      meta = new Meta("aab baa");
      expect(meta._not(meta.space)).toEqual(true);
      meta = new Meta("aab baa");
      expect(meta._not(meta.identity, 'b')).toEqual(true);
      meta = new Meta("aab baa");
      expect(function() {meta._not(meta.identity, 'a')}).toThrow('0: expected to not match rule: "identity"');
    });
  });
  
  describe("_lookahead", function() {
    it("returns true if the passed in rule can be applied, else returns false", function() {
      meta = new Meta("aab baa");
      expect(meta._lookahead(meta.space)).toEqual(false);
      meta = new Meta("aab baa");
      expect(meta._lookahead(meta.identity, 'a')).toEqual(true);
      meta = new Meta("aab baa");
      expect(function() {meta._lookahead(meta.identity, 'b')}).not.toThrow();
    });
  });
  
  describe("_or", function() {
    it("iterates through the passed in rules returns first one that parses, else throws", function() {
      meta = new Meta("aab baa");
      expect(meta._or(
        function() {return this.identity('b')},
        function() {return this.identity('a')}
      )).toEqual('a');
      
      // meta = new Meta("aab baa");
      // expect(meta._lookahead(meta.identity, 'a')).toEqual(true);
      // meta = new Meta("aab baa");
      // expect(function() {meta._lookahead(meta.identity, 'b')}).not.toThrow();
    });
  });
});