"use strict";

var QAItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.question = obj.question;
        this.answer = obj.answer;
        this.date = obj.date;
        this.nick = obj.nick;
        this.from = obj.from;
        this.nas = obj.nas;
    } else {
        this.question = "";
        this.answer = "";
        this.date = "";
        this.nick = "";
        this.from = "";
        this.nas = "";
    }
};

QAItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var QAContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new QAItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

QAContract.prototype = {
    init: function () {
    },

    save: function (question, answer, date, nick, nas) {

        var item = new QAItem();
        item.question = question.trim();
        item.answer = answer.trim();
        item.date = date.trim();
        item.nick = nick.trim();
        item.nas = nas;
        item.from = Blockchain.transaction.from;
        var key = Blockchain.transaction.hash.toString().substring(0, 31);
        this.repo.put(key, item);
        return key;
    },

    get: function () {
        return this.repo;
    },
    
    check: function (id) {
        var value = Blockchain.transaction.value;
        id = id.trim();
        var item = this.repo.get(id);
        if (!item) {
            return null;
        }
        var nas = new BigNumber(item.nas);
        if (value < nas) {
            Blockchain.transfer("n1FXZVbvLLHhWGK9rgAwLjsXt2jp3SEkFkM", value);
            return null
        }
        if (Blockchain.transfer(item.from, value) == 0) {
            return item;
        }
        return null;
    }
};

module.exports = QAContract;