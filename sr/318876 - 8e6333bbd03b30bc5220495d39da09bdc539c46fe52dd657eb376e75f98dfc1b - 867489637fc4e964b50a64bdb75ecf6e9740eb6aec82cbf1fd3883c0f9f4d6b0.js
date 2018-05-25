

// TX Hash	5fe52cea09170b54722acde91d8be3d85e27ffb5ba5675937344401262e43f76
// Contract address	n1qDa7VRDPEtdYSvjvMLikSVpxJt6JZwijh

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
            return parseInt(b.score + '') - parseInt(a.score + '');
        })
        var end = rankList.length > number ? number : rankList.length;
        rankList = rankList.slice(0, end)
        return rankList.length > 0 ? JSON.stringify(rankList) : '';
    }
}

module.exports = CorpseContract;