"use strict";

const MemorandumItem = function(text) {
  if (text) {
    const obj = JSON.parse(text);
    this.key = obj.key;
    this.value = obj.value;
    this.author = obj.author;
  } else {
    this.key = "";
    this.author = "";
    this.value = "";
  }
};

MemorandumItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

const memorandum = function () {
  LocalContractStorage.defineProperty(this, "memorandumList", {
    parse: function (text) {
      return JSON.parse(text)
    },
    stringify: function (text) {
      return JSON.stringify(text)
    }
  });
};

memorandum.prototype = {
  init: function () {
    // todo
    this.memorandumList = []
  },

  save: function (key, value) {

    key = key.trim();
    value = value.trim();
    if (key === "" || value === ""){
      throw new Error("empty key / value");
    }
    if (value.length > 64 || key.length > 64){
      throw new Error("key / value exceed limit length")
    }

    const from = Blockchain.transaction.from;
    let itemList = this.memorandumList;

    const memorandumItem = new MemorandumItem();
    memorandumItem.author = from;
    memorandumItem.key = key;
    memorandumItem.value = value;

    itemList.push(memorandumItem)

    this.memorandumList = itemList;
  },

  get: function () {
    return this.memorandumList;
  }
};
module.exports = memorandum;