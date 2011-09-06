var util = require('util');


var AST = function(tree) {
  this.tree = tree;
};

AST.prototype.removeEmpty = function() {
  
  removeEmpty(this.tree);
  function removeEmpty(tree) {
    for(var i in tree){
      if(tree[i] instanceof Array){
        return removeEmpty(tree[i]);
      } else {
        console.log(indent, tree[i]);
      }
    }
    
    if(tree[1] instanceof Array && tree[1].length == 1) {
      // tree[1] = tree[1][0];
      console.log(tree[1])
    } else if(tree[1].length > 1){
      removeEmpty(tree[1]);
    }
  };
};

AST.prototype.print = function() {
  var indent = '';
  
  print(this.tree);
  function print(tree) {
    indent += ' ';
    for(var i in tree){
      if(tree[i] instanceof Array){
        print(tree[i]);
      } else {
        console.log(indent, tree[i]);
      }
    }
    indent = indent.substr(1);
  };
};

exports.AST = AST;
