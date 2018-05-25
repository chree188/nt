
// TX Hash	7e7bd31ca7f4945075a026e0175990b1f3ce2c833af1348b5a354f36eb0f0b69
// Contract address	n1wuGKgk3KhodpbaBSsW8L5sqfwdEeLdgzH

'use strict';

var ObjectItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.rankList = obj.rankList;
    } else {
        this.rankList = '[]';
    }
};

ObjectItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var CorpseContract = function () {
    LocalContractStorage.defineMapProperty(this, 'commonDB', {
        parse: function (str) {
            return new ObjectItem(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CorpseContract.prototype = {
    init: function () {},
    save: function (score, user) {
        user = user.trim();
        if (score < 0) {
            throw new Error('分数不能为零哦~~');
        }
        var from = Blockchain.transaction.from;
        var item = this.commonDB.get('rank');
        if (!item) {
            item = new ObjectItem(null)
        }
        var rankList = JSON.parse(item.rankList);
        rankList.push({
            score: score,
            user: user,
            from: from
        });
        item.rankList = JSON.stringify(rankList);
        this.commonDB.put('rank', item);
    },
    rank: function () {
        var from = Blockchain.transaction.from;
        var item = this.commonDB.get('rank');
        if (!item) {
            item = new ObjectItem(null)
        }
        return item ? item.toString() : '';
    },
    numberOfrank: function (number) {
        var from = Blockchain.transaction.from;
        var item = this.commonDB.get('rank');
        if (!item) {
            item = new ObjectItem(null)
        }
        var rankList = JSON.parse(item.rankList);
        rankList.sort((a, b) => {
            return parseInt(a.score + '') - parseInt(b.score + '');
        })
        var end = rankList.length > number ? number : rankList.length;
        rankList = rankList.slice(0, end)
        return rankList.length > 0 ? JSON.stringify(rankList) : '';
    }
}

module.exports = CorpseContract;