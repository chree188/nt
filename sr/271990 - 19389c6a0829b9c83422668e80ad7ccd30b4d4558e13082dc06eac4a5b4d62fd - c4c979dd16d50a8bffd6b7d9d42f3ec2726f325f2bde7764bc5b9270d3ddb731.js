"use strict";

var MoodItem = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.theme  = o.theme;
        this.time = o.time;
        this.picCode = o.picCode;
        this.description = o.description;
        this.author = o.author;
    } else {
        this.theme  = "";
        this.time = "";
        this.picCode = "";
        this.description = "";
        this.author = "";
    }
};

MoodItem.prototype = {
    toString : function() {
        return JSON.stringify(this);
    }
};

var StrangerMoodContract = function () {
    LocalContractStorage.defineMapProperty(this, "moodItem", {
        parse: function(text) {
            return new MoodItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "itemIndex");
    LocalContractStorage.defineProperty(this, "height");
    LocalContractStorage.defineMapProperty(this, "authorMoodItems");
};

StrangerMoodContract.prototype = {
    init: function() {
        this.height = 0;
    },

    save: function (theme, time, picCode, description) {
        theme = theme.trim();
        time = time.trim();
        picCode = picCode.trim();
        description = description.trim();
        if (theme === "" || time === "" || picCode === "") {
            throw new Error("empty theme / time / picCode");
        }
        if (theme.length > 128){
            throw new Error("theme exceed limit length");
        }

        var from = Blockchain.transaction.from;
        var moodItem = this.moodItem.get(theme);
        if(moodItem) {
            throw new Error("theme has been occupied");
        }

        moodItem = new MoodItem();
        moodItem.author = from;
        moodItem.theme = theme;
        moodItem.time = time;
        moodItem.picCode = picCode;
        moodItem.description = description;

        this.moodItem.put(theme + from, moodItem);

        var index = this.height;
        this.itemIndex.put(index, theme + from);
        var authorMoodItems = this.authorMoodItems.get(from);
        if (authorMoodItems) {
            authorMoodItems.push(index);
        } else {
            authorMoodItems = [];
            authorMoodItems.push(index);
        }
        this.authorMoodItems.put(from, authorMoodItems);

        this.height += 1;
    },

    get: function (theme) {
        theme = theme.trim();
        if (theme === "") {
            throw new Error("empty theme");
        }
        if (theme.length > 64){
            throw new Error("theme exceed limit length");
        }
        var from = Blockchain.transaction.from;

        return this.moodItem.get(theme + from);
    },

    getTotalPages: function(pageSize) {
        var height = this.height;
        var totalPages = height / pageSize + 1;
        return parseInt(totalPages);
    },

    getByPage: function (page, pageSize) {
        // var p = new BigNumber(page);
        // var size = new BigNumber(pageSize);
        var p = page;
        var size = pageSize;
        var height = this.height;
        var totalPages = parseInt(height / size + 1);
        if (p < 1 || size < 1 || size > 100) {
            throw new Error("page / page_size error");
        }
        if (p > totalPages) {
            throw new Error("page is too large");
        }
        
        var result = [];
        var i = (p - 1) * size;
        var tempSize = i + size;
        if (p == totalPages) {
            //if it is the last page, the size should be :
            tempSize = height;
        }
        for (; i < tempSize; i ++) {
            var themeFrom = this.itemIndex.get(i);
            if (themeFrom != null && themeFrom !== "") {
                var obj = this.moodItem.get(themeFrom);
                var temp = {
                    index: i,
                    theme: themeFrom,
                    moodItem: obj
                };
                result.push(temp);
            }
        }

        return result;
        //return JSON.parse(JSON.stringify(result));
    },

    getByThemeLike: function (theme, pageSize) {
        theme = theme.trim();
        if (theme === "" || pageSize < 1) {
            throw new Error("empty theme / pageSize not allowed");
        }
        var indexArr = [];
        for (var i = 0; i < this.height; i ++) {
            var t = this.itemIndex.get(i);
            if (t != null && t !== "") {
                if (t.search(theme) != -1) {
                    indexArr.push(i);
                }
            }
        }

        if (indexArr.length > pageSize) {
            for (var i = 0; i < indexArr.length; i ++) {
                var rand = parseInt(Math.random()*indexArr.length);
                var t = indexArr[rand];
                indexArr[rand] = indexArr[i];
                indexArr[i] = t;
            }
        }

        var result = [];
        for (var i = 0; i < pageSize; i ++) {
            var tt = this.itemIndex.get(indexArr[i]);
            if (tt != null && tt !== "") {
                var obj = this.moodItem.get(tt);
                var temp = {
                    index: i,
                    theme: tt,
                    moodItem: obj
                };
                result.push(temp);
            }
        }

        return result;
    },

    getByAuthor: function (author, pageSize) {
        author = author.trim();
        if (author === "" || pageSize < 1) {
            throw new Error("empty author / pageSize not allowed");
        }
        
        var indexArr = this.authorMoodItems.get(author);
        if (!indexArr) {
            return [];
        }

        if (indexArr.length > pageSize) {
            for (var i = 0; i < indexArr.length; i ++) {
                var rand = parseInt(Math.random()*indexArr.length);
                var t = indexArr[rand];
                indexArr[rand] = indexArr[i];
                indexArr[i] = t;
            }
        }
        
        var result = [];
        for (var i = 0; i < pageSize; i ++) {
            var tt = this.itemIndex.get(indexArr[i]);
            if (tt != null && tt !== "") {
                var obj = this.moodItem.get(tt);
                var temp = {
                    index: i,
                    theme: tt,
                    moodItem: obj
                };
                result.push(temp);
            }
        }

        return result;
    },

    getByKeyword: function (keyword, pageSize) {
        keyword = keyword.trim();
        if (keyword === "" || pageSize < 1) {
            throw new Error("empty keyword / pageSize not allowed");
        }

        var indexArr = [];
        var valid = Blockchain.verifyAddress(keyword);
        if (valid == 0) { //simple keyword
            for (var i = 0; i < this.height; i ++) {
                var t = this.itemIndex.get(i);
                if (t != null && t !== "") {
                    if (t.search(keyword) != -1) {
                        indexArr.push(i);
                    }
                }
            }
        } else { //address
            indexArr = this.authorMoodItems.get(keyword);
            if (!indexArr) {
                return [];
            }
        }

        if (indexArr.length > pageSize) {
            for (var i = 0; i < indexArr.length; i ++) {
                var rand = parseInt(Math.random()*indexArr.length);
                var t = indexArr[rand];
                indexArr[rand] = indexArr[i];
                indexArr[i] = t;
            }
        }
        
        var result = [];
        for (var i = 0; i < pageSize; i ++) {
            var tt = this.itemIndex.get(indexArr[i]);
            if (tt != null && tt !== "") {
                var obj = this.moodItem.get(tt);
                var temp = {
                    index: i,
                    keyword: tt,
                    moodItem: obj
                };
                result.push(temp);
            }
        }

        return result;
    }
};

module.exports = StrangerMoodContract;