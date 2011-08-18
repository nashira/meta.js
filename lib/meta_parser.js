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
  this.identity('}');
};

MetaParser.prototype.rule = function() {
  console.log('rule')
  var ruleName = this.token();
  this.spaces();
  this.identity('=');
  this.spaces();
  this.expr();
};

MetaParser.prototype.expr = function() {
  var exprBody = '';
  while(true){
    try{
      this._not(this.identity, ',');
    } catch(e){
      if(!(e instanceof ParseError)) {
        throw e;
      }
      break;
    }
    exprBody += this.any();
  }
  console.log(exprBody)
  this.identity(',');
};

exports.MetaParser = MetaParser;