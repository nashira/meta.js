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
  this._plus(this.rule);
};

MetaParser.prototype.rule = function() {
  var ruleName = this.token();
  this.spaces();
  this.identity('=');
  this.spaces();
  this.expr();
};

MetaParser.prototype.expr = function() {
  var exprBody = this._plus(this._not, this.identity, ',')
  console.log(exprBody)
  this.identity(',');
};

exports.MetaParser = MetaParser;