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

TestParser.prototype.nameEnd = function() {
  return this._or(this.letter, this.digit);
};

TestParser.prototype.name = function() {
  this._star(this.space);
  var name = [this.letter()].concat(this._star(this.nameEnd));
  return ['name', name.join('')];
};

TestParser.prototype.grammar = function() {
  var opener = this._seq(
    function() {this.identity('m')},
    function() {this.identity('e')},
    function() {this.identity('t')},
    function() {this.identity('a')}
  ).join();
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
  var expr = this.expr();
  this.identity(',');
  return [ruleName, expr];
};

TestParser.prototype.expr = function() {
  var exprBody = this._or(
    this.choice,
    this.seq,
    this.plus,
    this.star,
    this.exprLeaf
  );
  return exprBody;
};

TestParser.prototype.expr1 = function() {
  var exprBody = this._or(
    this.plus,
    this.star,
    this.exprLeaf
  );
  return exprBody;
};

TestParser.prototype.exprLeaf = function() {
  var exprBody = this._or(
    this.literal,
    this.name
  );
  return exprBody;
};

TestParser.prototype.choice1 = function() {
  this.spaces();
  this.identity('|');
  var expr = this.seq();
  return expr;
};

TestParser.prototype.choice = function() {
  var expr = [this.seq()].concat(this._plus(this.choice1));
  return ['choice', expr];
};

TestParser.prototype.seq = function() {
  var seq = this._plus(this.expr1);
  return ['seq', seq];
};

TestParser.prototype.plus = function() {
  var expr = this.exprLeaf();
  this.identity('+');
  return ['plus', expr];
};

TestParser.prototype.star = function() {
  var expr = this.exprLeaf();
  this.identity('*');
  return ['star', expr];
};

exports.TestParser = TestParser;


