var repl = require('repl');
var context = repl.start('>').context;

context.ParseError = require('./parse_error.js').ParseError;
context.Meta = require('./meta.js').Meta;
context.meta = new context.Meta('this is a sample');