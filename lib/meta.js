var ParseError = require('./parse_error.js').ParseError;
var slice = Array.prototype.slice;

var Meta = function(input) {
  this.input = input;
  this.index = 0;
};

Meta.prototype = {
  _or: function _or() {
    for(var i = 0; i < arguments.length; i++){
      var rule = arguments[i];
      if(this._lookahead(rule)) {
        return rule.call(this);
      }
    }
    var rules = Array.prototype.map.call(arguments, function(rule) {return rule.name});
    throw new ParseError(this.index + ': expected to match one of: "' + rules.join() + '"');
  },
  
  _lookahead: function _lookahead(rule) {
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
  
  _not: function _not(rule) {
    if(this._lookahead.apply(this, arguments)){
      throw new ParseError(this.index + ': expected to not match rule: "' + rule.name + '"');
    }
    return true;
  },
  
  _opt: function(rule) {
    if(this._lookahead.apply(this, arguments)){
      var args = slice.call(arguments, 1);
      return rule.apply(this, args);
    }
  },
  
  _star: function _star(rule) {
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
  
  _plus: function _plus(rule) {
    var args = slice.call(arguments, 1);
    var required = rule.apply(this, args);
    var optional = this._star.apply(this, arguments);
    optional.unshift(required);
    return optional;
  },
  
  any: function any() {
    if(this.index >= this.input.length){
      throw new ParseError(this.index + ': unexpected end of input');
    }
    return this.input[this.index++];
  },
  
  spaces: function spaces() {
    return this._plus(this.space);
  },
  
  space: function space() {
    var any = this.any();
    if(/^[\s\n]$/.test(any)){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected space, got: "' + any + '"');
  },
  
  char: function char() {
    var any = this.any();
    if(typeof(any) == 'string' && any.length == 1){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected char, got: "' + any + '"');
  },
  
  letter: function letter() {
    var chr = this.char();
    if(/[a-z]/i.test(chr)){
      return chr;
    }
    this.index--;
    throw new ParseError(this.index + ': expected letter, got: "' + chr + '"');
  },
  
  digit: function digit() {
    
  },
  
  string: function string() {
    var string = '';
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
      string += closeQuote;
      closeQuote = this.any();
    }
    return string;
  },
  
  token: function token() {
    this._star(this.space);
    return this._plus(this.letter).join('');
  },
  
  // seq: function seq(seq) {
  //   var self = this;
  //   seq.forEach(function(item) {
  //     self.identity(item);
  //   });
  //   return seq;
  // },
  
  identity: function identity(item) {
    var any = this.any();
    if(any === item){
      return any;
    }
    this.index --;
    throw new ParseError(this.index + ': expected "' + any + '" to be identical to : "' + item + '"');
  },
  
  _apply: function _apply(rule){
    
  },
};



exports.Meta = Meta;
  // 
  // 
  // _pred: function _pred(pred) {
  //   if(pred){
  //     return true;
  //   }
  //   throw new ParseError(this.index + ': expected predicate to be true, got: "' + pred + '"');
  // },
