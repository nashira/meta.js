var Meta = require('./meta.js').Meta,
    inherits = require('util').inherits;

var ParserBuilder = function() {
};

ParserBuilder.prototype.build = function(grammar) {
  var parser = function(input) {
    Meta.call(this, input);
  };
  inherits(parser, Meta);
  parser.prototype._name = grammar.name;
  
  
  var self = this;
  grammar.rules.forEach(function(rule) {
    self.locals = {};
    self.processRule(rule.expr);
    // var call = self.createClosure(rule.expr.call)
    // console.log('&&&', 'var ' + Object.keys(self.locals).join(',') + '; return ' + rule.expr.call + '.call(this)', '&&&');
    var locs = Object.keys(self.locals)
    var locals = locs.length ? ('var ' + locs.join(',') + ';\n') : '';
    parser.prototype[rule.name] = new Function(locals + ' return ' + rule.expr.call + '.call(this)');
  });
  
  return parser;
};

ParserBuilder.prototype.processRule = function(rule) {
  var self = this;
  var body;
//  console.log(rule)
  
  switch(rule.name){
    case 'call':
      rule.call = this.createClosure('this.' + rule.val, null, rule.label, rule.action);
    break;
    case 'literal':
      rule.call = this.createClosure('this.identity', ['"'+rule.val+'"'], rule.label, rule.action);
    break;
    case 'litseq':
      rule.call = this.createClosure('this.token', ['"'+rule.val+'"'], rule.label, rule.action);
    break;
    case 'plus':
      this.processRule(rule.expr);
      rule.call = this.createClosure('this._plus', [rule.expr.call], rule.label, rule.action);
    break;
    case 'star':
      this.processRule(rule.expr);
      rule.call = this.createClosure('this._star', [rule.expr.call], rule.label, rule.action);
    break;
    case 'not':
      this.processRule(rule.expr);
      rule.call = this.createClosure('this._not', [rule.expr.call], rule.label, rule.action);
    break;
    case 'optional':
      this.processRule(rule.expr);
      rule.call = this.createClosure('this._opt', [rule.expr.call], rule.label, rule.action);
    break;
    case 'lookahead':
      this.processRule(rule.expr);
      rule.call = this.createClosure('this._lookahead', [rule.expr.call], rule.label, rule.action);
    break;
    case 'sequence':
      var seq = [];
      rule.exprs.forEach(function(expr) {
        self.processRule(expr);
        seq.push(expr.call);
      });
      rule.call = this.createClosure('this._seq', seq, rule.label, rule.action);
    break;
    case 'choice':
      var seq = [];
      rule.exprs.forEach(function(expr) {
        self.processRule(expr);
        seq.push(expr.call);
      });
      rule.call = this.createClosure('this._or', seq, rule.label, rule.action);
    break;
    default:
      throw new Error('rule name not found: ' + rule.name);
  }
};

ParserBuilder.prototype.createClosure = function(call, args, label, action) {
  if(label)
    this.locals[label] = true;
    
  if(label && action){
    return closure = '(function() { ' + label + ' = ' + call + '(' + (args||[]).join(',') + ');\n return ' + action + '})';
  } else if(label){
    return closure = '(function() { return ' + label + ' = ' + call + '(' + (args||[]).join(',') + ');})';
  } else if(action) {
    return closure = '(function() { ' + call + '(' + (args||[]).join(',') + ');\n return ' + action + '})';
  } else {
    if(!args)
      return call;
    return '(function() { return ' + call + '(' + args.join(',') + '); })'
  }
};

ParserBuilder.prototype.stringify = function(proto) {
  var name = proto._name;
  var s = 
'var Meta = require(\'meta.js\').Meta,\n'+
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
