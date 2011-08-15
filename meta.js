var ParseError = require('./parse_error.js').ParseError;

var Meta = function(input) {
  this.input = input;
  this.index = 0;
};

Meta.prototype = {
  _or: function() {
    
  },
  
  _not: function(rule) {
    var index = this.index;
    var args = Array.prototype.slice.call(arguments, 1);
    var result;
    try{
      result = rule.apply(this, args);
    } catch(e) {
      if(e instanceof ParseError){
        this.index = index;
        return result;
      }
      throw e;
    }
    this.index = index;
    throw new ParseError(this.index + ': expected to not match rule: ' + rule);
  },
  
  _star: function(rule) {
    var ans = [];
    while(true){
      try{
        var index = this.index;
        ans.push(rule.call(this));
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
  
  _plus: function(rule) {
    var required = rule.call(this);
    var optional = this._star(rule);
    optional.unshift(required);
    return optional;
  },
  
  any: function() {
    if(this.index >= this.input.length){
      throw new ParseError(this.index + ': unexpected end of input');
    }
    return this.input[this.index++];
  },
  
  spaces: function() {
    this._plus(this.space);
  },
  
  space: function() {
    var any = this.any();
    if(/^[\s\n]$/.test(any)){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected space, got: ' + any);
  },
  
  char: function() {
    var any = this.any();
    if(typeof(any) == 'string' && any.length == 1){
      return any;
    }
    this.index--;
    throw new ParseError(this.index + ': expected char, got: ' + any);
  },
  
  letter: function() {
    var chr = this.char();
    if(/\w/.test(chr)){
      console.log(chr);
      return chr;
    }
    this.index--;
    throw new ParseError(this.index + ': expected letter, got: ' + chr);
  },
  
  digit: function() {
    
  },
  
  string: function() {
    var string = '';
    var index = this.index;
    var openQuote = this.any();
    if(openQuote != '\''){
      this.index = index;
      throw new ParseError(this.index + ': expected open quote, got: ' + openQuote);
    }
    var closeQuote = this.any();
    while(closeQuote != openQuote){
      string += closeQuote;
      closeQuote = this.any();
    }
    return string;
  },
  
  token: function() {
    console.log('token')
    this._star(this.space);
    return this._plus(this.letter).join('');
  },
  
  seq: function(seq) {
    var self = this;
    seq.forEach(function(item) {
      self.identity(item);
    });
    return seq;
  },
  
  identity: function(item) {
    var any = this.any();
    if(any === item){
      return true;
    }
    throw new ParseError(this.index + ': expected ' + any + ' to be identical to : ' + item);
  },
  
  _apply: function(rule){
    
  },
};

exports.Meta = Meta;
  // 
  // 
  // _pred: function(pred) {
  //   if(pred){
  //     return true;
  //   }
  //   throw new ParseError(this.index + ': expected predicate to be true, got: ' + pred);
  // },