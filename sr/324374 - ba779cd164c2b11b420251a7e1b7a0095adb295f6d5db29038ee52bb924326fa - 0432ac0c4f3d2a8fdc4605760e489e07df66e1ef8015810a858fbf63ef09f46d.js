"use strict";

var Flirt = function () {
  LocalContractStorage.defineProperty(this, "Owner");
  LocalContractStorage.defineMapProperty(this, "Token", {
    stringify: function (obj) {
      return obj.toString();
    },
    parse: function (str) {
      return str;
    }
  });
  LocalContractStorage.defineProperty(this, "collectindex");
  LocalContractStorage.defineMapProperty(this, "collect");
  LocalContractStorage.defineMapProperty(this, "liao");
};

Flirt.prototype = {
  init: function () {
    this.Owner = Blockchain.transaction.from;
    this.collectindex = 0;
  },
  _isOwner: function () {
    return this.Owner === Blockchain.transaction.from ? true : false;
  },
  transfer: function (address, value) {
    if (this._isOwner()) {
      _transfer(address, value)
    } else {
      throw new Error("only owner invoke")
    }
  },
  _transfer: function (address, value) {
    Blockchain.transfer(address, value);
  },

  setIndexCount(number) {
    if (this._isOwner()) {
      this.IndexCount = number;
    } else {
      throw new Error("only owner invoke")
    }
  },
  write(stringobj) {
    var key = this.collectindex.toString();
    // var Obj = JSON.parse(stringobj);
    // obj.id = key
    this.collect.put(key, stringobj);
    this.collectindex = this.collectindex + 1;
    return {
      status: 0,
      id: key
    }
  },
  get: function () {
    var result = [];
    var total = this.collectindex * 1;
    for (var i = 0; i < total; i++) {
      result.push(this.collect.get(i.toString()));
    }
    return {
      status: 0,
      data: result
    }
  },
  Fliao: function (id) {
    var liaocount = this.liao.get(id) || 0
    this.liao.set(id, liaocount + 1)
    return {
      status: 0,
      data: this.liao.get(id)
    }
  }

}
module.exports = Flirt;
