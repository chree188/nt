'use strict'

var TimeCapsule = function () {
  LocalContractStorage.defineMapProperty(this, 'timeCapsule', {
    parse: function (text) {
      if (!text) return []
      return JSON.parse(text)
    },
    stringify: function (o) {
      return JSON.stringify(o)
    }
  })
}
TimeCapsule.prototype = {
  init () {
  // todo
  },
  save (title, content) {
    if (title === '' || title === ''){
      throw new Error('empty title / content')
    }
    // 用户来源的地址
    var from = Blockchain.transaction.from
    // 当前时间
    var timestamp = Blockchain.transaction.timestamp
    var arr = this.timeCapsule.get(from) || []
    arr.push({
      title,
      content,
      timestamp
    })
    this.timeCapsule.put(from, arr)
  },
  query () {
    var from = Blockchain.transaction.from
    return this.timeCapsule.get(from)
  },
  find (key) {
    return this.timeCapsule.get(key)
  }
}

module.exports = TimeCapsule
