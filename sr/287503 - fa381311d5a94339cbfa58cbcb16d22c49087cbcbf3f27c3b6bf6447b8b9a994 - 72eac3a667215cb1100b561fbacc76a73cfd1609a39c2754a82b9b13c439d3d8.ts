'use strict';


class Vouncher {

  title = '';
  from = '';
  to = '';
  contnet = '';
  remark = '';
  txHash = '';
  time = 0;


  constructor(text) {
    if (!text) {
      return;
    }
    const o = JSON.parse(text);
    this.title = o.title;
    this.from = o.from;
    this.to = o.to;
    this.contnet = o.content;
    this.remark = o.remark;
    this.txHash = o.txHash;
    this.time = o.time;
  }

  toString() {
    return JSON.stringify(this);
  }
}


const NasVoucher = function () {
  LocalContractStorage.defineMapProperty(this, 'sendMap');
  LocalContractStorage.defineMapProperty(this, 'recvMap');
};

NasVoucher.prototype = {
  init: function () {
  },

  _push(collectionName, key, value) {
    let item = this[collectionName].get(key);
    if (!item) {
      item = { addr: key, arr: [] };
    }
    item.arr.push(value);
    this[collectionName].put(key, item);
  },

  create: function (to, title, contnet, remark) {
    const item = new Vouncher();
    item.title = title;
    item.from = Blockchain.transaction.from;
    item.to = to;
    item.contnet = contnet;
    item.remark = remark;
    item.txHash = Blockchain.transaction.hash;
    item.time = Blockchain.transaction.timestamp * 1000;
    this._push('sendMap', item.from, item);
    this._push('recvMap', item.to, item);
    return item;
  },

  query: function () {
    const from = Blockchain.transaction.from;
    let send = this.sendMap.get(from);
    let recv = this.recvMap.get(from);
    if (!send) {
      send = { addr: from, arr: [] };
    }
    if (!recv) {
      recv = { addr: from, arr: [] };
    }
    return { send: send, recv: recv };
  }
};
module.exports = NasVoucher;
