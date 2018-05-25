'use strict';
var result = {
    one: {
        type: 'yi',
        text: 'æ¨è®¤ä¸ºâä½é£é©âæ¯æèµçç¬¬ä¸è¦ä¹ãååå³æ³¨æ¬éï¼ä¸æ¿ææ¿åé£é©èå¸¦æ¥çé«æ¶çã'
    },
    two: {
        type: 'er',
        text: 'æ¨å¯¹æèµçé£é©ååæ¥é½ææ·±å»çäºè§£ï¼æ¨æ´æ¿æç¨è¾å°çé£é©æ¥è·å¾ç¡®å®çæ¶çã'
    },
    three: {
        type: 'san',
        text: 'æ¨æä¸å®çé£é©åå¥½ï¼æ¨å¯¹æèµçæææ¯ç¨éåº¦çé£é©æ¢ååççåæ¥ã'
    },
    four: {
        type: 'si',
        text: 'æ¨çé£é©åå¥½åé«ï¼ä½æ¯è¿æ²¡æè¾¾å°ç­ç±é£é©çå°æ­¥ï¼æ¨ææç¨ä¸å®çé£é©æ¢åè¾é«çåæ¥ã'
    },
    five: {
        type: 'wu',
        text: 'æ¨æç½é«é£é©é«åæ¥ãä½é£é©ä½åæ¥çæèµå®å¾ãæ¨å¯è½è¿å¹´è½»ï¼å¯¹æªæ¥çæ¶å¥ååä¹è§ã'
    }
};

var RiskItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.type = obj.type;
        this.author = obj.author;
    }
};

RiskItem.prototype = {
    toString: function() {
        return JSON.stringify(this)
    }
};

var TheRisk = function() {
    LocalContractStorage.defineMapProperty(this, "data", {
        pares: function(text) {
            return new RiskItem(text)
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "resultMap");
};

TheRisk.prototype = {
    init: function() {
        this.resultMap.set("one", result.one);
        this.resultMap.set("two", result.two);
        this.resultMap.set("three", result.three);
        this.resultMap.set("four", result.four);
        this.resultMap.set("five", result.five);
    },
    save: function(grade) {
        var typeText = 'yi';
        switch (true) {
            case (grade <= 18):
                typeText = "yi";
                break;
            case (grade >= 19 && grade <= 26):
                typeText = "er";
                break;
            case (grade >= 27 && grade <= 35):
                typeText = "san";
                break;
            case (grade >= 36 && grade <= 42):
                typeText = "si";
                break;
            case (grade >= 43):
                typeText = "yi";
                break;
            default:
                typeText = "wu";
                break;
        }
        var from = Blockchain.transaction.from;
        var riskItem = new RiskItem();
        riskItem.from = from;
        riskItem.type = typeText;
        riskItem.grade = grade;
        this.data.put(from, riskItem);
    },
    get: function(grade) {
        switch (true) {
            case (grade <= 18):
                return this.resultMap.get("one");
            case (grade >= 19 && grade <= 26):
                return this.resultMap.get("two");
            case (grade >= 27 && grade <= 35):
                return this.resultMap.get("three");
            case (grade >= 36 && grade <= 42):
                return this.resultMap.get("four");
            case (grade >= 43):
                return this.resultMap.get("five");
            default:
                return this.resultMap.get("one");
        }
    },
    search: function(from) {
        return this.data.get(from);
    }
};

module.exports = TheRisk;