/*
  only one record is saved per rule name, for rules that take args that means
  that calls to the same rule at the same position with different args will
  blow out the memo record for the previously saved call
*/

var MemoRecord = function() {
  this.memos = {};
};

MemoRecord.prototype.get = function(name, args) {
  var memo = this.memos[name];
  if(memo && args.length == memo.args.length) {
    for(var i = 0; i < memo.args.length; i++){
      if(memo.args[i] !== args[i]){
        return;
      }
    }
    return memo;
  }
  return;
};

MemoRecord.prototype.save = function(name, args, result, index) {
  this.memos[name] = {args: args, result: result, index: index};
  return this.memos[name]
};

exports.MemoRecord = MemoRecord;
