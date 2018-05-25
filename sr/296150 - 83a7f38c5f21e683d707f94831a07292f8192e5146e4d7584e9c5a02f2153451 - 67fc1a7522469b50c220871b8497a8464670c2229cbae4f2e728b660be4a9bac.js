"use strict";

/**
 * 包含的接口
 * 1：发布脉脉
 * 2：获取分页列表
 * 3：点赞
 * 4：评论
 *
 * @param text
 * @constructor
 */

var MaimaiContractList = function () {

    //定义maimai需要的数据结构
    LocalContractStorage.defineMapProperty(this, "mmDataMap");

    //key->index，value->key 根据index查找key
    LocalContractStorage.defineMapProperty(this, "mmIndexKeyMap");
    //key->key，value->index 根据key查找index
    LocalContractStorage.defineMapProperty(this, "mmKeyIndexMap");

    LocalContractStorage.defineProperty(this, "mmSize");

    LocalContractStorage.defineMapProperty(this, "commentMap");

    LocalContractStorage.defineMapProperty(this, "commentSizeMap");

    LocalContractStorage.defineMapProperty(this, "mmFavoriteMap");

    LocalContractStorage.defineMapProperty(this, "mmFavoriteSizeMap");

};

MaimaiContractList.prototype = {
    init: function () {
        this.mmSize = 0;
    },

    len: function () {
        return this.mmSize;
    },

    //可以== md5（content）
    saveMaimai: function (key, value) {
        if (key === "") {
            throw new Error("empty key or value");
        }
        var item = this.mmDataMap.get(key);
        if (item) {
            throw new Error("ad contract has already been exist");
        }

        // item = new MaimaiContractItem(value);
        item = value;
        if (!item) {
            throw new Error("invalid value");
        }
        var index = this.mmSize;
        this.mmIndexKeyMap.set(index, key);
        this.mmKeyIndexMap.set(key, index);
        this.mmDataMap.set(key, item);
        this.mmSize += 1;
    },

    /**
     * 返回maimai分页数据，每10条为一页
     * @param pageNumber
     * @returns String
     */
    fetchMaimai: function (pageNumber) {
        var startIndex = this.mmSize - 1 - (pageNumber - 1) * 10;
        var endIndex = Math.max(this.mmSize - 1 - pageNumber * 10 + 1, 0);
        var string = "";
        for (var i = startIndex; i >= endIndex; i--) {
            var key = this.mmIndexKeyMap.get(i);
            var data = this.mmDataMap.get(key);
            if (!data) {
                continue;
            }
            string += data + "nebulas";
        }
        return string.substr(0, string.length - 7);
    },

    /**
     * 删除maimai数据
     * @param key
     * @param address 有权删除的地址
     * @returns {*}
     */
    deletMaimai: function (key, address) {

        if (!this._verifyAddress(address)) {
            return;
        }

        key = key.trim();
        if (key === "") {
            throw new Error("empty key");
        }
        var item = this.mmDataMap.get(key);

        if (!item) {
            throw new Error("maimai not exist");
        }
        this._deletIndex(key);
        return this.mmDataMap.del(key);
    },

    /**
     * 获取某一条maimai
     * @param key
     * @returns {*}
     */
    getMaimaiByKey: function (key) {
        return this._getOneMaimaiContentByKey(key);
    },

    _getOneMaimaiContentByKey: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key");
        }
        var item = this.mmDataMap.get(key);

        if (!item) {
            throw new Error("maimai not exist");
        }
        return item;
    },

    _verifyAddress: function (address) {
        //n1aEoz26oVSawfcrFWYoSGMNgcKp7PpdbZZ
        return Blockchain.transaction.from === address;
    },

    /**
     * 更新某条脉脉，比如点赞，切记，内容不可以更新，只能更新内容以外的数据，比如点赞
     * @param key
     * @param value
     * @param isFavorite 1：加到关注列表 0：不加关注列表 -1：不处理
     */
    updateMaimai: function (key, value, isFavorite) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key");
        }
        var item = this.mmDataMap.get(key);
        if (!item) {
            throw new Error("maimai not exist");
        }
        this.mmDataMap.set(key, value);

        if (isFavorite === "1") {
            this.addFavorite(key);
        } else if (isFavorite === "0") {
            this.delFavoriteWithoutIndex(key);
        }
    },

    /**
     * 删除maimai的相关index
     * @param key
     * @private
     */
    _deletIndex: function (key) {
        if (this.mmSize < 1) {
            return;
        }

        if (this.mmSize === 1) {
            this.mmKeyIndexMap.del(key);
            this.mmIndexKeyMap.del(0);
            return;
        }

        //查找对应的index
        var index = this.mmKeyIndexMap.get(key);
        var keyTemp = "";
        //要删除的index之后的元素，全部往前挪一位
        for (var i = index + 1; i < this.mmSize; i++) {
            keyTemp = this.mmIndexKeyMap.get(i);
            this.mmIndexKeyMap.set(i - 1, keyTemp);
            this.mmKeyIndexMap.set(keyTemp, i - 1);
        }
        //删除当前最后一个数据
        this.mmKeyIndexMap.del(this.mmIndexKeyMap.get(this.mmSize - 1));
        this.mmIndexKeyMap.del(this.mmSize - 1);
        this.mmSize -= 1;
    },

    _getCommentKey: function (key, index) {
        return key + "_comment_" + index;
    },

    /**
     * 获取某条脉脉的评论列表，这里需要分页，每10条数据一页
     * @param keyOfMaimai
     * @param pageNumber
     * @param commentCount
     * @returns String
     */
    getCommentListByKey: function (keyOfMaimai, pageNumber, commentCount) {

        var realLastIndex = commentCount - 1;

        for (var i = 10; i >= 0; i--) {
            var comment = this.commentMap.get(this._getCommentKey(keyOfMaimai, realLastIndex + i));
            if (comment) {
                realLastIndex = realLastIndex + i;
                break;
            }
        }

        //顺序插入，顺序展示
        var startIndex = (pageNumber - 1) * 10;
        var endIndex = Math.min(pageNumber * 10 - 1, realLastIndex);
        var string = "";
        for (i = startIndex; i <= endIndex; i++) {
            var data = this.commentMap.get(this._getCommentKey(keyOfMaimai, i));
            if (!data) {
                continue;
            }
            string += data + "nebulas";
        }
        return string.substr(0, string.length - 7);
    },

    /**
     * 获取指定key的maimai的评论数
     * @param key
     * @returns {number}
     */
    getMaimaiCommentCountBykey: function (key) {
        return this.commentSizeMap.get(key);
    },


    /**
     * 关联某条评论和maimai，同时更新maimai 的数据，这里需要客户端给maimai 评论数 + 1
     * @param keyOfMaimai
     * @param commentValue
     * @param nativeIndex
     * @returns {number}
     */
    saveCommentOfMaimai: function (keyOfMaimai, commentValue, nativeIndex) {
        var maimai = this.mmDataMap.get(keyOfMaimai);
        if (!maimai) {
            throw new Error("can not find such maimai");
        }

        nativeIndex = Number(nativeIndex);
        //最多尝试100次
        var index = Math.max(nativeIndex, 0);

        for (var i = nativeIndex; i < 100 + nativeIndex; i++) {
            index = this._getCommentKey(keyOfMaimai, i);
            var comment = this.commentMap.get(index);
            if (!comment) {
                //空缺，可以添加
                this.commentMap.set(index, commentValue);
                this.commentSizeMap.set(keyOfMaimai, Number(i + 1));
                break;
            }
        }

        this.addFavorite(keyOfMaimai);
        return index;
    },


    /**
     * 加为关注
     * @param key maimai内容的key值
     */
    addFavorite: function (key) {
        this._getOneMaimaiContentByKey(key);
        var tmpKey;
        var user = Blockchain.transaction.from;
        var size = 0;
        size = this.mmFavoriteSizeMap.get(user);
        if (!size) {
            this.mmFavoriteMap.set(this._getFavoriteKey(user, 0), key);
            size = 1;
            this.mmFavoriteSizeMap.set(user, size);
            return "first insert: size = " + this.mmFavoriteSizeMap.get(user) + "; value = " + this.mmFavoriteMap.get(this._getFavoriteKey(user, 0));
        } else {
            for (var i = 0; i < size; i++) {
                tmpKey = this.mmFavoriteMap.get(this._getFavoriteKey(user, i));
                if (tmpKey === key) {
                    return;
                }
            }
            this.mmFavoriteMap.set(this._getFavoriteKey(user, size), key);
            size++;
            this.mmFavoriteSizeMap.set(user, size);
            return "insert: size = " + this.mmFavoriteSizeMap.get(user) + "; value = " + this.mmFavoriteMap.get(this._getFavoriteKey(user, size - 1));
        }
    },

    /**
     * 获取关注列表
     * @param pageNumber 分页
     */
    getFavoriteList: function (pageNumber) {
        var user = Blockchain.transaction.from;
        var size = this.mmFavoriteSizeMap.get(user);
        var string = "";

        if (!size) {
            return string;
        }

        var startIndex = (pageNumber - 1) * 10;
        var endIndex = Math.min(pageNumber * 10 - 1, size - 1);

        for (var i = startIndex; i <= endIndex; i++) {
            var key = this.mmFavoriteMap.get(this._getFavoriteKey(user, i));
            var data = this._getOneMaimaiContentByKey(key);
            if (!data) {
                continue;
            }
            string += data + "nebulas";
        }
        return string.substr(0, string.length - 7);
    },

    /**
     * 没有index时删除关注
     * @param key 要删除的maimai的key
     */
    delFavoriteWithoutIndex: function (key) {
        var user = Blockchain.transaction.from;
        var size = this.mmFavoriteSizeMap.get(user);
        var tmpKey;
        for (var i = 0; i < size; i++) {
            tmpKey = this.mmFavoriteMap.get(this._getFavoriteKey(user, i));
            if (tmpKey === key) {
                this._doDelFavorite(i, size, user);
                break;
            }
        }
    },

    /**
     * 删除关注
     * @param index 要删除的是当前列表的第index个
     */
    delFavorite: function (index) {
        var user = Blockchain.transaction.from;
        var key = this.mmFavoriteMap.get(this._getFavoriteKey(user, index));
        var size = this.mmFavoriteSizeMap.get(user);

        if (index > size - 1) {
            throw new Error("out of the favorite list's bounds")
        }

        if (!key) {
            throw new Error("this item not in favorite list");
        }

        this._doDelFavorite(index, size, user);
    },

    _doDelFavorite: function (index, size, user) {
        //将删除的关注index之后的item都向前挪一位（避免分页出错）
        for (var i = index + 1; i < size; i++) {
            var key = this.mmFavoriteMap.get(this._getFavoriteKey(user, i));
            this.mmFavoriteMap.set(this._getFavoriteKey(user, i - 1), key);
        }
        //挪完之后删除当前用户的最后一个关注item
        this.mmFavoriteMap.del(this._getFavoriteKey(user, size - 1));
        //将当前用户的关注数量减一
        this.mmFavoriteSizeMap.set(user, size - 1);
    },

    _getFavoriteKey: function (user, index) {
        return user + "_favorite_" + index;
    },

    transfer: function (address, value) {
        var result = Blockchain.transfer(address, value);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value
            }
        });
        return result;
    }
};
module.exports = MaimaiContractList;