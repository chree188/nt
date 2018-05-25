"use strict";

var MusicContract = function () {
    // 所有用户真实存储的乐谱
    LocalContractStorage.defineMapProperty(this, "userMusic");
    // 所有用户存储的个人乐谱数量
    LocalContractStorage.defineMapProperty(this, "userMusicSize");
    // 总条目
    LocalContractStorage.defineProperty(this, "size");
};

MusicContract.prototype = {
    init: function () {
        this.size = 0;
    },
    /**
     * @param limit  查询条数
     * @param offset 偏移量，开始条目
     */
    getUserMusic: function (limit, offset, userid) {
        if(!userid) {
            userid = Blockchain.transaction.from;
        }
        var total = this.userMusicSize.get(userid);
        if (total === undefined) {
            total = 0;
        }
        total *= 1;
        if(limit === undefined) {
            limit = total;
        }
        if(offset === undefined) {
            offset = 0;
        }
        var number = offset + limit;
        var result = {
            total: 0,
            data: [],
        }
        for(var i = 0; i < number; i++) {
            var key = userid + '.' + i;
            var value = this.userMusic.get(key);
            if(value) {
                result.data.push(value);
            }
        }
        result.total = result.data.length;
        return result;
    },

    saveMusic: function(value) {
        var fromUser = Blockchain.transaction.from;
        if(!value) {
            return new Error('404');
        }
        var userSize = this.userMusicSize.get(fromUser);
        if(userSize === undefined) {
            userSize = 0;
        }
        userSize *= 1;
        var userKey = fromUser + '.' + userSize;
        this.userMusic.set(userKey, value);
        userSize += 1;
        this.size += 1;
        this.userMusicSize.set(fromUser, userSize);
    },
};
module.exports = MusicContract;