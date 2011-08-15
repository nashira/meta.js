var repl = require('repl'),
    context = repl.start('>').context,
    fs = require('fs');

var metaGrammar = context.metaGrammar = fs.readFileSync('./meta.meta');
var ParseError  = context.ParseError = require('./parse_error.js').ParseError;
var Meta        = context.Meta = require('./meta.js').Meta;
var MetaParser  = context.MetaParser = require('./meta_parser.js').MetaParser;

context.mp = new MetaParser(metaGrammar.toString());