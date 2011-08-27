var repl = require('repl'),
    context = repl.start('>').context,
    fs = require('fs');

var metaGrammar = context.metaGrammar = fs.readFileSync('./lang/meta.meta').toString();
var ParseError  = context.ParseError = require('./lib/parse_error.js').ParseError;
var Meta        = context.Meta = require('./lib/meta.js').Meta;
var MetaParser  = context.MetaParser = require('./lib/meta_parser.js').MetaParser;

verb(MetaParser.prototype);
context.mp = new MetaParser(metaGrammar);

context.mp.grammar();

//verb(Meta.prototype);

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
