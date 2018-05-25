'use strict';

var UploaderContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.name = o.name;
    this.telNo = o.telNo;
    this.mail = o.mail;
  } else {
    this.traces = [];
  }
};
UploaderContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var ProductTraces = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.traces = o.traces || [];
  } else {
    this.traces = [];
  }
};
ProductTraces.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var ProductTraceItem = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.uploader = o.uploader;
    this.blockHeight = o.blockHeight;
    this.txHash = o.txHash;
    this.timestamp = o.timestamp;
    this.productBarCode = o.productBarCode;
    this.productName = o.productName;
    this.productPic = o.productPic;
    this.productDes = o.productDes;
    this.lastEditTime = o.lastEditTime;
  } else {
    this.uploader = '';
    this.blockHeight = -1;
    this.txHash = '';
    this.timestamp = -1;
    this.productBarCode = '';
    this.productName = '';
    this.productPic = '';
    this.productDes = '';
    this.lastEditTime = 0;
  }
};
ProductTraceItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var ProductTraceContract = function () {
  LocalContractStorage.defineMapProperties(this, {
    productTraceMap: {
      parse: function (text) {
        return new ProductTraces(text);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
    uploaderMap: {
      parse: function (text) {
        return new UploaderContent(text);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
  });
};

ProductTraceContract.prototype = {
  init: function () {
  },
  // 设置自己的个人信息
  setUserInfo: function (name, telNo, mail) {
    var from = Blockchain.transaction.from;
    var uploader = this.uploaderMap.get(from);
    if (!name && !tel && !mail) {
      throw new Error('must upload at least one info');
    }
    if (!uploader) {
      uploader = new UploaderContent();
    }
    uploader.name = name;
    uploader.telNo = telNo;
    uploader.mail = mail;

    this.uploaderMap.set(from, uploader);
  },
  // 获取自己的个人信息
  getMyUserInfo: function() {
    var from = Blockchain.transaction.from;
    return this.uploaderMap.get(from);
  },
  // 获取其他上传者的个人信息
  getUploaderUserInfo: function(target) {
    var from = Blockchain.transaction.from;

    var result = Blockchain.verifyAddress(target);
    if (result == 0) {
      throw new Error('the target address is not correct');
    }

    if (from == target) {
      return this.uploaderMap.get(target);
    }

    return this.uploaderMap.get(target);
  },
  // 编辑物品信息
  editProductInfo: function (pbarcode, pname, ppic, pdes) {
    var bk_height = new BigNumber(Blockchain.block.height);
    var from = Blockchain.transaction.from;
    var txHash = Blockchain.transaction.hash;
    var timestamp = new BigNumber(Blockchain.transaction.timestamp);

    var productTraces = this.productTraceMap.get(pbarcode);
    if (!productTraces) {
      throw new Error('no this product info');
    }
    for (var i=0; i<productTraces.traces.length; i++) {
      if (productTraces.traces[i].productBarCode == pbarcode) {
        productTraces.traces[i].productName = pname;
        productTraces.traces[i].productPic = ppic;
        productTraces.traces[i].productDes = pdes;
        productTraces.traces[i].lastEditTime = timestamp;
      }
    }
    this.productTraceMap.put(pbarcode, productTraces);
  },
  // 增加物品信息
  addPorductInfo: function (pbarcode, pname, ppic, pdes) {
    var bk_height = new BigNumber(Blockchain.block.height);
    var from = Blockchain.transaction.from;
    var txHash = Blockchain.transaction.hash;
    var timestamp = new BigNumber(Blockchain.transaction.timestamp);

    var productTraces = this.productTraceMap.get(pbarcode);
    if (!productTraces) {
      productTraces = new ProductTraces();
    }

    var traceItem = new ProductTraceItem();
    traceItem.uploader = from;
    traceItem.blockHeight = bk_height;
    traceItem.txHash = txHash;
    traceItem.timestamp = timestamp;
    traceItem.productBarCode = pbarcode;
    traceItem.productName = pname;
    traceItem.productPic = ppic;
    traceItem.productDes = pdes;
    productTraces.traces.push(traceItem);

    this.productTraceMap.put(pbarcode, productTraces);
  },
  // 获取物品信息
  getProductInfo: function (pbarcode) {
    var from = Blockchain.transaction.from;
    var productTraces = this.productTraceMap.get(pbarcode);
    if (productTraces) {
      for (var i=0; i<productTraces.traces.length; i++) {
        if (productTraces.traces[i].uploader == from) {
          productTraces.traces[i].isMy = true;
        }
      }
    }
    return productTraces;
  },
  // 获取我上传的特定物品信息
  getMyProductInfo: function (pbarcode) {
    var from = Blockchain.transaction.from;
    var productTraces = this.productTraceMap.get(pbarcode);
    var myProductInfo;
    if (productTraces) {
      for (var i=0; i<productTraces.traces.length; i++) {
        if (productTraces.traces[i].uploader == from) {
          myProductInfo = productTraces.traces[i];
        }
      }
    }
    return myProductInfo;
  }
};
module.exports = ProductTraceContract;