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
//    var body = '';
//    if(self.locals.length){
//      body =  'var ' + self.locals.join(',') + ';\n';
//    }
//    body += 'var _result = ' + result[0] + '(' + result.slice(1).join(',') + ');\n';
//    body += 'return _result;'
    var call = self.createClosure(rule.expr.call)
    console.log('&&&', call, '&&&');
    parser.prototype[rule.name] = new Function('var _r,' + Object.keys(self.locals).join(',') + '; return ' + rule.expr.call + '.call(this)');
  });
  
  return parser;
};

ParserBuilder.prototype.processRule = function(rule) {
  var self = this;
  var body;
//  console.log(rule)
  
  switch(rule.name){
    case 'action':
      this.processRule(rule.expr);
      rule.call = this.createClosure(rule.expr.call, [], null, rule.action);
    break;
    case 'labeled':
      this.locals[rule.label] = true;
      this.processRule(rule.expr);
      rule.call = this.createClosure(rule.expr.call, [], rule.label);
    break;
    case 'call':
      rule.call = 'this.' + rule.val;
    break;
    case 'literal':
      rule.call = this.createClosure('this.identity', ['"'+rule.val+'"']);
    break;
    case 'plus':
      this.processRule(rule.expr);
      rule.call = this.createClosure('this._plus', [rule.expr.call]);
    break;
    case 'sequence':
      var seq = [];
      rule.exprs.forEach(function(expr) {
        self.processRule(expr);
        seq.push(expr.call);
      });
      rule.call = this.createClosure('this._seq', seq);
    break;
    case 'choice':
      var seq = [];
      rule.exprs.forEach(function(expr) {
        self.processRule(expr);
        seq.push(expr.call);
      });
      rule.call = this.createClosure('this._or', seq);
    break;
    default:
      throw new Error('rule name not found: ' + rule.name);
      
    
  }
};

ParserBuilder.prototype.createClosure = function(call, args, label, action) {
  var args = args || [];
  args.unshift('this');
  var label = label || '_r';
  var action  = 'return ' + (action || label);
  var closure = '(function() { ' + label + ' = ' + call + '.call(' + args.join(',') + ');\n ' + action + '})';
  return closure;
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



//    case 'choice':
//      var exprs = rule.exprs.map(function(expr) {
//        return self.processRule(expr);
//      });
//      return {call: 'this._or', args: [exprs]};
//    break;
//    case 'sequence':
//      rule.exprs.each(function(expr) {
//        self.processRule(expr);
//      });
//      
//      return {call: 'this._seq', args: [exprs]};
//    break;
//    case 'literal':
//      return {call: 'this.identity', args: [rule.val]};
//    break;
//    case 'litseq':
//      return {call: 'this.token', args: [rule.val]};
//    break;
//    case 'not':
//      return {call: 'this._not', args: [this.processRule(rule.expr)]};
//    break;
//    case 'star':
//      return {call: 'this._star', args: [this.processRule(rule.expr)]};
//    break;
//    case 'optional':
//      return {call: 'this._opt', expr: rule.expr};
//    break;











//ParserBuilder.prototype.processRule = function(rule) {
//  var body;
//  var self = this;
//  
//  switch(rule[0]){
//    case 'action':
//      console.log(rule[1])
//      var expr = this.processRule(rule[1]);
//      console.log(expr);
//      body = expr;
//    break;
//    case 'labeled':
//      var result = this.processRule(rule[1][1]);
////      this.locals.push(rule[1][0][1]);
////      var closure;
////      if(result){
////        result = rule[1][0][1] + ' = ' + result[0] + '(' + result.slice(1).join(',') + ')'
////      }
////      result.push();
//      body = [result, rule[1][0][1]];
//    break;
//    case 'choice':
//      var ors = rule[1].map(function(r) {
//        return self.createClosure(self.processRule(r));
//      });
//      body = ['this._or'].concat(ors);
//    break;
//    case 'sequence':
//      var seqs = rule[1].map(function(r) {
//        return self.createClosure(self.processRule(r));
//      });
//      body = ['this._seq'].concat(seqs);
//    break;
//    case 'name':
//      body =  ['this.' + rule[1]];
//    break;
//    case 'literal':
//      body =  ['this.identity', '\''+rule[1]+'\''];
//    break;
//    case 'litseq':
//      body =  ['this.token', '\''+rule[1]+'\''];
//    break;
//    case 'not':
//      body = ['this._not'].concat(this.processRule(rule[1]));
//    break;
//    case 'star':
//      body = ['this._star'].concat(this.processRule(rule[1]));
//    break;
//    case 'plus':
//      body = ['this._plus'].concat(this.processRule(rule[1]));
//    break;
//    case 'optional':
//      body = ['this._opt'].concat(this.processRule(rule[1]));
//    break;
//    case 'group':
//      body = this.processRule(rule[1]);
//    break;
//    default:
//      throw new Error('rule name not found: ' + rule[0]);
//  }

//  return body;
//};
