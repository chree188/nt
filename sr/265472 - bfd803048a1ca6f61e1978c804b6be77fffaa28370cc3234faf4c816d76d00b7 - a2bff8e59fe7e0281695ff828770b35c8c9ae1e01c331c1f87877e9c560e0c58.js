'use strict'
var VoteContract = function() {
  LocalContractStorage.defineProperties(this, {
    up: null,
    down: null
  })
  // LocalContractStorage.defineMapProperty(this, 'userMap')
}
VoteContract.prototype = {
  init: function() {
    // 初始化
    this.up = 5
    this.down = 3
    // this.userMap.set("up", 5)
    // this.userMap.set('down', 3)
  },
  voteUp: function(type) {
    this.up = this.up + 1
    return this.up
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
  },
  withDraw: function(amount) {
    amount = parseInt(amount)
    var user = Blockchain.transaction.from
    //判断是否是指定的账户地址
    if (user == 'n1VbPmrmuqCnK5tfFY7k7jKiH1oP4hHjHsw') {
      var withDrawResult = Blockchain.transfer(user, amount)
      if (withDrawResult == true) {
        return true
      } else {
        throw new Error('提款失败')
      }
    } else {
      throw new Error('你没有权限')
    }
  }
}

module.exports = VoteContract
