'use strict';

// 二维码内容
var QRInfo = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.text = o.text; // 二维码内容
    this.bg = o.bg; // 二维码背景色
    this.fg = o.fg;  // 二维码前景色
    this.time = o.time; // 二维码创建时间
  } else {
    this.text = ""; // 二维码内容
    this.bg = ""; // 二维码背景色
    this.fg = "";  // 二维码前景色
    this.time = ""; // 二维码创建时间
  }
};
QRInfo.prototype = {
  toString: function () {
    return JSON.stringify(this);
  },
};


var QRCode = function () {
  // 保存用户的已经使用过的二维码信息
  LocalContractStorage.defineMapProperty(this, 'qrMap'); 
};

QRCode.prototype = {
  init: function () {
},

  _pushQRInfo(key, value) {
    // 存储所有的二维码信息
    var items = this.qrMap.get(key);
    if (!items) {
        items = [];
    }
    items.push(value);
    this.qrMap.put(key, items);
  },
  
  createQRInfo: function (text, bg, fg) {
    var from = Blockchain.transaction.from;
    var time = Blockchain.transaction.timestamp * 1000;

    var item = new QRInfo();
    item.text = text;
    item.bg = bg;
    item.fg = fg;
    item.time = time;

    this._pushQRInfo(from,item); // 存储用户的二维码信息

    return item;
  },
 
  queryMyQRInfo: function (offset, limit) {
    // 查询我的二维码信息
    var from = Blockchain.transaction.from;
    limit = parseInt(limit);
    offset = parseInt(offset);
    var qrs = this.qrMap.get(from);
    var result = [];
    if (!qrs) {
        return result;
    }

    var number = offset + limit;
    if (number > qrs.length) {
        number = qrs.length;
    }

    for (var i = offset;i < number; i++) {
        result.push(qrs[i]);
    }
    return result;
  },
  
  getMyQRCount: function() {
    var from = Blockchain.transaction.from;
    var qrs = this.qrMap.get(from);
    if (!qrs) {
      return 0;
    } 
    return qrs.length;
  }
};
module.exports = QRCode;