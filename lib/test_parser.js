var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var TestParser = function(input) {
  Meta.call(this, input);
};
inherits(TestParser, Meta);

TestParser.prototype.foo = function() {
  return this._or(
    function _foo_() {
      return [this.foo(), this.space(), this.letter()];
    },
    this.letter
  );
};

TestParser.prototype.name = function() {
  this._star(this.space);
  var name = [this.letter()].concat(this._star(this._or, this.letter, this.digit));
  return ['name', name.join('')];
};

TestParser.prototype.grammar = function() {
  this._seq(
    function() {this.identity('m')},
    function() {this.identity('e')},
    function() {this.identity('t')},
    function() {this.identity('a')}
  );
  var grammarName = this.name()[1];
  this.spaces();
  this.identity('{');
  var rules = this._plus(this.rule);
  this.spaces();
  this.identity('}');
  return [grammarName, rules];
};

TestParser.prototype.rule = function() {
  var ruleName = this.name()[1];
  this.spaces();
  this.identity('=');
  var expression = this.expression();
  this.identity(',');
  return [ruleName, expression];
};

TestParser.prototype.expression = function() {
  return this.choice();
};

TestParser.prototype.choice = function() {
  var first = this.sequence();
  var rest = this._star(function() {
    this._star(this.space);
    this.identity('|');
    return this.sequence();
  });
  return ['choice', first.concat(rest)];
};

TestParser.prototype.sequence = function() {
  return ['sequence', this._plus(this.prefixed)];
};

TestParser.prototype.prefixed = function() {
  return ['prefixed', this._or(
    function() {
      this.identity('&');
      var expr = this.suffixed();
      return ['lookahead', expr];
    },
    function() {
      this.identity('~');
      var expr = this.suffixed();
      return ['not', expr];
    },
    this.suffixed
  )];
};

TestParser.prototype.suffixed = function() {
  return ['suffixed', this._or(
    function() {
      var expr = this.primary();
      this.identity('?');
      return ['optional', expr];
    },
    function() {
      var expr = this.primary();
      this.identity('+');
      return ['plus', expr];
    },
    function() {
      var expr = this.primary();
      this.identity('*');
      return ['star', expr];
    },
    this.primary
  )];
};

TestParser.prototype.primary = function() {
  return this._or(
    this.name,
    this.literal,
    function() {
      this.spaces();
      this.identity('(');
      this._star(this.space);
      var expr = this.expression();
      this._star(this.space);
      this.identity(')');
      return expr;
    }
  );
};

exports.TestParser = TestParser;


