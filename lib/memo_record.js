var MemoRecord = function(input) {
  this.input = input;
  this.memos = {};
};

MemoRecord.prototype.get = function(name, args) {
//  return false;
  if(args.length == 0){
    var memo = this.memos[name];
//    console.log('get', name, memo && memo.result)
    return memo;
  }
};

MemoRecord.prototype.save = function(name, args, result, index) {
  if(args.length == 0){
//    console.log('saving', name, result, index);
    this.memos[name] = {result: result, index: index};
  }
};

exports.MemoRecord = MemoRecord;
