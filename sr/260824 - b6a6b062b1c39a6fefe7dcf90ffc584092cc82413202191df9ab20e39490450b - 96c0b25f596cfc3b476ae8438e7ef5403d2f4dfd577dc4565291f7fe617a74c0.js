"use strict";

var WordsContract = function () {
    // 记录留言总数，用于随机返回留言时使用
    LocalContractStorage.defineProperty(this, "amount");
    // 留言字典
    LocalContractStorage.defineMapProperty(this, "wordsMap");
};

WordsContract.prototype = {

    /**
     * 初始化，留言总数为0。
     */
    init: function () {
        this.amount = 0;
    },

    /**
     * 写入留言，长度不得超过100。返回写入结果。
     */
    save: function (value) {
        var content = String(value).trim()
        if(!content){
            throw new Error('留言不得为空')
        }
        if(content.length>100) {
            throw new Error('留言不得超过100字符')
        }
        var data = {
            address: Blockchain.transaction.from,
            time: new Date().getTime(),
            content: content
        };
        this.wordsMap.set(String(this.amount), data);
        this.amount += 1;
    },

    /**
     * 获取一条随机留言
     */
    getRandomWord: function () {
        if (!this.amount) return null;
        // 产生 [0~this.amount) 的随机数
        var randomIndex = Math.floor(Math.random() * this.amount);
        return this.wordsMap.get(String(randomIndex));
    },

    /**
     * 获取总留言数
     */
    wordsAmount: function () {
        return this.amount;
    }

};

module.exports = WordsContract;