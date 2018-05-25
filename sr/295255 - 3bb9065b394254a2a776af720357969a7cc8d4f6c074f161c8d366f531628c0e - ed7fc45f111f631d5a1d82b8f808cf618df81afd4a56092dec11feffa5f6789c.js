"use strict";

var Target = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.content = obj.content;
        this.money = obj.money;
        this.value = obj.value;
        this.endTime = obj.endTime;
        this.creator = obj.creator;
        this.monitors = obj.monitors;
        this.id = obj.id;
        this.state = obj.state; // 0 进行中  -1 失败  1 达成
    } else {
        this.content = "";
        this.money = "";
        this.value = new BigNumber(0);
        this.endTime = "";
        this.creator = "";
        this.monitors = "";
        this.id = "";
        this.state = "";
    }
};

var DepositeContent = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.balance = new BigNumber(o.balance); //余额信息
        this.address = o.address;
    } else {
        this.balance = new BigNumber(0);
        this.address = "";
    }
};

Target.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

DepositeContent.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var MonitorTool = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new Target(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "targetSize");
    LocalContractStorage.defineMapProperty(this, "creatorMap");
    LocalContractStorage.defineMapProperty(this, "creatorIds");
    LocalContractStorage.defineMapProperty(this, "monitorMap");
    LocalContractStorage.defineMapProperty(this, "monitorIds");
    LocalContractStorage.defineMapProperty(this, "bankVault", {
        parse: function(text) {
            return new DepositeContent(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

MonitorTool.prototype = {
    init: function() {
        this.targetSize = 0;
    },

    add: function(content, money,endTime, monitors) {
        var creator = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        value = new BigNumber(value);

        //更新创建目标者存款
        var orig_deposit = this.bankVault.get(creator);
        if (orig_deposit) {
            value = value.plus(orig_deposit.balance);
        }
        var deposit = new DepositeContent();
        deposit.balance = value;
        deposit.address = creator;
        this.bankVault.put(creator, deposit);

        var target = new Target();
        target.content = content;
        target.value = value;
        target.money = money;
        target.endTime = endTime;
        target.creator = creator;
        target.monitors = monitors;
        target.state = 0;
        target.id = this.targetSize;
        this.repo.put(this.targetSize, target);
        this.targetSize++;

        var creatorNum = this.creatorMap.get(creator);
        if (creatorNum) {
            this.creatorMap.put(creator, creatorNum + 1);
        } else {
            this.creatorMap.put(creator, 1);
            creatorNum = 0;
        }

        var keyCreator = creator + ":" + creatorNum;

        this.creatorIds.put(keyCreator, target.id);

        var monitors = monitors.split(",");

        for (var i = 0; i < monitors.length; i++) {
            var cur = monitors[i];
            var monitorNum = this.monitorMap.get(cur);
            if (monitorNum) {
                this.monitorMap.put(cur, monitorNum + 1);
            } else {
                this.monitorMap.put(cur, 1);
                monitorNum = 0;
            }

            var keyMonitor = cur + ":" + monitorNum;

            this.monitorIds.put(keyMonitor, target.id);
        }
    },

    getCreatorLen: function() {
        var from = Blockchain.transaction.from;
        var len = this.creatorMap.get(from);
        if (len) {
            return {
                "len": len,
                "from": from
            };
        } else {
            return {
                "len": 0,
                "from": from
            };
        }
    },

    getCreatorId: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.creatorIds.get(key);
    },

    getMonitorLen: function() {
        var from = Blockchain.transaction.from;
        var len = this.monitorMap.get(from);
        if (len) {
            return {
                "len": len,
                "from": from
            };
        } else {
            return {
                "len": 0,
                "from": from
            };
        }
    },

    getMonitorId: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.monitorIds.get(key);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },

    markOk: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        var target = this.repo.get(key);
        target.state = 1;
        this.repo.put(target.id, target);
        var orig_deposit = this.bankVault.get(target.creator);
        var deposit = new DepositeContent();
        deposit.balance = orig_deposit.balance.sub(target.value);
        deposit.address = target.creator;
        this.bankVault.put(target.creator, deposit);
        this.transfer(target.creator, target.value);
    },

    balanceOf: function() {
        var from = Blockchain.transaction.from;
        return this.bankVault.get(from);
    },

    transfer: function(address, value) {
        var result = Blockchain.transfer(address, value);
        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value
            }
        });
    },

    markWrong: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        var target = this.repo.get(key);
        target.state = -1;
        this.repo.put(target.id, target);
        var orig_deposit = this.bankVault.get(target.creator);
        var deposit = new DepositeContent();
        deposit.balance = orig_deposit.balance.sub(target.value);
        deposit.address = target.creator;
        this.bankVault.put(target.creator, deposit);
        var monitors = target.monitors.split(",");
        var money = new BigNumber(target.value);
        var share = money.dividedToIntegerBy(monitors.length);
        for (var i = 0; i < monitors.length; i++) {
            this.transfer(monitors[i], share);
        }
    }
};
module.exports = MonitorTool;