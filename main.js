var repl = require('repl'),
    context = repl.start('>').context,
    fs = require('fs');

var metaGrammar = context.metaGrammar = fs.readFileSync('./lang/meta.meta').toString();
var ParseError  = context.ParseError = require('./lib/parse_error.js').ParseError;
var Meta        = context.Meta = require('./lib/meta.js').Meta;
var MetaParser  = context.MetaParser = require('./lib/meta_parser.js').MetaParser;

context.mp = new MetaParser(metaGrammar);