var ParseError = require('./parse_error.js').ParseError,
    MemoRecord = require('./memo_record.js').MemoRecord,
    LeftRecursion = require('./left_recursion.js').LeftRecursion,
    slice = Array.prototype.slice,
    map = Array.prototype.map;

var Meta = function(input) {
  input = (typeof(input) == 'string') ? input.split('') : input;
  this._input = input;
  this._index = 0;
  this._length = input.length;
  Meta._attachApply(this);
};

Meta.prototype = {
  _seq: function () {
    var self = this;
    return map.call(arguments, function(rule) {
      return rule.call(self);
    });
  },
  
  _or: function () {
    for(var i = 0; i < arguments.length; i++){
      var rule = arguments[i];
      if(this._lookahead(rule)) {
        return rule.call(this);
      }
    }
    var rules = map.call(arguments, function(rule) {return rule._name || rule.name});
    throw new ParseError(this._index + ': expected to match one of: "' + rules.join() + '"');
  },
  
  _lookahead: function (rule) {
    var index = this._index;
    var args = slice.call(arguments, 1);
    try {
      rule.apply(this, args);
      this._index = index;
      return true;
    } catch(e) {
      if(e instanceof ParseError){
        this._index = index;
        return false;
      }
      throw e;
    }
  },
  
  _not: function (rule) {
    if(this._lookahead.apply(this, arguments)){
      throw new ParseError(this._index + ': expected to not match rule: "' + (rule._name || rule.name) + '"');
    }
    return true;
  },
  
  _opt: function(rule) {
    if(this._lookahead.apply(this, arguments)){
      var args = slice.call(arguments, 1);
      return rule.apply(this, args);
    }
  },
  
  _star: function (rule) {
    var ans = [];
    var args = slice.call(arguments, 1);
    while(this._lookahead.apply(this, arguments)){
      ans.push(rule.apply(this, args));
    }
    return ans;
  },
  
  _plus: function (rule) {
    var args = slice.call(arguments, 1);
    var required = rule.apply(this, args);
    var optional = this._star.apply(this, arguments);
    optional.unshift(required);
    return optional;
  },
  
  token: function (token) {
    for(var i in token){
      this.identity(token.charAt(i));
    }
    return token;
  },
  
  identity: function (item) {
    var any = this.any();
    if(any === item){
      return any;
    }
    this._index --;
    throw new ParseError(this._index + ': expected "' + any + '" to be identical to : "' + item + '"');
  },
  
  empty: function() {
  },
  
  any: function () {
    if(this._index >= this._length){
      throw new ParseError(this._index + ': unexpected end of input');
    }
    var any = this._input[this._index].input;
    this._index++;
    return any;
  },
  
  _: function () {
    return this._plus(this.space);
  },
  
  space: function () {
    var any = this.any();
    if(/^\s$/.test(any)){
      return any;
    }
    this._index--;
    throw new ParseError(this._index + ': expected space, got: "' + any + '"');
  },
  
  char: function () {
    var any = this.string();
    if(any.length == 1){
      return any;
    }
    this._index--;
    throw new ParseError(this._index + ': expected char, got: "' + any + '"');
  },
  
  letter: function () {
    var chr = this.char();
    if(/^[a-z]$/i.test(chr)){
      return chr;
    }
    this._index--;
    throw new ParseError(this._index + ': expected letter, got: "' + chr + '"');
  },
  
  digit: function () {
    var chr = this.char();
    if(/\d/.test(chr)){
      return chr;
    }
    this._index--;
    throw new ParseError(this._index + ': expected digit, got: "' + chr + '"');
  },
  
  literal: function() {
    var literal = '';
    var index = this._index;
    var openQuote = this.any();
    if(openQuote !== "'"){
      this._index = index;
      throw new ParseError(this._index + ': expected open quote, got: "' + openQuote + '"');
    }
    var closeQuote = this.char();
    while(closeQuote != openQuote){
      if(closeQuote == '\\' && this._lookahead(this.identity, "'")){
        closeQuote = this.char();
      }
      literal += closeQuote;
      closeQuote = this.char();
    }
    return literal;
  },
  
  litseq: function() {
    var litseq = '';
    var openQuote = this.any();
    if(openQuote !== '"'){
      this._index--;
      throw new ParseError(this._index + ': expected open quote, got: "' + openQuote + '"');
    }
    var closeQuote = this.char();
    while(closeQuote != openQuote){
      if(closeQuote == '\\' && this._lookahead(this.identity, '"')){
        closeQuote = this.char();
      }
      litseq += closeQuote;
      closeQuote = this.char();
    }
    return litseq;
  },
  
  string: function () {
    var any = this.any();
    if(typeof(any) == 'string'){
      return any;
    }
    this._index--;
    throw new ParseError(this._index + ': expected string, got: "' + any + '"');
  },
  
  array: function() {
    var any = this.any();
    if(any instanceof Array){
      return any;
    }
    this._index--;
    throw new ParseError(this._index + ': expected array, got: "' + any + '"');
  }
};


Meta._attachApply = function(obj) {
  for(var k in obj){
    if(typeof(obj[k]) == 'function'){
      attach(k, obj[k]);
    }
  }
  
  function attach(name, rule) {
    obj[name] = function() {
      var args = slice.call(arguments, 0);
      args.unshift(name, rule);
      return Meta._apply.apply(obj, args)
    };
    obj[name]._name = name;
    rule._name = name;
  }
};

Meta._apply = function (name, rule){
  var index = this._index;
  var input = this._input[index];
  var args = slice.call(arguments, 2);
  if(!(input instanceof MemoRecord)){
    this._input[index] = input = new MemoRecord(input);
  }
  var record = input.get(name, args)
  
  if(!record){
    var leftRecursion = new LeftRecursion();
    record = input.save(name, args, leftRecursion, this._index);
    try {
      var result = rule.apply(this, args);
      record = input.save(name, args, result, this._index);
      
      if(leftRecursion.detected){
        var sentinel = this._index;
        while(true){
          try {
            this._index = index;
            result = rule.apply(this, args);
            if(this._index == sentinel){
              break;
            }
            record = input.save(name, args, result, this._index);
          } catch(e) {
            if(!(e instanceof ParseError)){
              throw e;
            }
            break;
          }
        }
      }
      
    } catch(e) {
      if(e instanceof ParseError){
        input.save(name, args, e, this._index);
      }
      throw e;
    }
  } else {
    if(record.result instanceof LeftRecursion){
      record.result.detected = true;
      throw new ParseError('left recursion detected');
    }
    
    if(record.result instanceof ParseError){
      throw record.result;
    }
  }
  
  this._index = record.index;
  return record.result;
};

exports.Meta = Meta;

