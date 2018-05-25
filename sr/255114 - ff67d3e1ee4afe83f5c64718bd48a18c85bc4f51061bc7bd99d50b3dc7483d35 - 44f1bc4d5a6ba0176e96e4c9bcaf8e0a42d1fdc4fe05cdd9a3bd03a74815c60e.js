"use strict";

var Account = function (text) {
  if (text) {
    var item = JSON.parse(text);
    this._addr = item._addr;
    this._token = item._token;
    this._nick = item._nick;
    this._createtime = item._createtime;
  } else {
    this._addr = "";
    this._token = "";
    this._nick = "";
    this._createtime = "";
  }
};

Account.prototype = {
  create: function (addr, token, nick, createtime) {
    this._addr = addr;
    this._token = token;
    this._nick = nick;
    this._createtime = this.createtime;
    return this;
  },

  isAllowLogin: function (token) {
    return !!token && this._token === token;
  },

  resettoken: function (token) {
    this._token = token;
  },

  getNick: function () {
    return this._nick;
  },

  toString: function () {
    return JSON.stringify(this);
  }
};

/**
 * 数据结构定义: 付费专题
 * 
 * @param {*} text 
 */
var KPoint = function (text) {
  if (text) {
    var item = JSON.parse(text);
    this.id = item.id;
    this.own = item.own;
    this.nick = item.nick;
    this.title = item.title;
    this.description = item.description;
    this.content = item.content;
    this.createtime = item.createtime;
    this.lastupdatetime = item.lastupdatetime;
    this.price = new BigNumber(item.price);
    this.isallowview = false;
  } else {
    this.id = "";
    this.own = "";
    this.nick = "";
    this.title = "";
    this.description = "";
    this.content = "";
    this.createtime = "";
    this.lastupdatetime = "";
    this.isallowview = false;
    this.price = new BigNumber(0);
  }
};

KPoint.prototype = {
  getOwn: function () {
    return this.own;
  },

  toString: function () {
    return JSON.stringify(this);
  }
};

/**
 * 数据结构定义: 专题与创建用户关联表
 * 
 * @param {*} text 
 */
var TUserKPoint = function (text) {
  if (text) {
    var item = JSON.parse(text);
    this._useraddr = item._useraddr;
    this._kpointids = item._kpointids;
  } else {
    this._useraddr = null;
    this._kpointids = [];
  }
};

TUserKPoint.prototype = {
  toString: function () {
    return JSON.stringify(this);
  },

  setUseraddr: function (useraddr) {
    this._useraddr = useraddr;
  },

  addKPointid: function (keypointid) {
    var kpointids = this._kpointids;
    kpointids.push(keypointid);
    this._kpointids = kpointids;
  },

  getKPointids: function () {
    return this._kpointids;
  }
};

/**
 * 数据结构定义: 售卖记录
 * 
 * @param {*} text 
 */
var TSellHis = function (text) {
  if (text) {
    var item = JSON.parse(text);
    this._kpointid = item._kpointid;
    this._useraddrs = item._useraddrs;
  } else {
    this._kpointid = null;
    this._useraddrs = [];
  }
};


TSellHis.prototype = {
  toString: function () {
    return JSON.stringify(this);
  },

  setKPointid: function (kpointid) {
    this._kpointid = kpointid;
  },

  addUseraddr: function (useraddr) {
    var useraddrs = this._useraddrs;
    useraddrs.push(useraddr);
    this._useraddrs = useraddrs;
  },

  getUserAddrs: function () {
    return this._useraddrs;
  },

  isContainUseraddr: function (useraddr) {
    return this._useraddrs.length > 0 && this._useraddrs.indexOf(useraddr) != -1;
  }
};

/**
 * 数据结构定义: 购买记录
 * 
 * @param {*} text 
 */
var TBuyHis = function (text) {
  if (text) {
    var item = JSON.parse(text);
    this._useraddr = item._useraddr;
    this._kpointids = item._kpointids;
  } else {
    this._useraddr = null;
    this._kpointids = [];
  }
};

TBuyHis.prototype = {
  toString: function () {
    return JSON.stringify(this);
  },

  setUseraddr: function (useraddr) {
    this._useraddr = useraddr;
  },

  addKPointid: function (kpointid) {
    var kpointids = this._kpointids;
    kpointids.push(kpointid);
    this._kpointids = kpointids;
  },

  getKPointids: function (params) {
    return this._kpointids;
  },

  isContainKPointid: function (kpointid) {
    return this._kpointids.length > 0 && this._kpointids.indexOf(kpointid) != -1;
  }
};


var KPointContract = function () {
  LocalContractStorage.defineProperties(this, {
    _admin: null,
    sequence: 0
  });
  LocalContractStorage.defineMapProperties(this, {
    "t_sys_user": {
      parse: function (value) {
        return new Account(value);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
    "t_kpoint": {
      parse: function (value) {
        return new KPoint(value);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
    "t_user_kpoint": {
      parse: function (value) {
        return new TUserKPoint(value);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
    "t_sell_his": {
      parse: function (value) {
        return new TSellHis(value);
      },
      stringify: function (o) {
        return o.toString();
      }
    },
    "t_buy_his": {
      parse: function (value) {
        return new TBuyHis(value);
      },
      stringify: function (o) {
        return o.toString();
      }
    }
  });
};

KPointContract.prototype = {
  /**
   * 初始化全局变量
   */
  init: function () {
    this._admin = Blockchain.transaction.from;
    this.sequence = 0;
  },


  reg: function (token, nick) {
    token = token || "";
    nick = nick || "";
    if (token == "" || nick == "") {
      throw new Error("empty token / nick.");
    }

    var regAddr = Blockchain.transaction.from;
    var user = this.t_sys_user.get(regAddr);
    if (!!user) {
      throw new Error("user exist");
    }

    user = new Account().create(regAddr, token, nick, Date.now());
    this.t_sys_user.set(regAddr, user);
    return user;
  },

  login: function (addr, token) {
    addr = addr || "";
    token = token || "";
    if (addr == "" || token == "") {
      throw new Error("empty addr / token");
    }
    if (!this.isexist(addr)) {
      return 202;
    }

    //200: 登陆成功; 201: 登陆失败; 202:用户不存在
    var user = this.t_sys_user.get(addr);
    return user.isAllowLogin(token) ? 200 : 201;
  },

  resetpwd: function (token) {
    token = token || "";
    if (token == "") {
      throw new Error("empty token");
    }

    var addr = Blockchain.transaction.from;
    if (this.isexist(addr)) {
      var user = this.t_sys_user.get(addr);
      user.resettoken(token);
      this.t_sys_user.set(addr, user);
    } else {
      throw new Error("user not exist.");
    }
  },

  isexist: function (addr) {
    var user = this.t_sys_user.get(addr);
    return !!user;
  },

  listMyKPoints: function (addr, token) {
    var kpointids = [];
    var mykpoint = this.t_user_kpoint.get(addr);
    if (!!mykpoint) {
      kpointids = mykpoint.getKPointids() || [];
    }

    var rtnList = [];
    for (var i = 0; i < kpointids.length; i++) {
      var tmpitem = this.t_kpoint.get(kpointids[i]);
      if (!!tmpitem) {
        rtnList.push(tmpitem);
      }
    }

    rtnList = this._transfer(rtnList, addr, token);
    return rtnList;
  },

  /**
   * 查询总列表，根据地址判断修改是否可看属性
   */
  list: function (addr, token) {
    var rtnList = [];
    for (var i = this.getCurrentID() - 1; i >= 0; i--) {
      var tmpitem = this.t_kpoint.get(i);
      if (!!tmpitem) {
        rtnList.push(tmpitem);
      }
    }
    rtnList = this._transfer(rtnList, addr, token);
    return rtnList;
  },

  pagelist: function (pageindex, limit, addr, token) {
    pageindex = new BigNumber(pageindex);
    limit = new BigNumber(limit);

    var len = this.getCurrentID();
    var totalpage = parseInt(len % limit == 0 ? len / limit : len / limit + 1);
    if (pageindex > (totalpage - 1)) {
      pageindex = totalpage - 1;
    }

    var result = [];
    for (var i = 0; i < limit; i++) {
      var index = len - pageindex * limit - i - 1;
      if (index < 0) {
        break;
      }
      var tmpitem = this.t_kpoint.get(index);
      if (!!tmpitem) {
        result.push(tmpitem);
      }
    }
    result = this._transfer(result, addr, token);
    return {
      "pageindex": pageindex,
      "limit": limit,
      "data": result,
      "totalpage": totalpage
    };
  },

  _transfer: function (itemlist, addr, token) {
    var isLogin = false;
    var kpids = [];
    if (!!addr && !!token) {
      isLogin = this.login(addr, token) == 200;
      if (isLogin) {
        var buykpointids = [];
        var selfkpointids = [];

        var buyhis = this.t_buy_his.get(addr);
        if (!!buyhis) {
          buykpointids = buyhis.getKPointids() || [];
        }
        var mykpoint = this.t_user_kpoint.get(addr);
        if (!!mykpoint) {
          selfkpointids = mykpoint.getKPointids() || [];
        }

        kpids = this.merge(buykpointids, selfkpointids);
      } else {
        this._trackEvent("listLoginCheck", {
          "errormsg": "验证登录失败"
        });
      }
    }

    for (var i = 0; i < itemlist.length; i++) {
      var tmpitem = itemlist[i];
      var sysuser = this.t_sys_user.get(tmpitem.own);
      if (!!sysuser) {
        tmpitem.nick = sysuser.getNick();
      }

      if (tmpitem.price.lte(0) || this.isAdmin() || (isLogin && (tmpitem.own === addr) || this.isContain(kpids, tmpitem.id+""))) {
        tmpitem.isallowview = true;
      }else{
        tmpitem.content = "";
      }
    }

    return itemlist;
  },

  /**
   * 查看单条信息
   */
  view: function (id, addr, token) {
    var isLogin = false;
    if (!!addr && !!token) {
      isLogin = this.login(addr, token) == 200;
    }
    var kpoint = this.t_kpoint.get(id);
    if (!kpoint) {
      throw new Error("empty KPoint");
    }

    if (kpoint.price.lte(0) || this.isAdmin() || (isLogin && (kpoint.own == addr))) {
      kpoint.isallowview = true;
      return kpoint;
    }

    var sellhis = this.t_sell_his.get(kpoint.id) || [];
    if (isLogin && sellhis.isContainUseraddr(addr)) {
      kpoint.isallowview = true;
    } else {
      kpoint.isallowview = false;
      kpoint.content = "";
    }
    return kpoint;
  },

  pay: function (id) {
    var kpoint = this.t_kpoint.get(id);
    if (!kpoint) {
      throw new Error("empty KPoint");
    }

    var from = Blockchain.transaction.from;
    var sellhis = this.t_sell_his.get(kpoint.id) || new TSellHis();
    if (sellhis.isContainUseraddr(from)) {
      throw new Error("already purchased");
    }

    var value = Blockchain.transaction.value;
    if (new BigNumber(value).lt(kpoint.price)) {
      throw new Error("transaction value less than the price");
    }

    var result = Blockchain.transfer(kpoint.own, value);
    if (!result) {
      throw new Error("transfer failed.");
    }
    this._trackEvent("event_pay", kpoint);

    sellhis.setKPointid(kpoint.id);
    sellhis.addUseraddr(from);
    this.t_sell_his.set(kpoint.id, sellhis);

    var buyhis = this.t_buy_his.get(from) || new TBuyHis();
    buyhis.setUseraddr(from);
    buyhis.addKPointid(id);
    this.t_buy_his.set(from, buyhis);
  },


  /**
   * 创建单条信息
   */
  save: function (title, description, content, price) {
    title = title.trim();
    description = description.trim();
    content = content.trim();
    price = price || 0;
    if (title === "" || description === "" || content === "") {
      throw new Error("empty title / description / content!");
    }


    var kpoint = new KPoint();
    kpoint.id = this.sequence;
    kpoint.title = title;
    kpoint.description = description;
    kpoint.content = content;
    kpoint.createtime = Date.now();
    kpoint.lastupdatetime = Date.now();
    kpoint.own = Blockchain.transaction.from;
    kpoint.price = this.toWei(price);
    kpoint.isallowview = kpoint.price.lte(0);
    this.t_kpoint.set(kpoint.id, kpoint);
    this._trackEvent("event_save", kpoint);

    var userkpoint = this.t_user_kpoint.get(kpoint.own) || new TUserKPoint();
    userkpoint.setUseraddr(kpoint.own);
    userkpoint.addKPointid(kpoint.id);
    this.t_user_kpoint.set(kpoint.own, userkpoint);

    this.sequence++;
  },


  /**
   * 修改单条信息
   * 
   */
  modify: function (id, title, description, content, price) {
    var kpoint = this.t_kpoint.get(id);
    if (!kpoint) {
      throw new Error("empty KPoint");
    }
    if (!this.isTranscationOwn(kpoint.own) && !this.isAdmin()) {
      throw new Error("Permission denied");
    }

    kpoint.title = !!title ? title : kpoint.title;
    kpoint.description = !!description ? description : kpoint.description;
    kpoint.content = !!content ? content : kpoint.content;
    kpoint.lastupdatetime = Date.now();
    kpoint.price = !!price ? new BigNumber(price) : kpoint.price;

    this.t_kpoint.set(kpoint.id, kpoint);

    this._trackEvent("event_modify", kpoint);
  },

  /**
   * 删除当前知识点
   */
  del: function (id) {
    var kpoint = this.t_kpoint.get(id);
    if (!kpoint) {
      throw new Error("empty KPoint");
    }
    if (!this.isTranscationOwn(kpoint.own) && !this.isAdmin()) {
      throw new Error("Permission denied");
    }
    var sellhis = this.t_sell_his.get(kpoint.id) || [];
    if (sellhis.length > 0) {
      throw new Error("Not allowed to modify due to purchased");
    }

    this.t_kpoint.del(kpoint.id);

    this._trackEvent("event_del", kpoint);
  },

  isTranscationOwn: function (own) {
    return own == Blockchain.transaction.from;
  },

  isAdminAddress: function (addr) {
    return this._admin === addr;
  },

  isAdmin: function () {
    return this.isAdminAddress(Blockchain.transaction.from);
  },

  fromaddr: function () {
    return Blockchain.transaction.from;
  },

  getCurrentID: function () {
    return this.sequence;
  },

  isContain: function (ary, item) {
    return ary != null && ary.length > 0 && ary.indexOf(item) != -1;
  },

  merge: function (ary1, ary2) {
    var mRtnAry = ary1 || [];
    for (var i = 0; i < ary2.length; i++) {
      if (ary1.indexOf(ary2[i]) == -1) {
        mRtnAry.push(ary2[i]);
      }
    }
    return mRtnAry;
  },

  _trackEvent: function (event, params) {
    Event.Trigger(event, params);
  },

  toWei: function (value) {
    return new BigNumber(value).mul(1000000000000000000);
  },

  toNas: function (wei) {
    return new BigNumber(wei).div(1000000000000000000);
  },

  debug: function (addr, id) {
    if (!this.isAdmin()) {
      throw new Error("Permission denied");
    }

    var rtn = {
      "t_sys_user": this.t_sys_user.get(addr),
      "t_kpoint": this.t_kpoint.get(id),
      "t_sell_his": this.t_sell_his.get(id),
      "t_user_kpoint": this.t_user_kpoint.get(addr),
      "t_buy_his": this.t_buy_his.get(addr)
    };
    return rtn;
  },

  query_view_ids: function (addr) {
    if (!this.isAdmin()) {
      throw new Error("Permission denied");
    }

    var buykpointids = [];
    var selfkpointids = [];

    var buyhis = this.t_buy_his.get(addr);
    if (!!buyhis) {
      buykpointids = buyhis.getKPointids() || [];
    }

    var mykpoint = this.t_user_kpoint.get(addr);
    if (!!mykpoint) {
      selfkpointids = mykpoint.getKPointids() || [];
    }

    var kpids = this.merge(buykpointids, selfkpointids);
    return {
      "buykpointids": buykpointids,
      "selfkpointids": selfkpointids,
      "merge": kpids
    }
  }
};

module.exports = KPointContract;