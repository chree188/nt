"use strict";

var ArtContent = function(text) {
  if (text) {
    var o = JSON.parse(text);
    this.Id = o.Id;
    this.addr = o.addr;
    this.title = o.title;
    this.content = o.content;
    this.imageurl = o.imageurl;
    this.date = o.date;
    this.star = o.star;
    this.cc = o.cc;
    this.reward = o.reward;
  } else {
    this.Id = new BigNumber(0);
    this.addr = "";
    this.title = "";
    this.content = "";
    this.imageurl = "";
    this.date = Date.now();
    this.star = new BigNumber(0);
    this.cc = new BigNumber(0);
    this.reward = new BigNumber(0);
  }
};

ArtContent.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var CommentContent = function(text) {
  if (text) {
    var o = JSON.parse(text);
    this.addr = o.addr;
    this.title = o.title;
    this.content = o.content;
    this.date = o.date;
  } else {
    this.addr = "";
    this.title = "";
    this.content = "";
    this.date = Date.now();
  }
};

CommentContent.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var RewardContent = function(text) {
  if (text) {
    var o = JSON.parse(text);
    this.addr = o.addr;
    this.balance = o.balance;
    this.content = o.content;
    this.date = o.date;
  } else {
    this.addr = "";
    this.balance = new BigNumber(0);
    this.content = "";
    this.date = Date.now();
  }
};

RewardContent.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var ArtContract = function() {
  LocalContractStorage.defineProperty(this, "ArtCount", null);
  LocalContractStorage.defineMapProperty(this, "CommentCount", null);
  LocalContractStorage.defineMapProperty(this, "StarMap", null);
  LocalContractStorage.defineMapProperty(this, "ArtMap", {
    parse: function(text) {
      return new ArtContent(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "CommentMap", {
    parse: function(text) {
      return new CommentContent(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "RewardMap", {
    parse: function(text) {
      return new RewardContent(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
};

ArtContract.prototype = {
  init: function() {
    this.ArtCount = 0;
  },

  save: function(title, imageurl, content) {
    var from = Blockchain.transaction.from;
    var art = new ArtContent();
    var count = new BigNumber(this.ArtCount);
    art.Id = count.plus(1);
    art.addr = from;
    art.title = title;
    art.imageurl = imageurl;
    art.content = content;
    this.ArtMap.set(art.Id, art);
    this.ArtCount = count.plus(1);
    return {
      code: 200,
      msg: JSON.stringify(art)
    };
  },

  getById: function(id) {
    return this.ArtMap.get(id);
  },

  getAll: function(offset, limit) {
    limit = parseInt(limit);
    offset = parseInt(offset);
    if (offset > this.ArtCount) {
      throw new Error("offset is not valid");
    }
    var number = offset + limit;
    if (number > this.ArtCount) {
      number = this.ArtCount + 1;
    }
    var result = [];
    for (var i = offset; i < number; i++) {
      var art = this.ArtMap.get(i.toString());
      if (art) result.unshift(art);
    }
    return result;
  },

  verifyAddress: function(address) {
    // 1-valid, 0-invalid
    var result = Blockchain.verifyAddress(address);
    return {
      valid: result == 0 ? false : true
    };
  },

  getArtCount: function() {
    return this.ArtCount;
  },

  comment: function(artId, title, content) {
    var from = Blockchain.transaction.from;
    var comment = new CommentContent();
    comment.addr = from;
    comment.title = title;
    comment.content = content;
    var artc = this.CommentCount.get(artId);
    if (artc) {
      var cc = new BigNumber(artc);
      artc = cc.plus(1);
    } else {
      artc = new BigNumber(1);
    }
    this.CommentCount.set(artId, artc);
    this.CommentMap.set(`${artId}#${artc}`, comment);
    var art = this.ArtMap.get(artId);
    if (art) {
      var vartcc = new BigNumber(art.cc);
      art.cc = vartcc.plus(1);
      this.ArtMap.set(artId, art);
    }

    return {
      code: 200,
      msg: JSON.stringify(art)
    };
  },

  getComments: function(artId) {
    var artc = this.CommentCount.get(artId);
    if (artc) {
      var result = [];
      for (let index = 0; index <= artc; index++) {
        var com = this.CommentMap.get(`${artId}#${index}`);
        if (com) result.unshift(com);
      }
      return result;
    } else {
      return [];
    }
  },

  setStar: function(artId) {
    var from = Blockchain.transaction.from;
    var isSet = this.StarMap.get(`${artId}#${from}`);
    if (isSet) return { code: 401, msg: "已经点赞过了" };
    var art = this.ArtMap.get(artId);
    if (art) {
      var star = new BigNumber(art.star);
      art.star = star.plus(1);
      this.ArtMap.set(artId, art);
      this.StarMap.set(`${artId}#${from}`, 1);
      return {
        code: 200,
        msg: JSON.stringify(art)
      };
    }
    return {
      code: 401,
      msg: "作品ID不存在"
    };
  },

  setReward: function(artId, content) {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;
    var art = this.ArtMap.get(artId);
    if (art) {
      var to = art.addr;
      var result = Blockchain.transfer(to, value);
      if (!result) {
        throw new Error("transfer failed.");
      }

      var artre = new BigNumber(art.reward);
      art.reward = artre.plus(1);
      this.ArtMap.set(artId, art);

      var reward = new RewardContent();
      reward.addr = from;
      reward.balance = value;
      reward.content = content;
      this.RewardMap.set(`${artId}#${art.reward}`, reward);
      return { code: 200, msg: JSON.stringify(reward) };
    } else {
      return { code: 401, msg: "artId is not exist" };
    }
  },

  getRewardList: function(artId) {
    var art = this.ArtMap.get(artId);
    if (art) {
      let rwcc = art.reward;
      let result = [];
      if (rwcc) {
        for (let index = 0; index <= rwcc; index++) {
          let reward = this.RewardMap.get(`${artId}#${index}`);
          if (reward) result.push(reward);
        }
      }
      return result;
    } else return [];
  },

  test: function() {
    return "this is test message";
  }
};

module.exports = ArtContract;
