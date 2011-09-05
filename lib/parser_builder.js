var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var ParserBuilder = function() {
};

ParserBuilder.prototype.build = function(ast) {
  var parser = function(input) {
    Meta.call(this, input);
  };
  inherits(parser, Meta);
  
  var rules = ast[1];
  
  // rules.forEach(function(rule) {
  //   parser.prototype[rule[0]] = function() {
  //     console.log(rule[0], rule[1]);
  //   };
  // });
  
  // new Function();
  var self = this;
  rules.forEach(function(rule) {
    var body = self.processRule(rule[1]);
    parser.prototype[rule[0]] = new Function(body);
  });
  
  return parser;
};

ParserBuilder.prototype.processRule = function(rule) {
  var body = rule;
  var self = this;
  
  if(rule instanceof Array){
  
    switch(rule[0]){
      case 'choice':
        var ors = rule[1].map(function(r) {
          return self.processRule(r);
        });
        // console.log('choice', ors)
        body = 'this._or(' + ors.join(', ') + ')';
      break;
      case 'sequence':
        var seqs = rule[1].map(function(r) {
          return self.processRule(r) + '()';
        });
        // console.log('sequence', seqs)
        body = 'function() {' + seqs.join(';\n') + '}';
      break;
      case 'name':
        body =  'this.' + rule[1];
        // console.log('name', rule[1])
      break;
      case 'literal':
        body =  "(function() {this.literal('" + rule[1] + "')})";
        // console.log('literal', rule[1])
      break;
      case 'star':
        body = 'this._star(' + this.processRule(rule[1]) + ')';
      break;
      case 'plus':
        body = 'this._plus(' + this.processRule(rule[1]) + ')';
      break;
      case 'optional':
        body = 'this._opt(' + this.processRule(rule[1]) + ')';
      break;
      case 'group':
        body = 'function(){' + this.processRule(rule[1]).join(', ') + '}';
      break;
      case 'action':
        body = 'TODO::action'
      break;
    } 
  }
  
  return body;
};



module.exports = new ParserBuilder();