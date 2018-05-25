"use strict";

var Member = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.account = obj.account;
        this.username = obj.username;
        this.address = obj.address;
        this.token = obj.token;
        this.signIn = obj.signIn;
    } else {
        this.id = -1;
        this.account = "";
        this.username = "";
        this.address = "";
        this.token = 0;
        this.signIn = [];
    }
};

Member.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SignInLog = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;           //id
        this.date = obj.date;
        this.account = obj.account;     //地址
        this.username = obj.username;   //作者
        this.author = obj.author;       //首页地址
        this.address = obj.address;     //文章地址
        this.title = obj.title;         //文章标题
        this.mood = obj.mood;           //心情
        this.txHash = obj.txHash;
    } else {
        this.id = -1;               //id
        this.date = "";
        this.account = "";     //地址
        this.username = "";   //作者
        this.author = "";
        this.address = "";     //文章地址
        this.title = "";         //文章标题
        this.mood = "";           //心情
        this.txHash = "";
    }
}

SignInLog.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BihuCoffee = function () {
    LocalContractStorage.defineMapProperty(this, "idToAccount");

    LocalContractStorage.defineMapProperty(this, "accountToMember", {
        parse: function (text) {
            return new Member(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "signInMap");
    LocalContractStorage.defineMapProperty(this, "idToSignInLog", {
        parse: function (text) {
            return new SignInLog(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        count: null,
        signInCount: null,
        owner: null,
        totalSupply: null,
        totalBurn: null,
    });
};

BihuCoffee.prototype = {

    init: function () {
        this.count = 0;
        this.signInCount = 0;
        this.owner = Blockchain.transaction.from;
        this.totalSupply = 0;
        this.totalBurn = 0;
    },

    /**
     * 管理员发币 
     */
    issue: function (id, quantity) {
        var current = Blockchain.transaction.from;
        if (current !== this.owner) {
            throw new Error("limited authority");
        }

        if (typeof id == undefined) {
            throw new Error("empty id");
        }

        if (typeof quantity == undefined) {
            throw new Error("empty quantity");
        }

        if (isNaN(quantity)) {
            throw new Error("quantity value invalid");
        }

        quantity = parseInt(quantity);

        var account = this.idToAccount.get(id);
        if (!account) {
            throw new Error("member not found");
        }

        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("member not found");
        }

        member.token += quantity;

        this.totalSupply += quantity;

        this.accountToMember.set(account, member);
    },

    /**
     * 管理员销毁币
     */
    burn: function (id, quantity) {
        var current = Blockchain.transaction.from;
        if (current !== this.owner) {
            throw new Error("limited authority");
        }

        if (typeof id == undefined) {
            throw new Error("empty id");
        }

        if (typeof quantity == undefined) {
            throw new Error("empty quantity");
        }

        if (isNaN(quantity)) {
            throw new Error("quantity value invalid");
        }

        quantity = parseInt(quantity);

        var account = this.idToAccount.get(id);
        if (!account) {
            throw new Error("member not found");
        }

        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("member not found");
        }

        if (member.token < quantity) {
            throw new Error("token insufficient");
        }

        member.token -= quantity;
        this.totalBurn += quantity;
        this.accountToMember.set(account, member);
    },

    /**
     *  获取当前系统数据
     */
    getDappInfo: function () {
        var result = {
            count: this.count,
            signInCount: this.signInCount,
            owner: this.owner,
            totalSupply: this.totalSupply,
            totalBurn: this.totalBurn
        };
        return JSON.stringify(result);
    },

    getSignLogsById: function (id) {
        var account = this.idToAccount.get(id);
        if (!account) {
            throw new Error("member not found");
        }

        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("member not found");
        }
        var result = [];
        var _this = this;
        member.signIn.forEach(function (signId) {
            var signInLog = _this.idToSignInLog.get(signId);
            result.push(signInLog);
        })
        return result;
    },

    /**
     * 会员列表 分页
     */
    getMemberList: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.count) {
            throw new Error("offset is not valid");
        }

        var number = offset + limit;
        if (number > this.count) {
            number = this.count;
        }

        var result = [];
        for (var i = offset; i < number; i++) {

            var account = this.idToAccount.get(i);
            if (account) {
                var member = this.accountToMember.get(account);
                if (member) {
                    result.push(member);
                }
            }
        }

        return result;
    },

    /**
     * 会员注册
     */
    register: function (username, address, invite) {

        if (!username || !username.trim()) {
            throw new Error("empty username");
        }

        if (!address || !address.trim()) {
            throw new Error("empty address");
        }

        var account = Blockchain.transaction.from;

        var member = this.accountToMember.get(account);
        if (member) {
            throw new Error("already register");
        }

        var id = this.count;

        member = new Member();
        member.id = id;
        member.account = account;
        member.username = username;
        member.address = address;
        //注册奖励
        member.token = 500;

        this.totalSupply += 500;

        if (invite && invite > -1) {
            //邀请人 + 200
            var inviterAccount = this.idToAccount.get(invite);
            if (inviterAccount) {
                var inviter = this.accountToMember.get(inviterAccount)
                if (inviter) {
                    inviter.token += 200;
                    this.totalSupply += 200;
                    this.accountToMember.set(inviterAccount, inviter);
                }
            }
        }

        this.idToAccount.set(id, account);
        this.accountToMember.set(account, member);
        this.count = this.count + 1;
    },

    updateInfo: function (username, address) {
        if (!username || !username.trim()) {
            throw new Error("empty username");
        }
        if (!address || !address.trim()) {
            throw new Error("empty address");
        }
        var account = Blockchain.transaction.from;

        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("no a member, register first");
        }

        member.username = username;
        member.address = address;
        this.accountToMember.set(account, member);
    },

    signIn: function (mood, title, address) {
        var account = Blockchain.transaction.from;
        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("no a member, register first");
        }

        //0 签到唯一id。account + 日期。做key。确保每日1签。
        var signId = this._getSignId(account);
        //1. 签到唯一id， 检查是否签到过了。 
        var hasSign = this.signInMap.get(signId);
        if (hasSign) {
            throw new Error("today already sign in");
        }

        var id = this.signInCount;

        //2. 创建签到log对象
        var signInLog = new SignInLog();
        signInLog.id = id;
        signInLog.date = Date.now();
        signInLog.account = account;
        signInLog.username = member.username;
        signInLog.author = member.address || "";
        signInLog.address = address || "";
        signInLog.title = title || "";
        signInLog.mood = mood || "";
        signInLog.txHash = Blockchain.transaction.hash;

        //3. 签到id 做 key。索引签到log对象
        this.idToSignInLog.set(id, signInLog);
        //4. 签到id 给 member对象的数组
        member.signIn.push(id);
        //5. 标记为已签到
        this.signInMap.set(signId, 1);

        //6. 获得签到奖励 + 50
        member.token += 50;
        this.totalSupply += 50;
        // save
        this.accountToMember.set(account, member);
        this.signInCount = this.signInCount + 1;
    },

    /**
     * 私有函数,根据account创建唯一的signId
     */
    _getSignId(account) {
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth + 1;
        var date = today.getDate();
        var todayStr = year + "-" + month + "-" + date;
        var signId = account + "_" + todayStr;
        return signId
    },

    /**
     * 获取会员数量
     */
    getMemberCount: function () {
        return this.count;
    },

    /**
     * 获取个人信息
    */
    getMyInfo: function (account) {
        // var account = Blockchain.transaction.from;
        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("no a member, register first");
        }

        //检查是否已经签到
        var signId = this._getSignId(account);
        member.hasSign = this.signInMap.get(signId) || 0;

        return member;
    },


    /**
     * 获取会员信息
     */
    getMemberInfo: function (id) {
        if (typeof id == undefined) {
            throw new Error("empty id");
        }

        var account = this.idToAccount.get(id);
        if (!account) {
            throw new Error("member not found");
        }

        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("member not found");
        }

        //检查是否已经签到
        var signId = this._getSignId(account);
        var hasSign = this.signInMap.get(signId);

        member.hasSign = this.signInMap.get(signId) || 0;

        return member;
    },

    /**
     * 签到记录列表
     */
    signInList: function (limit, page) {

        var total = this.signInCount;

        limit = limit || 50;
        page = page || 1;

        var start = total - limit * page;

        if (start < 0) {
            start = 0
        }

        var end = total - (page - 1) * limit

        var data = [];
        for (var i = start; i < end; i++) {
            var signInLog = this.idToSignInLog.get(i);
            data.push(signInLog);
        }

        var result = {
            data: data,
            total: total
        };

        return result;
    },

};
module.exports = BihuCoffee;