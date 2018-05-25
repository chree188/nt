"use strict";

var PoetryItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id; // use tx id as poetry id
        this.creatorAddress = obj.creatorAddress;
        this.agreeCount = obj.agreeCount; // 点赞的数量
        this.disagreeCount = obj.disagreeCount; // 踩的数量
        this.agreedUsers = obj.agreedUsers; // 点赞的用户地址列表
        this.disagreedUsers = obj.disagreedUsers; // 踩的用户地址列表
        this.content = obj.content; // 诗句内容
        this.maxLength = obj.maxLength; // 诗句最大长度（格式）
        this.nowLength = obj.nowLength; // 当前长度
        this.sentencesCount = obj.sentencesCount; // 子句的数量
        this.authors = obj.authors; // array of authors
        this.subject = obj.subject; // 主题
        this.title = obj.title; // 诗名
        this.time = obj.time; // 创建时间戳，秒数
        this.finished = obj.finished; // 是否完成
    } else {
        this.id = '';
        this.creatorAddress = '';
        this.agreeCount = 0;
        this.disagreeCount = 0;
        this.agreedUsers = [];
        this.disagreedUsers = [];
        this.content = '';
        this.maxLength = 0;
        this.nowLength = 0;
        this.sentencesCount = 0;
        this.authors = [];
        this.subject = '';
        this.title = '';
        this.time = 0;
        this.finished = false;
    }
};

PoetryItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PoetryService = function () {
    LocalContractStorage.defineMapProperty(this, "config", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // poetryId => poetryItem
    LocalContractStorage.defineMapProperty(this, "poetryRepo", {
        parse: function (text) {
            return new PoetryItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of poetryId
    LocalContractStorage.defineMapProperty(this, "userCreatedPoetriesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isDigit(str) {
    return str.length === 1 && str.match(/\d/i);
}

var maxBoardCount = 1000;

PoetryService.prototype = {
    init: function () {
        this.config.set("owner", Blockchain.transaction.from); // 合约所有者
        this.config.set('poetries', []); // 所有诗词的id列表
        this.config.set('finishedPoetries', []); // 完成了的诗词的id列表
        // TODO: board
    },

    getOwner: function () {
        return this.config.get('owner');
    },
    getPoetries: function () {
        var items = this.config.get('poetries');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var poetry = this.poetryRepo.get(items[i]);
            if (poetry) {
                result.push(poetry);
            }
        }
        return result;
    },
    listPoetries: function(offset, limit) {
        var items = this.config.get('poetries');
        items = items.slice(offset, offset+limit);
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var poetry = this.poetryRepo.get(items[i]);
            if (poetry) {
                result.push(poetry);
            }
        }
        return result;
    },
    getFinishedPoetries: function () {
        var items = this.config.get('finishedPoetries');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var poetry = this.poetryRepo.get(items[i]);
            if (poetry) {
                result.push(poetry);
            }
        }
        return result;
    },
    // 创建新诗歌
    createPoetry: function(subject, title, maxLength, sentencesCount, char) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        if(!subject || !title || maxLength<2 || sentencesCount<1 || sentencesCount>100 || !char || char.length!==1) {
            throw new Error("invalid arguments");
        }
        
        var poetryItem = new PoetryItem();
        poetryItem.id = id;
        poetryItem.subject = subject;
        poetryItem.title = title;
        poetryItem.creatorAddress = from;
        poetryItem.authors = [from];
        poetryItem.maxLength = maxLength;
        poetryItem.nowLength = 1;
        poetryItem.content = char;
        poetryItem.time = time;
        poetryItem.finished = false;
        poetryItem.sentencesCount = sentencesCount;
        this.poetryRepo.set(id, poetryItem);

        var userCreatedPoetries = this.userCreatedPoetriesRepo.get(from) || [];
        userCreatedPoetries.push(id);
        this.userCreatedPoetriesRepo.set(from, userCreatedPoetries);

        var poetriesIds = this.config.get('poetries');
        poetriesIds.push(id);
        this.config.set('poetries', poetriesIds);
    },
    // 更新现有诗歌
    updatePoetry: function(id, char) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        if(!id || char.length !== 1) {
            throw new Error("invalid arguments");
        }
        var peotryItem = this.poetryRepo.get(id);
        if(!peotryItem) {
            throw new Error("can't find peotry " + id);
        }
        if(peotryItem.finished) {
            throw new Error("this peotry finished before, can't update it");
        }
        if(peotryItem.authors.indexOf(from)>=0) {
            throw new Error("you can't write in one poetry twice");
        }
        peotryItem.content = peotryItem.content + char;
        peotryItem.nowLength += 1;
        peotryItem.authors.push(from);
        if(peotryItem.nowLength>=peotryItem.maxLength) {
            peotryItem.finished = true;
        }
        this.poetryRepo.set(id, peotryItem);
        if(peotryItem.finished) {
            var finishedPoetries = this.config.get('finishedPoetries');
            finishedPoetries.push(id);
            this.config.set('finishedPoetries', finishedPoetries);
        }
    },
    
    getPoetryById: function (id) {
        return this.poetryRepo.get(id);
    },
    getPoetriesSavedByUser: function (address) {
        var itemIds = this.userCreatedPoetriesRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var poetry = this.poetryRepo.get(itemIds[i]);
            if (poetry) {
                result.push(poetry);
            }
        }
        return result;
    },
    votePoetry: function (id, agree) {
        // 给完成的诗歌投票
        var from = Blockchain.transaction.from;
        var peotryItem = this.poetryRepo.get(id);
        if (!peotryItem) {
            throw new Error("can't find peotry " + id);
        }
        if(!peotryItem.finished) {
            throw new Error("this peotry is not finished, you can't vote for it");
        }
        if (peotryItem.agreedUsers.indexOf(from) >= 0 || peotryItem.disagreedUsers.indexOf(from) >= 0) {
            throw new Error("you voted to this peotry before, so you can't vote for it again");
        }
        if (agree) {
            peotryItem.agreeCount += 1;
            peotryItem.agreedUsers.push(from);
        } else {
            peotryItem.disagreeCount += 1;
            peotryItem.disagreedUsers.push(from);
        }
        this.poetryRepo.set(peotryItem.id, peotryItem);
    }
};
module.exports = PoetryService;
