var ParseError = require('./parse_error.js').ParseError;

var Meta = function(input) {
  this.input = input;
  this.index = 0;
};

Meta.prototype = {
  _or: function() {
    
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
      throw new ParseError('unexpected end of input');
    }
    return this.input[this.index++];
  },
  
  space: function() {
    var any = this.any();
    if(/^\s$/.test(any)){
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
      return chr;
    }
    this.index--;
    throw new ParseError(this.index + ': expected letter, got: ' + chr);
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
    this._star(this.space);
    return this._plus(this.letter).join('');
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