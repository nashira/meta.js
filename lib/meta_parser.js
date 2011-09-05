var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var MetaParser = function(input) {
  Meta.call(this, input);
};
inherits(MetaParser, Meta);

MetaParser.prototype.grammar = function() {
  var results = [
    this.token('meta'),
    this._(),
    this.name()[1],
    this._opt(this._),
    this.identity('{'),
    this._plus(this.rule),
    this._opt(this._),
    this.identity('}')
  ];
  return ['grammar', results];
};

MetaParser.prototype.rule = function() {
  var results = [
    this._opt(this._),
    this.name()[1],
    this._(),
    this.identity('='),
    this._(),
    this.expression(),
    this.identity(',')
  ];
  return ['rule', results];
};

MetaParser.prototype.name = function() {
  var results = [this._or(
    function() {
      return this.identity('_');
    },
    function() {
      return [this.letter()].concat(this._star(this._or, this.letter, this.digit)).join('');
    }
  )];
  return ['name', results];
};

MetaParser.prototype.expression = function() {
  var results = [
    this.choice()
  ];
  return ['expression', results];
};

MetaParser.prototype.choice = function() {
  var results = [
    this.sequence(),
    this._star(function() {
      this._();
      this.identity('|');
      return this.sequence();
    })
  ];
  
  return ['choice', results];
};

MetaParser.prototype.sequence = function() {
  var results = [
    this._plus(this.labeled),
    this._opt(this.action)
  ];
  
  return ['sequence', results];
};

MetaParser.prototype.labeled = function() {
  var results = [
    this._opt(this._),
    this._or(
      function() {
        var results = [
          this.prefixed(),
          this.identity(':'),
          this.name()
        ];
        return ['labeled', results];
      },
      this.prefixed
    )
  ];
  return ['labeled', results];
};

MetaParser.prototype.prefixed = function() {
  var results = [
    this._or(
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
    )
  ];
  return ['prefixed', results];
};

MetaParser.prototype.suffixed = function() {
  var results = [
    this._or(
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
    )
  ];
  
  return ['suffixed', results];
};

MetaParser.prototype.primary = function() {
  var results = [
    this._or(
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
    )
  ];
  return ['primary', results];
};

MetaParser.prototype.group = function() {
  var results = [
    this.identity('('),
    this._opt(this._),
    this.expression(),
    this._opt(this._),
    this.identity(')'),
  ];
  return ['group', results];
};

MetaParser.prototype.action = function() {
  var results = [
    this._opt(this._),
    this.identity('{'),
    this._star(
      function() {
        this._not(this.identity, '}');
        return this.char();
      }
    ),
    this.identity('}')
  ];
  return ['action', results];
};

exports.MetaParser = MetaParser;


