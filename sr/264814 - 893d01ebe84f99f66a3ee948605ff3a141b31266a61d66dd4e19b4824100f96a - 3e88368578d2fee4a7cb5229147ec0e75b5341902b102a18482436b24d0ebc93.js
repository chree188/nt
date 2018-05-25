"use strict";

var Evaluate = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.type = obj.type;
    this.from = obj.from;
    this.dappAddress = obj.dappAddress;
    this.time = obj.time;
  } else {
    this.key = "";
    this.type = "";
    this.from = "";
    this.dappAddress = "";
    this.time = "";
  }
};

Evaluate.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var EvaluateContract = function () {
  LocalContractStorage.defineMapProperty(this, "evaluate", {
    parse: function (text) {
      return new Evaluate(text);
    },
    stringify: function (obj) {
      return obj.toString();
    }
  });
  LocalContractStorage.defineProperty(this, "recordSize");
};

EvaluateContract.prototype = {
  init: function () {
    this.recordSize = 0;
  },
  save: function (dappAddress, type) {
    var from = Blockchain.transaction.from;
    var index = this.recordSize;

    var requestData = new Evaluate();
    requestData.key = index;
    requestData.type = type;
    requestData.from = from;
    requestData.dappAddress = dappAddress;
    requestData.time = Blockchain.block.timestamp;

    var records = JSON.parse(this.list(index, 0) || '[]');
    for (let i = 0; i < records.length; i++) {
      if (records[i] && records[i].from === from && records[i].dappAddress === dappAddress) {
        throw new Error("evaluateOverstepLimit");
      }
    }

    this.evaluate.set(from, requestData);
    this.evaluate.set(index, requestData);
    this.recordSize += 1;
  },
  list: function (limit, offset) {
    limit = parseInt(limit);
    offset = parseInt(offset);
    if (offset > this.recordSize) throw new Error("offsetNotValid");
    var number = offset + limit;
    if (number > this.recordSize) number = this.recordSize;
    var object = {};
    var results = [];
    for (var i = offset; i < number; i++) {
      object = this.evaluate.get(i);
      results.push(object);
    }
    return JSON.stringify(results);
  },
  get: function (key) {
    return this.evaluate.get(key);
  },
  total: function () {
    return this.recordSize;
  },
};

module.exports = EvaluateContract;
