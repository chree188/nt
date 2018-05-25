'use strict';

var Company = function (company) {
  if (company) {
    var obj = JSON.parse(company);
    this.key = obj.key;
    this.value = obj.value;
    this.author = obj.author;
    this.agree = obj.agree;
    this.disagree = obj.disagree;
    this.city = obj.city;
  } else {
    this.key = '';
    this.author = '';
    this.value = '';
    this.agree = [];
    this.disagree = [];
    this.city = '';
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
  LocalContractStorage.defineMapProperty(this, 'companyMap');
  LocalContractStorage.defineProperty(this, 'id');
};

BlackList.prototype = {
  init: function () {
    this.id = 0;
  },

  save: function (key, value, city) {
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
    item.city = city;
    this.companyMap.set(this.id, key);

    this.blacklist.put(key, item);
    this.id += 1;
  },

  get: function (key) {
    key = key.trim();
    if (key === '') {
      throw new Error('empty key');
    }
    return this.blacklist.get(key);
  },

  list: function () {
    var result = [];
    for (var i = 0; i < this.id; i++) {
      var key = this.companyMap.get(i);
      result[i] = this.blacklist.get(key);
    }
    return result;
  },

  toggleAgree: function (name, isAgree) {
    var from = Blockchain.transaction.from;
    var item = this.blacklist.get(name);
    var agreeArr = item.agree;
    var disagreeArr = item.disagree;
    var agreeIndex;
    var disagreeIndex;
    agreeIndex = agreeArr.indexOf(from);
    disagreeIndex = disagreeArr.indexOf(from);
    if (isAgree) {
      if (disagreeIndex !== -1) {
        disagreeArr.splice(disagreeIndex, 1);
      }
      if (agreeIndex !== -1) {
        throw new Error('每人只能点赞一次喔！');
      }
      agreeArr.push(from);
    } else {
      if (agreeIndex !== -1) {
        agreeArr.splice(agreeIndex, 1);
      }
      if (disagreeIndex !== -1) {
        throw new Error('每人只能反对一次喔！');
      }
      disagreeArr.push(from);
    }
    item.agree = agreeArr;
    item.disagree = disagreeArr;

    this.blacklist.put(name, item);
  }
};

module.exports = BlackList;