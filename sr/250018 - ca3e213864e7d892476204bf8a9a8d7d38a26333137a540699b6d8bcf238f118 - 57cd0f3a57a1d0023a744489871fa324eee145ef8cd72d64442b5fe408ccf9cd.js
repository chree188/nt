'use strict';


var BottleContract = function () {
    LocalContractStorage.defineProperties(this, {
        isOpen: null,
        adminAddress: null
    });
    LocalContractStorage.defineMapProperty(this, 'bottles');
    LocalContractStorage.defineProperty(this, "currentBottleId");
};

BottleContract.prototype = {
    init: function () {
        this.isOpen = true;
        this.adminAddress = Blockchain.transaction.from;
        this.currentBottleId = 0;

    },
    getRandomBottle: function () {
        var result;
        //根据已有漂流瓶的数量，产生一个随机数，返回一个
        var random = parseInt(Math.random()*this.currentBottleId);
        result = this.bottles.get(random);
        return result;
    },
    newBottle: function (title, content, author) {
        var bottleId = this.currentBottleId;
        this.currentBottleId = bottleId + 1;
        var id = this.currentBottleId;
        var authorAddress = Blockchain.transaction.from;
        var submitTime = Blockchain.block.timestamp;
        this.bottles.put(id, {
            authorAddress: authorAddress,
            id: id,
            title: title,
            content: content,
            author: author,
            submitTime: submitTime
        });
        return id;
    }
};

module.exports = BottleContract;