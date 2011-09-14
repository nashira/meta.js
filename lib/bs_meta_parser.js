var Meta = require('./BSMetaParser.js').Meta,
inherits = require('util').inherits;

var BSMetaParser = function(input) {
  Meta.call(this, input);
};
inherits(BSMetaParser, Meta);

BSMetaParser.prototype.grammar = function anonymous() {
  var n,
  rs;
  return (function() {
    this._seq((function() {
      return this.token("meta");
    }), this._, (function() {
      return n = this.name();
    }), (function() {
      return this._opt(this._);
    }), (function() {
      return this.identity("{");
    }), (function() {
      return rs = this._plus(this.rule);
    }), (function() {
      return this._opt(this._);
    }), (function() {
      return this.identity("}");
    }));
    return {
      name: n,
      rules: rs
    }
  }).call(this)
};

BSMetaParser.prototype.rule = function anonymous() {
  var n,
  e;
  return (function() {
    this._seq((function() {
      return this._opt(this._);
    }), (function() {
      return n = this.name();
    }), this._, (function() {
      return this.identity("=");
    }), this._, (function() {
      return e = this.expression();
    }), (function() {
      return this.identity(",");
    }));
    return {
      name: n,
      expr: e
    }
  }).call(this)
};

BSMetaParser.prototype.name = function anonymous() {
  var f,
  r;
  return (function() {
    return this._or((function() {
      return this.identity("_");
    }), (function() {
      this._seq((function() {
        return f = this.letter();
      }), (function() {
        return r = this._star((function() {
          return this._or(this.letter, this.digit);
        }));
      }));
      return [f].concat(r).join('')
    }));
  }).call(this)
};

BSMetaParser.prototype.expression = function anonymous() {
  return this.choice.call(this)
};

BSMetaParser.prototype.choice = function anonymous() {
  var f, s, r;
  return (function() {
    this._seq((function() {
      return f = this.sequence();
    }), (function() {
      return r = this._star((function() {
        this._seq(this._, (function() {
          return this.identity("|");
        }), (function() {
          return s = this.sequence();
        }));
        return s
      }));
    }));
    return r.length ? {
      name: 'choice',
      exprs: [f].concat(r)
    }: f
  }).call(this)
};

BSMetaParser.prototype.sequence = function anonymous() {
  var l,
  a;
  return (function() {
    this._seq((function() {
      return l = this._plus(this.labeled);
    }), (function() {
      return a = this._opt(this.action);
    }));
    return l.length > 1 ? {
      name: 'sequence',
      exprs: l,
      action: a
    }: ((l[0].action = a) || true) && l[0]
  }).call(this)
};

BSMetaParser.prototype.labeled = function anonymous() {
  var p,
  n,
  l;
  return (function() {
    this._seq((function() {
      return this._opt(this._);
    }), (function() {
      return l = this._or((function() {
        this._seq((function() {
          return p = this.prefixed();
        }), (function() {
          return this.identity(":");
        }), (function() {
          return n = this.name();
        }));
        return (p.label = n) && p
      }), (function() {
        p = this.prefixed();
        return p
      }));
    }));
    return l
  }).call(this)
};

BSMetaParser.prototype.prefixed = function anonymous() {
  var s;
  return (function() {
    return this._or((function() {
      this._seq((function() {
        return this.identity("&");
      }), (function() {
        return s = this.suffixed();
      }));
      return {
        name: 'lookahead',
        expr: s
      }
    }), (function() {
      this._seq((function() {
        return this.identity("~");
      }), (function() {
        return s = this.suffixed();
      }));
      return {
        name: 'not',
        expr: s
      }
    }), (function() {
      s = this.suffixed();
      return s
    }));
  }).call(this)
};

BSMetaParser.prototype.suffixed = function anonymous() {
  var p;
  return (function() {
    return this._or((function() {
      this._seq((function() {
        return p = this.primary();
      }), (function() {
        return this.identity("?");
      }));
      return {
        name: 'optional',
        expr: p
      }
    }), (function() {
      this._seq((function() {
        return p = this.primary();
      }), (function() {
        return this.identity("+");
      }));
      return {
        name: 'plus',
        expr: p
      }
    }), (function() {
      this._seq((function() {
        return p = this.primary();
      }), (function() {
        return this.identity("*");
      }));
      return {
        name: 'star',
        expr: p
      }
    }), (function() {
      p = this.primary();
      return p
    }));
  }).call(this)
};

BSMetaParser.prototype.primary = function anonymous() {
  var n,
  l,
  g;
  return (function() {
    return this._or((function() {
      n = this.name();
      return {
        name: 'call',
        val: n
      }
    }), (function() {
      l = this.literal();
      return {
        name: 'literal',
        val: l
      }
    }), (function() {
      l = this.litseq();
      return {
        name: 'litseq',
        val: l
      }
    }), (function() {
      g = this.group();
      return g
    }));
  }).call(this)
};

BSMetaParser.prototype.group = function anonymous() {
  var e;
  return (function() {
    this._seq((function() {
      return this.identity("(");
    }), (function() {
      return this._opt(this._);
    }), (function() {
      return e = this.expression();
    }), (function() {
      return this._opt(this._);
    }), (function() {
      return this.identity(")");
    }));
    return e
  }).call(this)
};

BSMetaParser.prototype.action = function anonymous() {
  var c,
  a;
  return (function() {
    this._seq((function() {
      return this._opt(this._);
    }), (function() {
      return this.token("->");
    }), (function() {
      return a = this._star((function() {
        this._seq((function() {
          return this._not((function() {
            return this.token("<-");
          }));
        }), (function() {
          return c = this.char();
        }));
        return c
      }));
    }), (function() {
      return this.token("<-");
    }));
    return a.join('')
  }).call(this)
};

exports.BSMetaParser = BSMetaParser;
