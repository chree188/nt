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
        this.invite = obj.invite;
        this.lastSignTime = obj.lastSignTime;
        this.votes = obj.votes;
        this.ups = obj.ups;
    } else {
        this.id = -1;
        this.account = "";
        this.username = "";
        this.address = "";
        this.token = 0;
        this.signIn = [];
        this.invite = 0;
        this.lastSignTime = 0;
        this.votes = 0;
        this.ups = 0;
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
        this.ups = obj.ups;
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
        this.ups = [];
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
        gate: null,
    });
};

BihuCoffee.prototype = {

    init: function () {
        this.count = 0;
        this.signInCount = 0;
        this.owner = Blockchain.transaction.from;
        this.totalSupply = 0;
        this.totalBurn = 0;
        this.gate = 0;
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
            totalBurn: this.totalBurn,
            gate: this.gate
        };
        return JSON.stringify(result);
    },

    /**
     * 提现
     */
    withdraw: function (address, value) {
        var current = Blockchain.transaction.from;
        if (current !== this.owner) {
            throw new Error("limited authority");
        }

        var amount = new BigNumber(value);
        var result = Blockchain.transfer(address, amount);
        return result;
    },

    pay: function () {
        //payable, just accept nas
    },

    /**
     * 设置门槛 onlyOwner操作
     */
    setGate: function (gate) {
        var current = Blockchain.transaction.from;
        if (current !== this.owner) {
            throw new Error("limited authority");
        }

        this.gate = gate;
    },

    /**
     * 个人签到记录。分页
     */
    getSignLogsById: function (id, limit, page) {

        var account = this.idToAccount.get(id);

        if (!account) {
            throw new Error("member not found");
        }

        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("member not found");
        }

        var total = member.signIn.length;

        limit = limit || 50;
        page = page || 1;

        var start = total - limit * page;

        if (start < 0) {
            start = 0
        }

        var end = total - (page - 1) * limit

        var data = [];
        for (var i = start; i < end; i++) {
            var index = member.signIn[i];
            var signInLog = this.idToSignInLog.get(index);
            if (signInLog) {
                signInLog.upCount = signInLog.ups.length;
                data.push(signInLog);
            }
        }

        var result = {
            data: data,
            total: total
        };

        return result;
    },

    /**
     * 会员列表 分页
     */
    getMemberList: function (limit, page) {

        var total = this.count;

        limit = limit || 50;
        page = page || 1;

        var start = total - limit * page;

        if (start < 0) {
            start = 0
        }

        var end = total - (page - 1) * limit

        var data = [];
        for (var i = start; i < end; i++) {
            var account = this.idToAccount.get(i);
            if (account) {
                var member = this.accountToMember.get(account);
                if (member) {
                    data.push(member);
                }
            }
        }

        var result = {
            data: data,
            total: total
        };

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

        if (this.gate > 0) {
            var value = Blockchain.transaction.value;
            var transferValue = new BigNumber(value);
            var gateAmount = new BigNumber(this.gate * 1000000000000000000);
            if (transferValue.lessThan(gateAmount)) {
                throw new Error("please pay enough nas for your first coffee")
            }
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
                    inviter.invite += 1;
                    this.totalSupply += 200;
                    this.accountToMember.set(inviterAccount, inviter);
                }
            }
        }

        this.idToAccount.set(id, account);
        this.accountToMember.set(account, member);
        this.count = this.count + 1;
    },

    /**
     * 改名或个人信息
     */
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

    /**
     * 签到
     */
    signIn: function (mood, title, address) {
        var account = Blockchain.transaction.from;
        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("no a member, register first");
        }

        //1.  检查是否签到过了。 
        var hasSign = this._hasSign(member);

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

        //6. 获得签到奖励 + 50
        member.token += 50;
        this.totalSupply += 50;
        //7. 更新签到时间 签到有16小时冷却周期
        var halfDayColdDown = 3600 * 16;
        member.lastSignTime = Blockchain.transaction.timestamp + halfDayColdDown;
        // save
        this.accountToMember.set(account, member);
        this.signInCount = this.signInCount + 1;
    },

    /**
     * 一个账户是否已经签到, 签到有16小时冷却时间
     */
    _hasSign(member) {
        var lastSignTime = member.lastSignTime;

        var now = Blockchain.transaction.timestamp;

        if (lastSignTime > now) {
            return true;
        }

        return false;
    },

    /**
     * 获取个人信息
    */
    getMyInfo: function (account) {
        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("no a member, register first");
        }

        member.hasSign = this._hasSign(member) ? 1 : 0;

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
            signInLog.upCount = signInLog.ups.length;
            data.push(signInLog);
        }

        var result = {
            data: data,
            total: total
        };

        return result;
    },

    /**
     * 点赞
     */
    star: function (id) {
        // 1. find signInLog
        var signInLog = this.idToSignInLog.get(id);
        if (!signInLog) {
            throw new Error("article no found");
        }

        // 2. find member
        var account = Blockchain.transaction.from;
        var member = this.accountToMember.get(account);
        if (!member) {
            throw new Error("no a member, register first");
        }

        // 3. check up status 
        if (signInLog.ups.indexOf(member.id) > -1) {
            throw new Error("already star this article");
        }

        signInLog.ups.push(member.id);

        // 4. find author
        var author = this.accountToMember.get(signInLog.account);

        if (member.id !== author.id) {
            // 5. add author ups
            author.ups += 1;
            author.token += 5;
            this.totalSupply += 5;
            this.accountToMember.set(signInLog.account, author);

            // 6. add 10 token for vote member
            member.votes += 1;
            member.token += 10;
            this.totalSupply += 10;
            this.accountToMember.set(account, member);
        }

        // 7. save signInLog, member, author 
        this.idToSignInLog.set(id, signInLog);
    }

};
module.exports = BihuCoffee;