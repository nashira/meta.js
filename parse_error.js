var inherits = require('util').inherits;

var ParseError = function(message) {
  Error.apply(this, arguments);
  this.message =  message;
  this.name = "ParseError";
  Error.captureStackTrace(this, ParseError);
}

inherits(ParseError, Error);


exports.ParseError = ParseError;