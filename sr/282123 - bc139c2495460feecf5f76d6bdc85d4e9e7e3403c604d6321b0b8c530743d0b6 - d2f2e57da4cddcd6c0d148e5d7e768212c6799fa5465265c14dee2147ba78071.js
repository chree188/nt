'use strict'

var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.cnum = obj.cnum;
        this.ctype = obj.ctype;
        this.character = 1;
    } else {
        this.cnum = "";
        this.ctype = "";
        this.character = 1;
    }
    this.status = "雏鸡饲养中";
    this.stage = {
        "stage1": [],
        "stage2": [],
        "stage3": [],
        "stage4": [],
        "stage5": [],
        "stage6": [],
        "stage7": [],
    }
};

DictItem.prototype = {

    toString: function() {
        return JSON.stringify(this);
    }
};
var ChickenInfo = function(text) {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new DictItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};
ChickenInfo.prototype = {
    init: function() {
        // todo
        this.size = 0;
    },
    addinfo: function(cnum, time, character, company, status, content) {
        var number = this.size;
        var result = [];
        for (var i = 0; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            if (key == cnum) {
                result = object
            }
        }
        var info = {
            "time": time,
            "status": status,
            "company": company,
            "content": content,
        }
        result.status = status;
        result.character = character;
        switch (character) {
            case '1':
                result.stage.stage1.push(info);
                break;
            case '2':
                result.stage.stage2.push(info);
                break;
            case '3':
                result.stage.stage3.push(info);
                break;
            case '4':
                result.stage.stage4.push(info);
                break;
            case '5':
                result.stage.stage5.push(info);
                break;
            case '6':
                result.stage.stage6.push(info);
                break;
            case '7':
                result.stage.stage7.push(info);
                break;
        }
        this.dataMap.set(cnum, result);
    },
    search: function(cnum) {
        var number = this.size;
        var result = [];
        for (var i = 0; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            if (key == cnum) {
                result.push(object)
            }
        }
        if (result == "") {
            throw new Error("无相关数据")
        } else {
            return result;
        }
    },
    newinfo: function(cnum, ctype, time, company, content) {
        var dictItem = new DictItem();
        dictItem.cnum = cnum;
        dictItem.ctype = ctype;
        dictItem.character = 1;
        dictItem.stage.stage1.push({
            "time": time,
            "status": "雏鸡饲养中",
            "company": company,
            "content": content,
        })
        this.repo.put(cnum, dictItem);
        var index = this.size;
        this.arrayMap.set(index, cnum);
        this.dataMap.set(cnum, dictItem);
        this.size += 1;
    },
    forEach: function(limit) {
        limit = parseInt(limit);
        var number = this.size;
        var result = [];
        for (var i = 0; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result.push(object)
        }
        return result;
    }
};
module.exports = ChickenInfo;