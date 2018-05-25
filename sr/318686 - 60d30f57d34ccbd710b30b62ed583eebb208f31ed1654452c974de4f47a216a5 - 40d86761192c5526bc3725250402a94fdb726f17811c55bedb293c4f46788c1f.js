"use strict";

var ChildItem = function (text) {
    if (text) {
        var value = JSON.parse(text);
        this.name = value.name;
        this.content = value.content;
        this.time = value.time;
        this.author = value.author;
        this.hash = value.hash;
    } else {
        this.name = "";
        this.content = "";
        this.time = ""
        this.author = "";
        this.hash = "";
    }
};

ChildItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ChildContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", null);
    LocalContractStorage.defineProperty(this, "size");

    LocalContractStorage.defineMapProperty(this, "indexArrayMap");
    LocalContractStorage.defineMapProperty(this, "indexDataMap", null);
    LocalContractStorage.defineProperty(this, "indexSize");

    LocalContractStorage.defineMapProperty(this, "indexCategoryArrayMap");
    LocalContractStorage.defineMapProperty(this, "indexCategoryDataMap", null);
    LocalContractStorage.defineProperty(this, "indexCategorySize");

};

ChildContract.prototype = {
    init: function () {
        this.size = 0;
        this.indexSize = 0;
        this.indexCategorySize = 0;
    },

    /**
     * 保存我的育儿心得
     */
    save: function (name, content) {
        name = name.trim();
        content = content.trim();

        if (name === "" || content === "") {
            throw new Error("empty name / content");
        }
        this._saveOfMine(name, content);
    },

    /**
    * 保存我的育儿心得
    */
    _saveOfMine: function (name, content) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;
        this.arrayMap.set(index, from);
        var value = this.dataMap.get(from);
        var result = [];
        var app = new ChildItem();
        app.name = name;
        app.content = content;
        app.time = new Date();
        app.author = from;
        app.hash = hash;
        if (value) {
            result = value;
        } else {
            this.size += 1;
        }
        result.unshift(app);
        this.dataMap.set(from, result);
    },

    /**
     * 通过作者地址查询其下所有育儿心得
     */
    getAllOfMine: function () {
        var author = Blockchain.transaction.from;
        return this.getAllByAuthor(author);

    },

    /**
     * 查询某地址下所有育儿心得
     */
    getAllByAuthor: function (author) {
        if (author === "") {
            throw new Error("地址为空")
        }
        if (!this.verifyAddress(author)) {
            throw new Error("无效地址")
        }
        var result = [];
        if (this.dataMap.get(author)) {
            return this.dataMap.get(author);
        }
        return result;

    },

    /**
     * 验证地址是否有效
     */
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },


    /**
     * 作者人数
     */
    len: function () {
        return this.size;
    },


    /**
     * 分享育儿心得
     */
    share: function (hash) {
        var author = Blockchain.transaction.from;
        hash = hash.trim();

        if (author === "" || hash === "") {
            throw new Error("empty author / hash");
        }
        var object = this.indexDataMap.get(hash);
        if (object) {
            throw new Error("您已经分享过该心得了！");
        }

        var mood = this._findItem(author, hash);
        if (mood) {
            this.saveToIndexCategory(mood);
            this.saveToIndex(mood);
        } else {
            throw new Error("您分享的心得已经不存在了！");
        }
    },

    /**
     * 保存至首页相关联分类，以name作为key，value为该key下所有的心得数组
     */
    saveToIndexCategory: function (mood) {
        var indexCategorySize = this.indexCategorySize;
        var value = this.indexCategoryDataMap.get(mood.name);
        var result = [];
        if (value) {
            result = value;
        } else {
            this.indexCategoryArrayMap.set(indexCategorySize, mood.name);
            this.indexCategorySize += 1;
        }
        result.unshift(mood);
        this.indexCategoryDataMap.put(mood.name, result);
    },

    /**
     * 保存至首页,以hash作为key
     */
    saveToIndex: function (mood) {
        var indexSize = this.indexSize;
        this.indexArrayMap.set(indexSize, mood.hash);
        this.indexDataMap.put(mood.hash, mood);
        this.indexSize += 1;
    },

    /**
     * 寻找特定地址的某一条分享信息
     */
    _findItem: function (author, hash) {
        var array = this.dataMap.get(author);
        var mood;
        if (array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].hash === hash) {
                    mood = array[i];
                    break;
                }
            }
        }
        return mood;
    },

    /**
     * 获取首页分类育儿心得
     */
    getAllByCategory: function (name, limit, offset) {

        var result = [];
        if (offset > this.indexCategorySize) {
            return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset + limit;
        if (number > this.indexCategorySize) {
            number = this.indexCategorySize;
        }
        var array = this.indexCategoryDataMap.get(name);
        if (!array) {
            return result;
        }

        for (var i = offset; i < number; i++) {
            var object = array[i];
            if (object) {
                result.push(object);
            }
        }
        return result;
    },

    /**
     * 获取首页育儿心得
     */
    getAll: function (limit, offset) {
        var result = [];
        if (offset > this.indexSize) {
            return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset + limit;
        if (number > this.indexSize) {
            number = this.indexSize;
        }
        for (var i = offset; i < number; i++) {
            var hash = this.indexArrayMap.get(i);
            var object = this.indexDataMap.get(hash);
            result.unshift(object);
        }
        return result;
    },
    /**
    * 展示所有人的育儿心得
    */
    showAllMood: function (limit, offset) {
        var from = Blockchain.transaction.from;
        if (from !== "n1VkKBBovuGnKF3Snk8arnWWVdiNPmBpffY") {
            throw new Error("您没有此权限");
        }
        var result = [];
        if (offset > this.size) {
            return result;
        }
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit <= 0) {
            limit = 20;
        }
        if (offset < 0) {
            offset = 0;
        }

        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        for (var i = offset; i < number; i++) {
            var author = this.arrayMap.get(i);
            var moodArray = this.dataMap.get(author);
            result = moodArray.concat(result);
        }
        return result;
    },

};
module.exports = ChildContract;




