

// TX Hash	954e58c38eee8388339a77a77f61246390391bb010a47f1ebdde2ef14c239390
// Contract address	n1rPgbGwqbun12qiKbFwvvWaJgTXaB51kdy

'use strict';

var ObjectItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.users = obj.users;
    } else {
        this.users = '[]';
    }
};

ObjectItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ABCGameContract = function () {
    LocalContractStorage.defineMapProperty(this, 'commonDB', {
        parse: function (str) {
            return new ObjectItem(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ABCGameContract.prototype = {
    init: function () {},
    uploadScore: function (score) {
        if (score < 0) {
            throw new Error('分数不能为零哦~~');
        }
        var from = Blockchain.transaction.from;
        var item = this.commonDB.get('history');
        if (!item) {
            item = new ObjectItem(null)
        }
        var users = JSON.parse(item.users);
        users.push({
            score:score,
            user:from
        });
        item.users = JSON.stringify(users);
        item.favNumer = item.favNumer+1;
        this.commonDB.put('history', item);
    },
    rankList: function () {
        var from = Blockchain.transaction.from;
        var item = this.commonDB.get('history');
        if (!item) {
            item = new ObjectItem(null)
        }
        return item ? item.toString() : '';
    }
}

module.exports = ABCGameContract;

