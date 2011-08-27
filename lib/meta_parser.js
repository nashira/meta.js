var Meta = require('./meta.js').Meta,
    ParseError = require('./parse_error.js').ParseError,
    inherits = require('util').inherits;

var MetaParser = function(input) {
  Meta.call(this, input);
};

inherits(MetaParser, Meta);

MetaParser.prototype.grammar = function() {
console.log('just printing stack::\n', new Error().stack)
  var opener = this.token();
  var grammarName = this.token();
  this.spaces();
  this.identity('{');
  var rules = this._plus(this.rule);
  console.log(rules)
  this.spaces();
  this.identity('}');
};

MetaParser.prototype.rule = function() {
  console.log('rule')
  var ruleName = this.token();
  this.spaces();
  this.identity('=');
  this.expr();
  this.identity(',');
  console.log('end rule')
  return 'rule: '+ruleName;
};

MetaParser.prototype.expr = function() {
  console.log('expr');
  
  this._star(this.space);
  var exprBody = this._or(
    this.group,
    this.seq,
    this.string,
    this.token,
    this.plus,
    this.star
  );
  console.log('expr 2', exprBody);
  return {name: 'expr', val: exprBody};
};

MetaParser.prototype.plus = function() {
  var expr = this.expr();
  this.identity('+');
  return {name: 'plus', val: expr};
};

MetaParser.prototype.star = function() {
  var expr = this.expr();
  this.identity('*');
  return {name: 'star', val: expr};
};

MetaParser.prototype.group = function() {
  this.identity('(');
  var expr = this.expr();
  this.identity(')');
  return {name: 'group', val: expr};
};

MetaParser.prototype.seq = function() {
  return {name: 'seq', val: this._plus(this.expr)};
};

exports.MetaParser = MetaParser;


