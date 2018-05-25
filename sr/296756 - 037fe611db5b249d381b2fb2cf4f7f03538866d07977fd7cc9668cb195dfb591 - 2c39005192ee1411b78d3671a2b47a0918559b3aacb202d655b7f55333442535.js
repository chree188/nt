
'use strict';

var UserInfoItem = function(data) {
    if (data) {
        var userinfo = JSON.parse(data);
        this.from = userinfo.from;
        this.id = userinfo.id;//编码根据时间生成
        this.name = userinfo.name;//用户名
        this.email = userinfo.email;//用户邮箱
        this.theme = userinfo.theme;//用户主题
        this.message = userinfo.message; //用户简介
        this.time = userinfo.time;//时间
        this.eventid = userinfo.eventid;//每一次事件的编码

    } else {
        this.from = "";
        this.id = "";
        this.name = "";
        this.email = "";
        this.theme = "";
        this.message = "";
        this.time = "";
        this.eventid = "";
    }
};
UserInfoItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//用户地址信息列表
var AddrS = function(data) {
    if (data) {
        var userid = JSON.parse(data);
        this.addrs = userid.addrs;
    } else {
        this.addrs = [];
    }
};

AddrS.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//暗号密语列表
var ThemeS = function(data) {
    if (data) {
        var info = JSON.parse(data);
        this.themes = info.themes;
    } else {
        this.themes = [];
    }
};

ThemeS.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//时间编码列表
var CodeS = function(data) {
    if (data) {
        var info = JSON.parse(data);
        this.codes = info.codes;
    } else {
        this.codes = [];
    }
};

CodeS.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//每次上传信息为一个事件
var EventInfo = function() {

    LocalContractStorage.defineProperty(this, "num");

    LocalContractStorage.defineMapProperty(this, "listall");

    LocalContractStorage.defineMapProperty(this, "event", {
        parse: function(data) {
            return new UserInfoItem(data);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "addr", {
        parse: function(data) {
            return new AddrS(data);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "theme", {
        parse: function(data) {
            return new ThemeS(data);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "code", {
        parse: function(data) {
            return new CodeS(data);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

};

EventInfo.prototype = {
    init: function() {
        this.num = 0;
    },
    /**
     * 用户上传数据保存
     * @param {type} id 根据时间生成的时间ID
     * @param {type} name 用户名    
     * @param {type} email 用户邮箱
     * @param {type} theme 用户主题
     * @param {type} message 用户简介
     * @param {type} time 上传时间
     * @returns {String}  eventid 成功返回事件ID
     */
    save: function(id, name, email, theme, message, time) {
        var from = Blockchain.transaction.from;
        var usraddr = this.addr.get(from);
        if (!usraddr) {
            usraddr = new AddrS();
        }
        var themes = this.theme.get(theme);
        if (!themes) {
            themes = new ThemeS();
        }
        var codes = this.code.get(id);
        if (!codes) {
            codes = new CodeS();
        }

        var userItem = new UserInfoItem();
        var eventid = from + "_" + id;

        userItem.from = from;
        userItem.id = id;
        userItem.name = name;
        userItem.email = email;
        userItem.theme = theme;
        userItem.message = message;
        userItem.time = time;
        userItem.eventid = eventid;

        usraddr.addrs.push(id);
        themes.themes.push(eventid);
        codes.codes.push(eventid);

        this.event.put(eventid, userItem);//事件列表
        this.addr.put(from, usraddr); //用户列表
        this.theme.put(theme, themes);//主题列表
        this.code.put(id, codes);//主题列表

        //全部记录，仅管理员查看
        this.listall.put(this.num, eventid);
        this.num = this.num + 1;
        return [eventid];
    },
    /**
     * 查找记录信息
     * @param {type} type 主题:theme、用户:address、时间编码:code
     * @param {type} key  查询值
     * @returns {Array|EventInfo.prototype.search.result}
     */
    search: function(type, key, from) {
        var result = [];
        if (type === "address") {
            var userList = this.addr.get(key);
            if (userList) {
                for (var i = 0; i < userList.addrs.length; i++) {
                    var eventid = from + "_" + userList.addrs[i];
                    result[i] = this.event.get(eventid);
                }
            }
            return result;
        }
        if (type === "theme") {
            var themeList = this.theme.get(key);
            if (themeList) {
                for (var i = 0; i < themeList.themes.length; i++) {
                    result[i] = this.event.get(themeList.themes[i]);
                }
            }
            return result;
        }
        if (type === "code") {
            var codeList = this.code.get(key);
            if (codeList) {
                for (var i = 0; i < codeList.codes.length; i++) {
                    result[i] = this.event.get(codeList.codes[i]);
                }
            }
            return result;
        }
        return [];
    },
    /**
     * 主管权限查看所有记录、测试专用
     * @returns {EventInfo.prototype@pro;event@call;get}
     */
    list: function(from) {
        if (from !== "n1GVzYoxGgWG8i2VungBQcZ9CZcbzaztmYD") {
            return [];
        }
        var result = [];
        for (var i = 0; i < this.num; i++) {
            var eventid = this.listall.get(i);
            result[i] = this.event.get(eventid);
        }
        return result;
    },
    count: function() {
        return this.num;
    },
    selcode: function(key) {
        return this.code.get(key);
    }
};
module.exports = EventInfo;
