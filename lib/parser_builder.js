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
  
  var self = this;
  rules.forEach(function(rule) {
    // console.log(rule);
    var body = self.processRule(rule[1]);
    body = 'return ' + body[0] + '(' + body.slice(1).join(',') + ');'
    // console.log(body);
    parser.prototype[rule[0]] = new Function(body);
    // parser.prototype[rule[0]] = body;
  });
  
  return parser;
};

ParserBuilder.prototype.processRule = function(rule) {
  var body;
  var self = this;
  
  switch(rule[0]){
    case 'choice':
      var ors = rule[1].map(function(r) {
        
        var result = self.processRule(r);
        if(result.length > 1){
          var closure = result[0] + '(' + result.slice(1).join(',') + ')'
          result = 'function() { return ' + closure + '}';
        }
        return result;
      });
      body = ['this._or'].concat(ors);
    break;
    case 'sequence':
      var seqs = rule[1].map(function(r) {
        var result = self.processRule(r);
        if(result.length > 1){
          var closure = result[0] + '(' + result.slice(1).join(',') + ')'
          result = 'function() { return ' + closure + '}';
        }
        return result;
      });
      body = ['this._seq'].concat(seqs);
    break;
    case 'name':
      body =  ['this.' + rule[1]];
      // console.log('name', rule[1])
    break;
    case 'literal':
      body =  ['this.identity', '\''+rule[1]+'\''];
      // console.log('literal', rule[1])
    break;
    case 'star':
      body = ['this._star'].concat(this.processRule(rule[1]));
    break;
    case 'plus':
      body = ['this._plus'].concat(this.processRule(rule[1]));
    break;
    case 'optional':
      body = ['this._opt'].concat(this.processRule(rule[1]));
    break;
    case 'group':
      body = this.processRule(rule[1]);
    break;
    case 'action':
      body = ['TODO::action'];
    break;
  }

  return body;
};



module.exports = new ParserBuilder();