"use strict";

var GrantItem = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.ownerId = obj.ownerId;
    this.userId = obj.userId;
    this.startDate = obj.startDate;
    this.endDate = obj.endDate;
    this.moreInfo = obj.moreInfo
  } else {
    this.key = "";
    this.ownerId = "";
    this.userId = "";
    this.startDate = "";
    this.endDate = "";
    this.moreInfo = ""
  }
};

GrantItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var GrantRecorder = function () {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new GrantItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

GrantRecorder.prototype = {
  init: function () {
    // todo
  },

  save: function (key, ownerId, userId, startDate, endDate, moreInfo) {
    if (key === "" || key.trim() === ''){
      throw new Error("empty key");
    }
    key = key.trim();
    var grantItem = this.repo.get(key);
    if (grantItem){
      throw new Error("grant key has been occupied");
    }
    grantItem = new GrantItem();
    grantItem.key = key;
    grantItem.ownerId = ownerId;
    grantItem.userId = userId;
    grantItem.startDate = startDate;
    grantItem.endDate = endDate;
    grantItem.moreInfo = moreInfo;
    this.repo.put(key, grantItem);
  },

  get: function (key) {
    if (key === "" || key.trim() === ''){
      throw new Error("empty key");
    }
    key = key.trim();
    return this.repo.get(key);
  }
};
module.exports = GrantRecorder;