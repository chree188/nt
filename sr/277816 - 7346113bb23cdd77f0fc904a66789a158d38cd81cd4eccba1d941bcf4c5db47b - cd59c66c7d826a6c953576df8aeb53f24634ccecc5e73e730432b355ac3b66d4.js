'use strict';

// 许愿清单
var Wish = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.name = o.name; // 昵称
    this.author = o.author; // 用户地址
    this.content = o.content; // 许愿内容
    this.type = o.type; // 许愿类型
    this.time = o.time;  // 许愿创建时间
    this.anonymous = o.anonymous; // 代表该许愿单是否匿名，'0'代表不匿名，'1':代表匿名
  } else {
    this.name = ''; // 昵称
    this.author = '';  // 用户地址
    this.content = ''; // 许愿内容
    this.type = '1'; // 许愿类型
    this.time = ''; // 许愿时间
    this.anonymous = '0'; // 代表该许愿单是否匿名
  }
};
Wish.prototype = {
  toString: function () {
    return JSON.stringify(this);
  },
};


var WishWall = function () {
  // wishMap中存有三类数据
  // key=wish,存储所有的许愿数据
  // key = address,存储对应用户的所有许愿数据
  // key =type 存储对应许愿类型的所有许愿数据
  LocalContractStorage.defineMapProperty(this, 'wishMap'); 
  // LocalContractStorage.defineMapProperty(this, 'userMap');
};

WishWall.prototype = {
  init: function () {
  },

//   // Todo 暂时出不用 私有方法，对外不提供访问功能
//   _pushUserWish(collectionName, key, value) {
//     // 用户地址，对应的许愿
//     var item = this[collectionName].get(key);
//     if (!item) {
//       item = { addr: key, arr: [] };
//     }
//     item.arr.push(value);
//     this[collectionName].put(key, item);
//   },
  _pushWishes(key, value) {
    // 存储所有的许愿数据
    var items = this.wishMap.get(key);
    if (!items) {
        items = [];
    }
    items.push(value);
    this.wishMap.put(key, items);
  },
  
  createWish: function (name, type, content, anonymous) {
    // 创建一个许愿并将这个许愿存储到许愿池／用户许愿／类型许愿三个存储中
    var from = Blockchain.transaction.from;
    var time = Blockchain.transaction.timestamp * 1000;

    var item = new Wish();
    item.name = name;
    item.author = from;
    item.type = type;
    item.content = content;
    item.time = time;
    item.anonymous = anonymous;

    // 匿名的合约不加入到公共墙面，只有用户自己才能看到
    if (anonymous === '0') {
        this._pushWishes('all', item);
        this._pushWishes(type,item);
    }
    this._pushWishes(from,item);

    return item;
  },

  queryWishesByPage: function (offset, limit) {
    // 分页查询
    limit = parseInt(limit);
    offset = parseInt(offset);
    var wishes = this.wishMap.get("all");
    var result = [];
    if (!wishes) {
        return result;
    }

    var number = offset + limit;
    if (number > wishes.length) {
        number = wishes.length;
    }

    for (var i = offset; i < number; i++) {
        result.push(wishes[i]);
    }
    return result;
  },
  queryWishesByType: function(type, offset, limit) {
    // 根据许愿类型获取许愿列表
    // 分页查询
    limit = parseInt(limit);
    offset = parseInt(offset);
    var wishes = this.wishMap.get(type);
    var result = [];
    if (!wishes) {
        return result;
    }

    var number = offset + limit;
    if (number > wishes.length) {
        number = wishes.length;
    }

    for (var i = offset;i < number; i++) {
        result.push(wishes[i]);
    }
    return result;

  },
  queryMyWishes: function (offset, limit) {
    // 查询我的许愿单
    var from = Blockchain.transaction.from;
    // 根据许愿类型获取许愿列表
    // 分页查询
    limit = parseInt(limit);
    offset = parseInt(offset);
    var wishes = this.wishMap.get(from);
    var result = [];
    if (!wishes) {
        return result;
    }

    var number = offset + limit;
    if (number > wishes.length) {
        number = wishes.length;
    }

    for (var i = offset;i < number; i++) {
        result.push(wishes[i]);
    }
    return result;
  },
  getWishesCount: function(type) {
    if (type === "my") {
      type = Blockchain.transaction.from;
    }
    var wishes = this.wishMap.get(type);
    if (!wishes) {
      return 0;
    } 
    return wishes.length;
  }
};
module.exports = WishWall;
