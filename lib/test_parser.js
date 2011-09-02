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
    this.choice,
    this.seq,
    this.plus,
    this.star,
    this.exprLeaf
  );
  return {name: 'expr', val: exprBody};
};

TestParser.prototype.expr1 = function() {
  var exprBody = this._or(
    this.plus,
    this.star,
    this.exprLeaf
  );
  return {name: 'expr1', val: exprBody};
};

TestParser.prototype.exprLeaf = function() {
  var exprBody = this._or(
    this.literal,
    this.token
  );
  return {name: 'exprLeaf', val: exprBody};
};

TestParser.prototype.choice1 = function() {
  this.spaces();
  this.identity('|');
  var expr = this.expr1();
  return {name: 'choice1', val: expr};
};

TestParser.prototype.choice = function() {
  var expr = [this.expr1()].concat(this._plus(this.choice1));
  return {name: 'choice', val: expr};
};

TestParser.prototype.seq = function() {
  var seq = this._plus(this.expr1);
  return {name: 'seq', val: seq};
};

TestParser.prototype.plus = function() {
  var expr = this.exprLeaf();
  this.identity('+');
  return {name: 'plus', val: expr};
};

TestParser.prototype.star = function() {
  var expr = this.exprLeaf();
  this.identity('*');
  return {name: 'star', val: expr};
};

exports.TestParser = TestParser;


