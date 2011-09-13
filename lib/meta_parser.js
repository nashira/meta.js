var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var MetaParser = function(input) {
  Meta.call(this, input);
};
inherits(MetaParser, Meta);

MetaParser.prototype.grammar = function() {
  this.token('meta');
  this._();
  var grammarName = this.name();
  this._opt(this._);
  this.identity('{');
  var rules = this._plus(this.rule);
  this._opt(this._);
  this.identity('}');
  return {name: grammarName, rules: rules};
};

MetaParser.prototype.rule = function() {
  this._opt(this._);
  var ruleName = this.name();
  this._();
  this.identity('=');
  this._();
  var expression = this.expression();
  this.identity(',');
  return {name: ruleName, expr: expression};
  
};

MetaParser.prototype.name = function() {
  return this._or(
    function() {
      return this.identity('_');
    },
    function() {
      return [this.letter()].concat(this._star(this._or, this.letter, this.digit)).join('');
    }
  );
};

MetaParser.prototype.expression = function() {
  return this.choice();
};

MetaParser.prototype.choice = function() {
  var first = this.sequence();
  var rest = this._star(function() {
    this._();
    this.identity('|');
    return this.sequence();
  });
  if(rest.length){
    return {name: 'choice', exprs: [first].concat(rest)};
  }
  return first;
};

MetaParser.prototype.sequence = function() {
  var seq = this._plus(this.labeled);
  var action = this._opt(this.action);
  if(seq.length > 1){
    seq = {name: 'sequence', exprs: seq};
  } else {
    seq = seq[0];
  }
  if(action){
    seq.action = action;
  }
  return seq;
};

MetaParser.prototype.labeled = function() {
  this._opt(this._);
  return this._or(
    function() {
      var expr = this.prefixed();
      this.identity(':');
      expr.label = this.name();
      return expr;
    },
    this.prefixed
  );
};

MetaParser.prototype.prefixed = function() {
  return this._or(
    function() {
      this.identity('&');
      var expr = this.suffixed();
      return {name: 'lookahead', expr: expr};
    },
    function() {
      this.identity('~');
      var expr = this.suffixed();
      return {name: 'not', expr: expr};
    },
    this.suffixed
  );
};

MetaParser.prototype.suffixed = function() {
  return this._or(
    function() {
      var expr = this.primary();
      this.identity('?');
      return {name: 'optional', expr: expr};
    },
    function() {
      var expr = this.primary();
      this.identity('+');
      return {name: 'plus', expr: expr};
    },
    function() {
      var expr = this.primary();
      this.identity('*');
      return {name: 'star', expr: expr};
    },
    this.primary
  );
};

MetaParser.prototype.primary = function() {
  return this._or(
    function() {
      return {name: 'call', val: this.name()}
    },
    function() {
      return {name: 'literal', val: this.literal()};
    },
    function() {
      return {name: 'litseq', val: this.litseq()};
    },
    this.group
  );
};

MetaParser.prototype.group = function() {
  this.identity('(');
  this._opt(this._);
  var expr = this.expression();
  this._opt(this._);
  this.identity(')');
  return expr;
};

MetaParser.prototype.action = function() {
  this._opt(this._);
  this.token('->');
  var block = this._star(
    function() {
      this._not(this.token, '<-');
      return this.char();
    }
  ).join('');
  this.token('<-');
  return block;
};

exports.MetaParser = MetaParser;


