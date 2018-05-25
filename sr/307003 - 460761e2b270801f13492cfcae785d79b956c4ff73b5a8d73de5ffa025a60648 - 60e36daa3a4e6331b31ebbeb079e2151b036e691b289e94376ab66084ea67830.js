
"use strict";

var ContentItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
    this.type = obj.type;
    this.date = obj.date;
    this.content = obj.content;
    this.author = obj.author;
    this.index = obj.index;
	} else {
    this.type = '';
    this.date = '';
    this.content = '';
    this.author = '';
    this.index = 0;
	}
};

ContentItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
  }
};

var TimeCapsule = function() {
  // eslint-disable-next-line
  LocalContractStorage.defineMapProperty(this, 'contentMap', {
    parse: function (text) {
        return new ContentItem(text);
    },
    stringify: function (o) {
        return o.toString();
    }
  });
  // eslint-disable-next-line
  LocalContractStorage.defineMapProperty(this, "countMap");
  // eslint-disable-next-line
  LocalContractStorage.defineMapProperty(this, "existsMap");
  // eslint-disable-next-line
  LocalContractStorage.defineMapProperty(this, "allMap");
  // eslint-disable-next-line
  LocalContractStorage.defineProperty(this, "total", null);
  // eslint-disable-next-line
  LocalContractStorage.defineProperty(this, "owner", null);
  // eslint-disable-next-line
  LocalContractStorage.defineProperty(this, "userCount", null);
  // eslint-disable-next-line
  LocalContractStorage.defineProperty(this, "limit", null);
};

TimeCapsule.prototype = {
  init: function () {
    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    this.owner = from;
    this.limit = 10;
  },

  save: function(type, date, content) {
    type = type.trim();
    date = date.trim();
    content = content.trim();
    if (type === '' || date === '' || content === ''){
        throw new Error("empty type or date or content");
    }
    if (content.length > 512) {
        throw new Error("content exceed limit length");
    }
    if (isNaN(type) || type < 1 || type > 2) {
      throw new Error("invalid type value");
    }

    type = parseInt(type, 10);

    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    var count = this.countMap.get(from) || 0;
    count = parseInt(count, 10);
    if (count >= this.limit && this.owner !== from) {
      throw new Error("count exceed limit");
    }

    var existsKey = `${from}_${date}_${type}`;
    var exists = this.existsMap.get(existsKey);
    if (exists) {
      throw new Error(`${date} has value`);
    }
    this.existsMap.set(existsKey, 1);

    count += 1;
    this.countMap.set(from, count);

    if (count === 1) {
      var userCount = this.userCount || 0;
      this.userCount = userCount + 1;
    }

    var contentItem = new ContentItem();
    contentItem.type = type;
    contentItem.date = date;
    contentItem.content = content;
    contentItem.author = from;
    contentItem.index = count;

    var key = `${from}_${count}`;
    this.contentMap.set(key, contentItem);

    var total = this.total || 0;
    total = total + 1;
    this.total = total;
    this.allMap.set(total, key);
  },

  get: function(page = 0) {
    var contents = [];

    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    var count = this.countMap.get(from) || 0;
    if (!count) {
      return contents;
    }

    var key, content;
    if (!isNaN(page) && page > 0 && page <= count) {
      key = `${from}_${page}`;
      content = this.contentMap.get(key);
      contents.push(content);
    } else {
      for (var i = 1; i <= count; i++) {
        key = `${from}_${i}`;
        content = this.contentMap.get(key);
        contents.push(content);
      }
    }
    return contents;
  },

  getAllCount: function() {
    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    if (this.owner === from) {
      return this.total || 0;
    } else {
      throw new Error('auth error');
    }
  },

  getContentCount: function() {
    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    return this.countMap.get(from) || 0;
  },

  getContentCountByAddress: function(address = '') {
    if(!address || !address.trim()){
      throw new Error('address is empty');
    }

    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    if (this.owner === from) {
      return this.countMap.get(address) || 0;
    } else {
      throw new Error('auth error');
    }
  },

  getUserCount: function() {
    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    if (this.owner === from) {
      return this.userCount || 0;
    } else {
      throw new Error('auth error');
    }
  },

  setLimit: function(limit = 10) {
    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    if (this.owner === from) {
      if (isNaN(limit) || limit < 0) {
        throw new Error('params error');
      }
      this.limit = parseInt(limit, 10);
    } else {
      throw new Error('auth error');
    }
  },

  getLimit: function(limit = 10) {
    // eslint-disable-next-line
    var from = Blockchain.transaction.from;
    if (this.owner === from) {
      return this.limit || 0;
    } else {
      throw new Error('auth error');
    }
  }
};

module.exports = TimeCapsule;