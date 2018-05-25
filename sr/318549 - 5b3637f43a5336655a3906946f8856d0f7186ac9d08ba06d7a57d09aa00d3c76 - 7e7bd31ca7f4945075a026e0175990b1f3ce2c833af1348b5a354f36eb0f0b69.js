// TX Hash	1ff2e2289a9dd48b3f35c686fd0833acd7ab9a7df617a09c9b6ed5929b3c9951
// Contract address	n1qz8r6hkKKrRY89jevQAEgfqHHMzAcnPnq

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
        return rankList.length > 0 ? rankList.toString() : '';
    }
}

module.exports = CorpseContract;