"use strict";

var RecordItem = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.from = obj.from;
    this.userName = obj.userName;
    this.content = obj.content;
    this.isOpen = obj.isOpen;
    this.createTime = obj.createTime;
  } else {
    this.from = "";
    this.userName = "";
    this.content = "";
    this.isOpen = false;
    this.createTime = new Date();
  }
};

RecordItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};


// 区块记事智能合约
var NasNoteBookContract = function () {
  LocalContractStorage.defineMapProperties(this,{
      userMap: null
  });

  LocalContractStorage.defineProperty(this, "size");
  LocalContractStorage.defineMapProperty(this, "allRecords", {
    parse: function (text) {
        return new RecordItem(text);
    },
    stringify: function (o) {
        return o.toString();
    }
  });
};

NasNoteBookContract.prototype = {
  init: function () {
    this.size = 0;
  },

  // 设置／读取用户名
  setUserName: function (userName) {
    var from = Blockchain.transaction.from;
    this.userMap.set(from, userName);
  },
  getUserName: function () {
    var from = Blockchain.transaction.from;
    return this.userMap.get(from);
  },

  // 新增记事
  addRecord: function (content, isOpen) {
    var from = Blockchain.transaction.from;

    var recordItem = new RecordItem();
    recordItem.from = from;
    recordItem.content = content;
    recordItem.isOpen = isOpen;

    var index = this.size;
    this.allRecords.set(index, recordItem);
    this.size += 1;
  },
  // 读取公开记事
  getOpenRecords: function () {
    var openRecords = [];
    for (var i = 0; i < this.size; i++) {
      var recordItem = this.allRecords.get(i);
      if (recordItem.isOpen) {
        if (this.userMap.get(recordItem.from)) {
          recordItem.userName = this.userMap.get(recordItem.from);
        }
        openRecords.push(recordItem);
      }
    }
    return openRecords;
  },
  // 读取用户记事
  getRecordsByUser: function () {
    var from = Blockchain.transaction.from;

    var userRecords = [];
    for (var i = 0; i < this.size; i++) {
      var recordItem = this.allRecords.get(i);
      if (recordItem.from === from) {
        if (this.userMap.get(recordItem.from)) {
          recordItem.userName = this.userMap.get(recordItem.from);
        }
        userRecords.push(recordItem);
      }
    }
    return userRecords;
  }
}

module.exports = NasNoteBookContract;
