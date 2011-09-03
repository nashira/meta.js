var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var MetaParser = function(input) {
  Meta.call(this, input);
};
inherits(MetaParser, Meta);

MetaParser.prototype.grammar = function() {
  this.identity('m');
  this.identity('e');
  this.identity('t');
  this.identity('a');
  
  var grammarName = this.name()[1];
  this.spaces();
  this.identity('{');
  var rules = this._plus(this.rule);
  this.spaces();
  this.identity('}');
  return [grammarName, rules];
};

MetaParser.prototype.rule = function() {
  var ruleName = this.name()[1];
  this.spaces();
  this.identity('=');
  var expression = this.expression();
  this.identity(',');
  return [ruleName, expression];
};

MetaParser.prototype.expression = function() {
  return this.choice();
};

MetaParser.prototype.choice = function() {
  var first = this.sequence();
  var rest = this._star(function() {
    this._star(this.space);
    this.identity('|');
    return this.sequence();
  });
  return ['choice', first.concat(rest)];
};

MetaParser.prototype.sequence = function() {
  return ['sequence', this._or(
    function() {
      return [this._plus(this.prefixed), this.action()];
    },
    function() {
      return this._plus(this.prefixed);
    }
  )];
};

MetaParser.prototype.prefixed = function() {
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

MetaParser.prototype.suffixed = function() {
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

MetaParser.prototype.primary = function() {
  return this._or(
    this.name,
    this.literal,
    function() {
      this._star(this.space);
      this.identity('(');
      this._star(this.space);
      var expr = this.expression();
      this._star(this.space);
      this.identity(')');
      return expr;
    }
  );
};

MetaParser.prototype.name = function() {
  this._star(this.space);
  var name = [this.letter()].concat(this._star(this._or, this.letter, this.digit));
  return ['name', name.join('')];
};

MetaParser.prototype.action = function() {
  this._star(this.space);
  this.identity('{');
  this._star(this.space);
  var block = this._star(
    function() {
      this._not(this.identity, '}');
      return this.char();
    }
  ).join('');
  this._star(this.space);
  this.identity('}');
  return ['action', block];
};

exports.MetaParser = MetaParser;


