var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var ParserBuilder = function() {
};

ParserBuilder.prototype.build = function(ast) {
  var parser = function(input) {
    Meta.call(this, input);
  };
  inherits(parser, Meta);
  parser.prototype._name = ast[0];
  var rules = ast[1];
  
  var self = this;
  rules.forEach(function(rule) {
    var body = self.processRule(rule[1]);
    
    body = 'return ' + body[0] + '(' + body.slice(1).join(',') + ');'
    
    parser.prototype[rule[0]] = new Function(body);
  });
  
  return parser;
};

ParserBuilder.prototype.processRule = function(rule) {
  var body;
  var self = this;
  
  switch(rule[0]){
    case 'choice':
      var ors = rule[1].map(function(r) {
        return self.createClosure(self.processRule(r));
      });
      body = ['this._or'].concat(ors);
    break;
    case 'sequence':
      var seqs = rule[1].map(function(r) {
        return self.createClosure(self.processRule(r));
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
    case 'litseq':
      body =  ['this.token', '\''+rule[1]+'\''];
      // console.log('literal', rule[1])
    break;
    case 'not':
      body = ['this._not'].concat(this.processRule(rule[1]));
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
    default:
      throw new Error('rule name not found: ' + rule[0]);
  }

  return body;
};

ParserBuilder.prototype.createClosure = function(args) {
  if(args && args.length > 1){
    var closure = args[0] + '(' + args.slice(1).join(',') + ')'
    args = 'function() { return ' + closure + ';}';
  }
  return args;
};

ParserBuilder.prototype.stringify = function(proto) {
  var name = proto._name;
  var s = 
'var Meta = require(\'./meta.js\').Meta,\n'+
'    inherits = require(\'util\').inherits;\n\n'+
'var '+name+' = function(input) {\n'+
'  Meta.call(this, input);\n'+
'};\n'+
'inherits('+name+', Meta);\n\n';
  
  for(var k in proto) {
    if(proto.hasOwnProperty(k) && typeof(proto[k]) == 'function'){
      s += name + '.prototype.' + k + ' = ' + proto[k].toString() + ';\n\n';
    }
  }
  s += 'exports.' + name + ' = ' + name + ';'
  return s;
};


module.exports = new ParserBuilder();