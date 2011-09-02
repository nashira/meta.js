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

TestParser.prototype.grammar = function() {
  var opener = this.token();
  var grammarName = this.token();
  this.spaces();
  this.identity('{');
  var rules = this._plus(this.rule);
  this.spaces();
  this.identity('}');
  return {name: 'grammar', value: [grammarName, rules]}
};

TestParser.prototype.rule = function() {
  var ruleName = this.token();
  this.spaces();
  this.identity('=');
  var exprs = this._plus(this.expr);
  this.identity(',');
  return {name: 'rule', value: [ruleName, exprs]};
};

TestParser.prototype.expr = function() {
  var exprBody = this._or(
    this.bar,
    this.plus,
    this.token,
    this.literal
  );
  return {name: 'expr', val: exprBody};
};

TestParser.prototype.bar = function() {
  var expr = this.expr();
  this.identity('|');
  return {name: 'bar', val: expr};
};

TestParser.prototype.plus = function() {
  var expr = this.expr();
  this.identity('+');
  return {name: 'plus', val: expr};
};

exports.TestParser = TestParser;


