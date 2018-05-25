'use strict'
var VoteContract = function() {
  
LocalContractStorage.set("up",5);
}
VoteContract.prototype = {
  init: function() {
  },
  voteUp: function() {
    var up = LocalContractStorage.get("up") + 1;  
    LocalContractStorage.set("up",up);
    return LocalContractStorage.get("up");
  },
  voteDown: function(type) {

    this.down = this.down + 1
    return this.down
  },
  /**
   * 获取历史投票信息
   */
  getVote: function() {
    return this.up + '-' + this.down
  }
}

module.exports = VoteContract