'use strict'

var SampleContract = function() {
  LocalContractStorage.defineMapProperty(this, 'arrayMap')
  LocalContractStorage.defineMapProperty(this, 'dataMap')
  LocalContractStorage.defineProperty(this, 'size')
}

SampleContract.prototype = {
  init: function() {
    this.size = 0
  },
  set: function(value) {
    let from = Blockchain.transaction.from
    var index = this.size
    this.arrayMap.set(index, from)
    this.dataMap.set(from, value)
    this.size += 1
    return 'OK ' + this.size
  },
  get: function() {
    let from = Blockchain.transaction.from
    return this.dataMap.get(from)
  },
  update(value) {
    let from = Blockchain.transaction.from
    let item = this.dataMap.get(from)
    if (!item) {
      throw new Error('item not found')
    }
    this.dataMap.set(from, value)
    return 'OK ' + this.size
  },
  len: function() {
    return this.size
  },
  getAll: function(limit, offset) {
    let from = Blockchain.transaction.from
    if (from != 'n1VbPmrmuqCnK5tfFY7k7jKiH1oP4hHjHsw') {
      throw new Error('你没有权限')
      return false
    }
    limit = parseInt(limit)
    offset = parseInt(offset)
    if (offset > this.size) {
      throw new Error('offset is not valid')
    }
    var number = offset + limit
    if (number > this.size) {
      number = this.size
    }
    var result = []
    for (var i = offset; i < number; i++) {
      var key = this.arrayMap.get(i)
      var object = this.dataMap.get(key)
      result[i] = object
    }
    return result
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

module.exports = SampleContract
