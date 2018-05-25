'use strict'
var UserItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.names = obj.names;
    }
}

UserItem.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
};
var TipItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.from = obj.from;
    }
}

TipItem.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
};

var SpotItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.adress = obj.adress;
        this.detail = obj.detail;
        this.author = obj.author;
        this.time = obj.time ? obj.time : Date.now();
    }
};

SpotItem.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
};

var TheSpot = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new SpotItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "spots");

    LocalContractStorage.defineMapProperty(this, "tips", {
        parse: function (text) {
            return new TipItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "user", {
        parse: function (text) {
            return new UserItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

TheSpot.prototype = {
    init: function () {
        this.spots = "";
    },

    save: function (name, adress, detail) {
        name = name.trim();
        adress = adress.trim();
        var from = Blockchain.transaction.from;
        var letterItem = this.data.get(name);
        if (letterItem && from !== letterItem.from) {
            throw new Error("letter has been occupied");
        };
        if (!letterItem) {
            if (this.spots == "") {
                this.spots = name;
            } else {
                this.spots = this.spots + "~!#$" + name;
            }
        }
        letterItem = new SpotItem();

        letterItem.name = name;
        letterItem.adress = adress;
        letterItem.detail = detail;
        letterItem.author = from;
        letterItem.time = Date.now();

        this.updateUser(name, from);
        this.data.put(name, letterItem);
    },

    get: function (name) {
        if (!name) {
            throw new Error("empty title")
        }
        var rst = this.data.get(name);
        if (rst != null) {
            rst.spot = this.tips.get(name);
            rst.list = this.user.get(rst.author);
        }
        return rst;
    },
    spot: function () {
        return this.spots;
    },
    list: function (page) {
        var arr = [],
            start = (page - 1) * 20,
            end = start + 20;
        var keys = this.spots.split("~!#$");
        var rstKeys = keys.slice(start, end);
        var _this = this,
            _item = {};
        rstKeys.forEach(function (item) {
            if (item && item != 'null') {
                _item = _this.data.get(item);
                _item.spot = _this.getTip(item);
                arr.push(_item);
            }
        });

        return {
            data: arr,
            total: this.spots == "" ? 0 : keys.length
        };
    },
    doTip: function (name) {
        name = name.trim();
        var letterItem = this.tips.get(name),
            _form = [];
        if (letterItem && letterItem.from) {
            _form = letterItem.from;
        } else {
            letterItem = new TipItem();
        }
        var from = Blockchain.transaction.from;
        _form.push({
            from: from,
            time: Date.now()
        });
        letterItem.name = name;
        letterItem.from = _form;

        this.tips.put(name, letterItem);
    },
    getTip: function (name) {
        if (!name) {
            throw new Error("empty title");
        }
        return this.tips.get(name);
    },
    getUserItem: function (from) {
        var userItem = this.user.get(from), names = [];
        if (userItem && userItem.names && userItem.names.constructor == Array) {
            names = userItem.names;
        } else {
            userItem = new UserItem();
        }
        userItem.names = names;
        return userItem;
    },
    getUserList: function (from) {
        var userItem = this.getUserItem(from), rst = [], _this = this;
        userItem.names.forEach(function (name) {
            rst.push({
                info: _this.data.get(name),
                tips: _this.tips.get(name)
            })
        })
        return rst;
    },
    updateUser: function (name, from) {
        var userItem = this.getUserItem(from);
        var names = userItem.names;
        names.push(name);
        userItem.names = names;
        this.user.put(from, userItem);
    }

}
module.exports = TheSpot;


