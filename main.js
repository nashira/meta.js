var repl = require('repl'),
    context = repl.start('>').context,
    // context = {},
    fs = require('fs'),
    util = require('util');

context.util = util;

var metaGrammar   = context.metaGrammar = fs.readFileSync('./lang/meta.meta').toString();
var testGrammar   = context.testGrammar = fs.readFileSync('./lang/test.meta').toString();
var ParseError    = context.ParseError = require('./lib/parse_error.js').ParseError;
var Meta          = context.Meta = require('./lib/meta.js').Meta;
var MetaParser    = context.MetaParser = require('./lib/meta_parser.js').MetaParser;
var MemoRecord    = context.MemoRecord = require('./lib/memo_record.js').MemoRecord;
var ParserBuilder = context.ParserBuilder = require('./lib/parser_builder.js');
var AST = context.AST = require('./lib/ast.js').AST;

//verb(MetaParser.prototype);
//verb(MemoRecord.prototype);
// context.mp = new MetaParser(metaGrammar);
context.mp = new MetaParser(testGrammar);

try {
  console.time('parse');
  context.t = context.mp.grammar();
  context.a = new AST(context.t);
  context.P = ParserBuilder.build(context.t);
  console.timeEnd('parse');
} catch(e) {
  console.error(e.stack);
  var index = parseInt(e.message);
  console.log(metaGrammar.substr(index-1, 20));
}

function verb(obj){
 var pad = '';
 for(var f in obj){
   if(typeof obj[f] == 'function'){
     (function(fun) {
       var old = obj[fun];
       obj[fun] = function() {
         pad += ' ';
         console.log(pad, fun, arguments);
         var ret;
         try{
           ret = old.apply(this, arguments);
         } catch(e) {
           console.log(pad, 'error', fun, ret);
           pad = pad.substr(1);
           throw e;
         }
         console.log(pad, fun, ret);
         pad = pad.substr(1);
         return ret;
       };
     })(f);
   }
 }
}
