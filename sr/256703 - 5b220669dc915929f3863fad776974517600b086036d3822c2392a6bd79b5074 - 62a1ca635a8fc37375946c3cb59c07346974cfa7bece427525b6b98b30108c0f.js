
var Bottle = function (text) {
  if (text) {
    var o = JSON.parse(text)
    this.id = o.messageId
    this.sender = o.sender
    this.nickname = o.nickname
    this.city = o.city
    this.content = o.content
  } else {
    this.id = 0
    this.sender = ''
    this.content = ''
    this.nickname = ''
    this.city = ''
  }
}

Bottle.prototype = {
  toString: function () {
    return JSON.stringify(this)
  }
}

var BottleContract = function () {
  LocalContractStorage.defineMapProperty(this, 'bottles', {
    parse: function (text) {
      return new Bottle(text)
    },
    stringify: function (o) {
      return o.toString()
    }
  })
 

  LocalContractStorage.defineProperties(this, {
    bottleCount: null,
    owner: null
  })
}

BottleContract.prototype = {
  /*
  合约初始化函数，在部署合约的时候填的参数就是被这里处理，只在合约
  创建时执行
  @param owner 合约所有者，用于后期执行withdraw鉴权
  */
  init: function (owner) {
    this.bottleCount = 0
    this.owner = owner
  },
/*
提款到指定账户
*/
  withdraw: function (amount) {
    if (Blockchain.transaction.from == this.owner) {
      var num = new BigNumber(amount)
      var result = Blockchain.transfer(Blockchain.transaction.from, num)
      return {'error': null, 'result': result}
    } else {
      return {'error': 'not owner', 'result': null}
    }
  },
  /*
  获取漂流瓶数量
  */
  getBottleCount: function () {
    return this.bottleCount
  },
  /*
  获取第n个漂流瓶
  */
  getBottle: function (index) {
    return this.messages.get(index)
  },
/*
批量获取漂流瓶
*/
  getBottles: function (offset, limit) {
    var bottlesArr = []

    if (offset > this.bottleCount) {
      return {
        'error': 'offset too big',
        'bottles': null
      }
    } else {
      if (limit + offset > this.bottleCount) {
        limit = this.bottleCount - offset
      }
      for (var i = offset; i < limit + offset; i++) {
        bottlesArr.push(this.bottles.get(i))
      }
      return { 'error': null,
        'bottles': bottlesArr }
    }
  },
/*添加漂流瓶*/
  addBottle: function (content,nickname,city) {
    var bottleId = this.bottleCount
    var bottleObj = new Bottle()
    bottleObj.id = bottleId
    bottleObj.sender = Blockchain.transaction.from
    bottleObj.content = content
    bottleObj.nickname = nickname
    bottleObj.city = city

    this.bottles.put(bottleId, bottleObj)
    this.bottleCount += 1
    return {'error': null,
      'bottle': bottleObj}
  },
/*调试*/
  
  debug: function () {
    var msgs = []
 
    for (var i = 1; i <= this.messageCount; i++) {
      msgs.push(this.messages.get(i))
      maps.push(this.commentMap.get(i))
    }
   
    return {'d': JSON.stringify(this),
      'msgs': JSON.stringify(msgs),
      'owner': this.owner
    }
  }

}

module.exports = BottleContract
