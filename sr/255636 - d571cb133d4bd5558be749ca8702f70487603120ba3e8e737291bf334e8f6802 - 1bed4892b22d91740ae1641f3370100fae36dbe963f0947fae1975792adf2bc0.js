"use strict";

// 猫咪记录
var Cat = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.url = obj.url;
        this.word = obj.word;
        this.name = obj.name;
    } else {
        this.address = "";
        this.url = "";
        this.word = "";
        this.name = "";
    }
};


Cat.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var CatContract = function() {

    LocalContractStorage.defineMapProperty(this, "each", {
        parse: function(text) {
            return new Cat(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

CatContract.prototype = {
    init: function() {

    },

    save: function(url,name, word) {

        url = url.trim();
        word = word.trim();
        if (url === "" || word === "") {
            throw new Error("empty url / word");
        }
        if (url.length > 128 || word.length > 128) {
            throw new Error("url / word exceed limit length")
        }

        var from = Blockchain.transaction.from;
        // 新增
        var cat = new Cat();
        cat.url = url;
        cat.word = word;
        cat.name = name;
        cat.address = from;

        this.each.put(from, cat);

        //龙虎榜排名
        var ranks = LocalContractStorage.get("ranks");
        if (!ranks) {
            ranks = new Array();
        }

        var inRank = false;
        var lth = ranks.length;
        console.log("ranks.length=" + lth);


        if (!inRank) {
            // 未有猫咪数组，新增
            ranks.push(cat);
        }
        LocalContractStorage.set("ranks", ranks);

        return this.each.get(from);
    },

    getACat: function() {
        // 获取当前猫咪
        var from = Blockchain.transaction.from;
        return this.each.get(from);
    },
    getAllCat: function() {
        // 获取猫咪数据
        var ranks = LocalContractStorage.get("ranks");
        return ranks;
    },
};


module.exports = CatContract;