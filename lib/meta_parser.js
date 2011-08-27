var Meta = require('./meta.js').Meta,
    ParseError = require('./parse_error.js').ParseError,
    inherits = require('util').inherits;

var MetaParser = function(input) {
  Meta.call(this, input);
};
inherits(MetaParser, Meta);

MetaParser.prototype.grammar = function() {
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
  this.spaces();
  this.expr();
  this.identity(',');
  console.log('end rule')
  return 'rule: '+ruleName;
};

MetaParser.prototype.expr = function() {
  this._star(this.space);
  var exprBody = this._or(
    this.token,
    this.string,
    this.expr
  );
  var modifier = this._opt(this._or,
    function plus() {return this.identity('+')},
    function or() {return this.identity('|')},
  );
  return exprBody;
};

exports.MetaParser = MetaParser;