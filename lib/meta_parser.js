var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var MetaParser = function(input) {
  Meta.call(this, input);
};
inherits(MetaParser, Meta);

MetaParser.prototype.grammar = function() {
  this.token('meta');
  this._();
  var grammarName = this.name()[1];
  this._opt(this._);
  this.identity('{');
  var rules = this._plus(this.rule);
  this._opt(this._);
  this.identity('}');
  return [grammarName, rules];
};

MetaParser.prototype.rule = function() {
  this._opt(this._);
  var ruleName = this.name()[1];
  this._();
  this.identity('=');
  this._();
  var expression = this.expression();
  this.identity(',');
  return [ruleName, expression];
};

MetaParser.prototype.name = function() {
  return ['name', this._or(
    function() {
      return this.identity('_');
    },
    function() {
      return [this.letter()].concat(this._star(this._or, this.letter, this.digit)).join('');
    }
  )];
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
    return ['choice', [first].concat(rest)];
  }
  return first;
};

MetaParser.prototype.sequence = function() {
  var seq = this._plus(this.labeled);
  var action = this._opt(this.action);
  if(seq.length > 1){
    seq = ['sequence', seq];
  } else {
    seq = seq[0];
  }
  if(action) {
    seq = ['action', seq];
  }
  return seq;
};

MetaParser.prototype.labeled = function() {
  this._opt(this._);
  return this._or(
    function() {
      var expr = this.prefixed();
      this.identity(':');
      return ['labeled', [this.name(), expr]];
    },
    this.prefixed
  );
};

MetaParser.prototype.prefixed = function() {
  return this._or(
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
  );
};

MetaParser.prototype.suffixed = function() {
  return this._or(
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
  );
};

MetaParser.prototype.primary = function() {
  return this._or(
    this.name,
    function() {
      return ['literal', this.literal()];
    },
    function() {
      return ['whitespace', this.identity('_')];
    },
    function() {
      return ['litseq', this.litseq()];
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
  return ['group', expr];
};

MetaParser.prototype.action = function() {
  this._opt(this._);
  this.identity('{');
  var block = this._star(
    function() {
      this._not(this.identity, '}');
      return this.char();
    }
  ).join('');
  this.identity('}');
  return block;
};

exports.MetaParser = MetaParser;


