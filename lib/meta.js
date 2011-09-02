var ParseError = require('./parse_error.js').ParseError,
    MemoRecord = require('./memo_record.js').MemoRecord,
    LeftRecursion = require('./left_recursion.js').LeftRecursion,
    slice = Array.prototype.slice;

var Meta = function(input) {
  input = (typeof(input) == 'string') ? input.split('') : input;
  this.input = input;
  this.index = 0;
  this.length = input.length;
  Meta._attachApply(this);
};

Meta.prototype = {
  _seq: function () {
    var self = this;
    var results = [];
    var seq = slice.call(arguments, 0);
    seq.forEach(function(rule) {
      results.push(rule.call(self));
    });
    return results;
  },
  
  _or: function () {
    for(var i = 0; i < arguments.length; i++){
      var rule = arguments[i];
      if(this._lookahead(rule)) {
        return rule.call(this);
      }
    }
    var rules = Array.prototype.map.call(arguments, function(rule) {return rule._name || rule.name});
    throw new ParseError(this.index + ': expected to match one of: "' + rules.join() + '"');
  },
  
  _lookahead: function (rule) {
    var index = this.index;
    var args = slice.call(arguments, 1);
    try {
      rule.apply(this, args);
      this.index = index;
      return true;
    } catch(e) {
      if(e instanceof ParseError){
        this.index = index;
        return false;
      }
      throw e;
    }
  },
  
  _not: function (rule) {
    if(this._lookahead.apply(this, arguments)){
      throw new ParseError(this.index + ': expected to not match rule: "' + (rule._name || rule.name) + '"');
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
    while(true){
      try{
        var index = this.index;
        ans.push(rule.apply(this, args));
      } catch(e) {
        if(!(e instanceof ParseError)){
          throw e;
        }
        this.index = index;
        break;
      }
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
  
  any: function () {
    if(this.index >= this.length){
      throw new ParseError(this.index + ': unexpected end of input');
    }
    var any = this.input[this.index].input;
    this.index++;
    return any;
  },
  
  spaces: function () {
    return this._plus(this.space);
  },
  
  space: function () {
    var any = this.any();
    if(/^[\s\n]$/.test(any)){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected space, got: "' + any + '"');
  },
  
  char: function () {
    var any = this.string();
    if(any.length == 1){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected char, got: "' + any + '"');
  },
  
  letter: function () {
    var chr = this.char();
    if(/[a-z]/i.test(chr)){
      return chr;
    }
    this.index--;
    throw new ParseError(this.index + ': expected letter, got: "' + chr + '"');
  },
  
  digit: function () {
    
  },
  
  literal: function() {
    this._star(this.space);
    var literal = '';
    var index = this.index;
    var openQuote = this.any();
    if(openQuote != "'"){
      this.index = index;
      throw new ParseError(this.index + ': expected open quote, got: "' + openQuote + '"');
    }
    var closeQuote = this.any();
    while(closeQuote != openQuote){
      if(closeQuote == '\\' && this._lookahead(this.identity, "'")){
        closeQuote = this.any();
      }
      literal += closeQuote;
      closeQuote = this.any();
    }
    return literal;
  },
  
  string: function () {
    var any = this.any();
    if(typeof(any) == 'string'){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected string, got: "' + any + '"');
  },
  
  token: function () {
    this._star(this.space);
    return this._plus(this.letter).join('');
  },
  
  identity: function (item) {
    var any = this.any();
    if(any === item){
      return any;
    }
    this.index --;
    throw new ParseError(this.index + ': expected "' + any + '" to be identical to : "' + item + '"');
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
  }
};

Meta._apply = function (name, rule){
  var index = this.index;
  var input = this.input[index];
  var args = slice.call(arguments, 2);
  
  if(!(input instanceof MemoRecord)){
    this.input[index] = input = new MemoRecord(input);
  }
  
  var record = input.get(name, args)
  
  if(record){
    if(record.result instanceof LeftRecursion){
      record.result.detected = true;
      console.log('left recursion detected', record.result)
      throw new ParseError('left recursion detected');
    } else if(record.result instanceof Error){
      throw record.result;
    }
    
    this.index = record.index;
    return record.result;
  } else {
    var leftRecursion = new LeftRecursion();
    input.save(name, args, leftRecursion, this.index);
    try {
      var result = rule.apply(this, args);
      console.log('record', result);
      
      input.save(name, args, result, this.index);
      if(leftRecursion.detected){
        console.log('*************', result);
        while(true){
          try {
            
          } catch(e) {
            if(!(e instanceof ParseError)){
              throw e;
            }
            break;
          }
        }
      }
      
      return result;
    } catch(e) {
      input.save(name, args, e, this.index);
      throw e;
    }
  }
};

exports.Meta = Meta;
