"use strict";

var NovelItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.subject = obj.subject; // 主题
        this.title = obj.title; // 小说名称
        this.content = obj.content; // 小说内容
        this.time = obj.time; // 小说创建时间戳，秒数
        this.creatorAddress = obj.creatorAddress;
        this.authors = obj.authors; // array of authors

        this.numOfAgree = obj.numOfAgree; // 点赞的数量
        this.numOfDiss = obj.numOfDiss; // 踩的数量
        this.agreedUsers = obj.agreedUsers; // 点赞的用户地址列表
        this.disagreedUsers = obj.disagreedUsers; // 踩的用户地址列表

    } else {
        this.subject = '';
        this.title = '';
        this.content = '';
        this.time = 0;
        this.creatorAddress = '';
        this.authors = [];

        this.numOfAgree = 0;
        this.numOfDiss = 0;
        this.agreedUsers = [];
        this.disagreedUsers = [];

    }
};

NovelItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var NovelService = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // novelSubject => novelItem
    LocalContractStorage.defineMapProperty(this, "novelRepo", {
        parse: function (text) {
            return new NovelItem(text);
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

NovelService.prototype = {
    init: function () {
        this.data.set("owner", Blockchain.transaction.from); // 合约所有者
        this.data.set('novelSubjectList', []); // 所有小说的subject列表
        // TODO: board
    },

    getOwner: function () {
        return this.data.get('owner');
    },

    getNovels: function () {
        var items = this.data.get('novelSubjectList');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var novel = this.novelRepo.get(items[i]);
            if (novel) {
                result.push(novel);
            }
        }
        return result;
    },

    listNovels: function(offset, limit) {
        var items = this.data.get('novelSubjectList');
        items = items.slice(offset, offset+limit);
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var novel = this.novelRepo.get(items[i]);
            if (novel) {
                result.push(novel);
            }
        }
        return result;
    },

    //创建新小说
    createNovel: function(title,subject,content) {

        var novelSubjects = this.data.get('novelSubjectList');
        for(const theme in novelSubjects){
            if(subject==theme){
                throw new Error("已存在该类型的小说了！");
            }
        }
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;

        var novelItem = new NovelItem();
        novelItem.title = title;
        novelItem.subject = subject;
        novelItem.content = content;
        novelItem.creatorAddress = from;
        novelItem.authors = [from];
        novelItem.time = time;
        this.novelRepo.set(subject, novelItem);

        novelSubjects.push(subject);
        this.data.set('novelSubjectList', novelSubjects);
    },
    // 更新现有小说
    updatePoetry: function(subject, content) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        if(subject=="" || content=="" ) {
            throw new Error("invalid arguments");
        }
        var novelItem = this.novelRepo.get(subject);
        if(!novelItem) {
            throw new Error("can't find novel of subject : " + subject);
        }
        novelItem.content = novelItem.content + content;
        novelItem.authors.push(from);
        this.novelRepo.set(subject, novelItem);

    },

    getPoetryBySubject: function (subject) {
        return this.novelRepo.get(subject);
    },

    votePoetry: function (subject, agree) {
        // 给完成的诗歌投票
        var from = Blockchain.transaction.from;
        var novelItem = this.novelRepo.get(subject);
        if (!novelItem) {
            throw new Error("can't find novel of subject : " + subject);
        }
        if (novelItem.agreedUsers.indexOf(from) >= 0 || novelItem.disagreedUsers.indexOf(from) >= 0) {
            throw new Error("you have already voted to this novel！");
        }
        if (agree) {
            novelItem.agreeCount += 1;
            novelItem.agreedUsers.push(from);
        } else {
            novelItem.disagreeCount += 1;
            novelItem.disagreedUsers.push(from);
        }
        this.novelRepo.set(novelItem.subject, novelItem);
    }
};
module.exports = NovelService;
