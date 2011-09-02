var MemoRecord = function(input) {
  this.input = input;
  this.memos = {};
};

MemoRecord.prototype.get = function(name, args) {
//  return false;
  var memo;
  if(args.length == 0){
    memo = this.memos[name];
//    console.log('get', name, memo && memo.result)
  }
  return memo;
};

MemoRecord.prototype.save = function(name, args, result, index) {
//    console.log('saving', name, result, index);
  if(args.length > 0) return {result: result, index: index};
  
  this.memos[name] = {result: result, index: index};
  return this.memos[name]
};

exports.MemoRecord = MemoRecord;
