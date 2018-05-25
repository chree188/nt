"use strict";

var SubscriberItem = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.value = obj.value;
  } else {
    this.key = "";
    this.value = "";
  }
};

SubscriberItem.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var Geeksread = function () {
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new SubscriberItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

Geeksread.prototype = {
  init: function () {
  },

  save: function (key, value) {
    key = key.trim();
    value = value.trim();

    if (key === "" || value === "") {
      throw new Error("empty key / value");
    }
    if (value.length > 64 || key.length > 64) {
      throw new Error("key / value exceed limit length")
    }

    var re = /\S+@\S+\.\S+/;

    if (re.test(key) === false) {
      throw new Error("key is not email address.")
    }

    var from = Blockchain.transaction.from;
    var subscriberItem = this.repo.get(key);

    if (subscriberItem) {
      throw new Error("value has been occupied");
    }

    subscriberItem = new SubscriberItem();
    subscriberItem.key = key;
    subscriberItem.value = from;

    this.repo.put(key, subscriberItem);
  },

  get: function (key) {
    key = key.trim();
    if (key === "") {
      throw new Error("empty key")
    }
    return this.repo.get(key);
  }
};

module.exports = Geeksread;
