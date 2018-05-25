'use strict';

var LoveContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.sayer = o.sayer;
    this.say = o.say;
    this.pics = o.pics;
    this.timestamp = o.timestamp;
  } else {
    this.sayer = '';
    this.say = '';
    this.pics = '';
    this.timestamp = -1;
  }
};
LoveContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var LoveContents = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.says = o.says || [];
  } else {
    this.says = [];
  }
};
LoveContents.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var LoverContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.sex = o.sex;
    this.bind = o.bind;
  } else {
    this.sex = -1;
    this.bind = '';
  }
}
LoverContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var LoveContract = function () {
  LocalContractStorage.defineMapProperties(this, {
    LoveSaysMap: {
      parse: function (text) {
        return new LoveContents(text);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
    LoverMap: {
      parse: function (text) {
        return new LoverContent(text);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
  });
};

LoveContract.prototype = {
  init: function () {
  },
  // 用户进行绑定
  bind: function (target, selfsex, targetsex) {
    var from = Blockchain.transaction.from;
    var result = Blockchain.verifyAddress(target);
    if (result == 0) {
      throw new Error('the address to bind is not a right address');
    }

    if (from == target) {
      throw new Error('the addresses to bind sholud be differernt');
    }

    var selfBind = this.LoverMap.get(from);
    if (selfBind) {
      throw new Error('the address can only bind to one');
    }
    var targetBind = this.LoverMap.get(target);
    if (targetBind) {
      throw new Error('the target address can only bind to one');
    }

    var bindKey = from + '-' + target;

    selfBind = new LoverContent();
    selfBind.sex = selfsex;
    selfBind.bind = bindKey;

    targetBind = new LoverContent();
    targetBind.sex = targetsex;
    targetBind.bind = bindKey;

    this.LoverMap.set(from, selfBind);
    this.LoverMap.set(target, targetBind);
  },
  // 增加留言
  add: function(say, pics) {
    var from = Blockchain.transaction.from;
    var timestamp = new BigNumber(Blockchain.transaction.timestamp);

    var loverInfo = this.LoverMap.get(from);
    if (!loverInfo) {
      throw new Error('should bind one address before say');
    }

    var saids = this.LoveSaysMap.get(loverInfo.bind);
    if (!saids) {
      saids = new LoveContents();
    }
    var newSay = new LoveContent();
    newSay.say = say;
    newSay.pics = pics;
    newSay.sayer = from;
    newSay.timestamp = timestamp;
    saids.says.push(newSay);

    this.LoveSaysMap.set(loverInfo.bind, saids);
  },
  // 获取和当前用户所有相关的信息，分页查询
  get: function(offset, limit) {
    var from = Blockchain.transaction.from;
    var loverInfo = this.LoverMap.get(from);
    if (!loverInfo) {
      return null
    }
    var saids = this.LoveSaysMap.get(loverInfo.bind);
    if (!saids) {
      return null;
    }
    limit = parseInt(limit);
    offset = parseInt(offset);
    if(offset > saids.says.length){
      return {
        total: saids.says.length
      };
    }

    var number = offset+limit;
    if(number > saids.says.length){
      number = saids.says.length;
    }
    var outArr = [];
    for (var i=offset; i<number; i++) {
      saids.says[i].sayerSex = loverInfo.sex;
      if (saids.says[i].sayer == from) {
        saids.says[i].isMy = true;
      }
      outArr.push(saids.says[i]);
    }

    return {
      total: saids.says.length,
      saids: outArr
    };
  },
  // 获取当前用户的状态，判断有没有和别人绑定成功
  getStatus: function() {
    var from = Blockchain.transaction.from;
    return this.LoverMap.get(from);
  },
  // 校验地址信息正确与否
  checkAddress: function(target) {
    var from = Blockchain.transaction.from;
    var result = Blockchain.verifyAddress(target);
    if (result == 0) {
      return 1;  // 地址信息不对
    }
    if (from == target) {
      return 2; // 自己不能绑定自己
    }
    var selfBind = this.LoverMap.get(from);
    if (selfBind) {
      return 3;  // 自己已经绑定了
    }
    var targetBind = this.LoverMap.get(target);
    if (targetBind) {
      return 4;  // 目标地址已经绑定了
    }
    return 5;
  }
};
module.exports = LoveContract;