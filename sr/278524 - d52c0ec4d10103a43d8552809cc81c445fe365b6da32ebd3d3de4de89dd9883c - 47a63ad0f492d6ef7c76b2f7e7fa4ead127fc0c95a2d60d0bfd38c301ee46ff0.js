//Worry grocer

var SadHelperItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.postmark = obj.postmark;
        this.title = obj.title;
        this.content = obj.content;
        this.date = obj.date;
        this.author = obj.author;
        this.anonymous = obj.anonymous;
        this.reply = obj.reply;
        this.rdate = obj.rdate;
        this.rauthor = obj.rauthor;
        this.Praise = obj.Praise;
    }
};

SadHelperItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TheSadLetter = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new SadHelperItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};


TheSadLetter.prototype = {
    init: function () {
        this.size = 0;
    },

    writeLetter: function (postmark, title, content, date, anonymous) {
        if (!title) {
            throw new Error("empty title");
        }
        if (!content) {
            throw new Error("empty content");
        }

        if (title.length > 100) {
            throw new Error("title too long");
        }
        if (content.length > 10000) {
            throw new Error("content too long");
        }

        var from = Blockchain.transaction.from;

        if (this.data.get(postmark)) {
            throw new Error("have the same problem");
        }

        sadHelperItem = new SadHelperItem();
        sadHelperItem.postmark = postmark;
        sadHelperItem.title = title;
        sadHelperItem.author = from;
        sadHelperItem.content = content;
        if (anonymous) {
            sadHelperItem.anonymous = "realName";
        }
        else {
            sadHelperItem.anonymous = anonymous;
        }

        sadHelperItem.date = date;

        var index = this.size;
        this.dataMap.set(index, postmark);
        this.data.put(postmark, sadHelperItem);
        this.size += 1;
    },

    replyLetter: function (postmark, reply, date) {
        if (!reply) {
            throw new Error("empty reply");
        }

        var from = Blockchain.transaction.from;

        sadHelperItem = this.data.get(postmark);
        sadHelperItem.reply = reply;
        sadHelperItem.rdate = date;
        sadHelperItem.rauthor = from;
        this.data.put(postmark, sadHelperItem);
    },

    praiseReply: function (postmark) {
        sadHelperItem = this.data.get(postmark);
        var praise = 0;
        if (!(sadHelperItem.Praise == null || sadHelperItem.Praise == "")){
            praise = parseInt(sadHelperItem.Praise);
        }

        sadHelperItem.Praise = praise + 1;
        this.data.put(postmark, sadHelperItem);
    },

    getUser: function () {
        var from = Blockchain.transaction.from;
        return from;
    },

    get: function (postmark) {
        if (!postmark) {
            throw new Error("empty postmark");
        }
        return this.data.get(postmark);
    },

    sizeLength: function () {
        return this.size;
    },

    GetAll: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = '[';
        for (var i = offset; i < number; i++) {
            var key = this.dataMap.get(i);
            var object = this.data.get(key);
            if (i == number - 1) {
                result += '{"index":' + i + ',"key":"' + key + '","value":' + object + '}';
            }
            else {
                result += '{"index":' + i + ',"key":"' + key + '","value":' + object + '},';
            }
        }
        return result + ']';
    }
}

module.exports = TheSadLetter;