var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var TestParser = function(input) {
  Meta.call(this, input);
};

inherits(TestParser, Meta);

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
    this.token,
    this.literal,
    this.bar,
    this.plus
  );
  return {name: 'expr', val: exprBody};
};

TestParser.prototype.bar = function() {
  this._star(this.space);
  this.identity('|')
  return {name: 'bar', val: '|'};
};

TestParser.prototype.plus = function() {
  this._star(this.space);
  this.identity('+')
  return {name: 'plus', val: '+'};
};

exports.TestParser = TestParser;


