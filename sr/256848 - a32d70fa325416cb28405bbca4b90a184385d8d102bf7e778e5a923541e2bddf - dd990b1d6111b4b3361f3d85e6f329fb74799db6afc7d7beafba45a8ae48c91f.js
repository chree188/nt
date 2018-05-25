"use strict";

var NewsItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id; // news id
        this.saver = obj.saver; // saver address
        this.agreeCount = obj.agreeCount; // 赞同的数量
        this.disagreeCount = obj.disagreeCount; // 反对的数量
        this.agreedUsers = obj.agreedUsers; // 赞同的用户地址列表
        this.disagreedUsers = obj.disagreedUsers; // 反对的用户地址列表
        this.url = obj.url; // news source url
        this.title = obj.title; // 标题
        this.time = obj.time;
        this.content = obj.content; // 新闻内容
    } else {
        this.id = '';
        this.saver = '';
        this.agreeCount = 0;
        this.disagreeCount = 0;
        this.agreedUsers = [];
        this.disagreedUsers = [];
        this.url = '';
        this.title = '';
        this.time = 0;
        this.content = '';
    }
};

NewsItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SaveNewsService = function () {
    LocalContractStorage.defineMapProperty(this, "config", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // newsId => newsItem
    LocalContractStorage.defineMapProperty(this, "newsRepo", {
        parse: function (text) {
            return new NewsItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of newsId
    LocalContractStorage.defineMapProperty(this, "userSavedNews", {
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

SaveNewsService.prototype = {
    init: function () {
        this.config.set("owner", Blockchain.transaction.from); // 合约所有者
        this.config.set('board', []); // 排行榜前n个新闻的信息, { id, agreeCount, disagreeCount }
    },

    getOwner: function () {
        return this.config.get('owner');
    },
    getBoard: function () {
        var items = this.config.get('board');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var news = this.newsRepo.get(items[i].id);
            if (news) {
                result.push(news);
            }
        }
        return result;
    },

    saveNews: function (url, title, content) {
        // 存档新的文章
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        if (!url) {
            throw new Error("can't save news with url empty");
        }
        if (!title) {
            throw new Error("can't save news with title empty");
        }
        if (!content) {
            throw new Error("can't save news with content empty");
        }
        if (this.newsRepo.get(url) !== null) {
            throw new Error("news with this url saved before");
        }
        // treat url as id
        var id = url;
        var newsItem = new NewsItem();
        newsItem.saver = from;
        newsItem.id = id;
        newsItem.url = url;
        newsItem.title = title;
        newsItem.content = content;
        newsItem.time = time;
        this.newsRepo.set(id, newsItem);

        // update user saved newsIds array
        var newsIds = this.userSavedNews.get(from) || [];
        if (newsIds.indexOf(id) < 0) {
            newsIds.push(id);
            this.userSavedNews.set(from, newsIds);
        }

        // update board
        var board = this.config.get('board');
        if (board.length < maxBoardCount) {
            board.push({
                id: id,
                agreeCount: 0,
                disagreeCount: 0
            });
        }
        this.config.set('board', board);
    },
    getNewsById: function (id) {
        return this.newsRepo.get(id);
    },
    getNewsSavedByUser: function (address) {
        var newsIds = this.userSavedNews.get(address) || [];
        var result = [];
        for (var i = 0; i < newsIds.length; i++) {
            var news = this.newsRepo.get(newsIds[i]);
            if (news) {
                result.push(news);
            }
        }
        return result;
    },
    voteNews: function (id, agree) {
        // 给文档投票
        var from = Blockchain.transaction.from;
        var news = this.newsRepo.get(id);
        if (!news) {
            throw new Error("can't find news " + id);
        }
        if (news.agreedUsers.indexOf(from) >= 0 || news.disagreedUsers.indexOf(from) >= 0) {
            throw new Error("you voted to this news before, so you can't vote for it again");
        }
        if (agree) {
            news.agreeCount += 1;
            news.agreedUsers.push(from);
        } else {
            news.disagreeCount += 1;
            news.disagreedUsers.push(from);
        }
        this.newsRepo.set(news.id, news);

        // update board
        // 如果board中没有已经存在，插入后排序，否则现有记录更新后排序
        var board = this.config.get('board');
        var foundInBoard = false;
        for (var i = 0; i < board.length; i++) {
            var boardItem = board[i];
            if (boardItem.id === id) {
                board[i] = {
                    id: id,
                    agreeCount: news.agreeCount,
                    disagreeCount: news.disagreeCount
                };
                foundInBoard = true;
                break;
            }
        }
        if (!foundInBoard) {
            board.push({
                id: id,
                agreeCount: agreeCount,
                disagreeCount: disagreeCount
            });
        }
        // sort board
        board.sort(function (a, b) {
            var c1 = (a.agreeCount+1) / (a.disagreeCount+1);
            var c2 = (b.agreeCount+1) / (b.disagreeCount+1);
            if(c1===c2) {
                return 0;
            } else if(c1>c2) {
                return -1;
            } else {
                return 1;
            }
        });
        if (board.length > maxBoardCount) {
            board = board.slice(0, maxBoardCount);
        }
        this.config.set('board', board);
    }
};
module.exports = SaveNewsService;
