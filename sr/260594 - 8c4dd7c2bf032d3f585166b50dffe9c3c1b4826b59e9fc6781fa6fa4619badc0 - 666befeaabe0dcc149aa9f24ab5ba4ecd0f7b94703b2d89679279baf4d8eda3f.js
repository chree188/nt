'use strict';

var Company = function (company) {
  if (company) {
    var obj = JSON.parse(company);
    this.key = obj.key;
    this.value = obj.value;
    this.author = obj.author;
  } else {
    this.key = '';
    this.author = '';
    this.value = '';
  }
};

Company.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var BlackList = function () {
  LocalContractStorage.defineMapProperty(this, 'blacklist', {
    parse: function (company) {
      return new Company(company);
    },
    stringify: function (obj) {
      return obj.toString();
    }
  });
};

BlackList.prototype = {
  init: function () {
    // todo
  },

  save: function (key, value) {
    key = key.trim();
    value = value.trim();
    if (key === '' || value === '') {
      throw new Error('empty key / value');
    }
    if (value.length > 30 || key.length > 500) {
      throw new Error('key / value exceed limit length');
    }

    var from = Blockchain.transaction.from;
    var item = this.blacklist.get(key);
    if (item) {
      throw new Error('value has been occupied');
    }

    item = new Company();
    item.author = from;
    item.key = key;
    item.value = value;

    this.blacklist.put(key, item);
  },

  get: function (key) {
    key = key.trim();
    if (key === '') {
      throw new Error('empty key');
    }
    return this.blacklist.get(key);
  }
};
module.exports = BlackList;
