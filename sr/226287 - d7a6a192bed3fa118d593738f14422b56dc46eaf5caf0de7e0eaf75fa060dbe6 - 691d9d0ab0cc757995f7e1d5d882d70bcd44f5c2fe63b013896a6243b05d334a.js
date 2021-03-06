"use strict";
var NebBlog = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.author = obj.author;
        this.title = obj.title;
        this.content = obj.content;
        this.created_at = obj.created_at;
    } else {
        this.author = '';
        this.title = '';
        this.content = '';
        this.created_at = '';
    }
};
NebBlog.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var BlogList = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.author = obj.author;
        this.data = obj.data;
    } else {
        this.author = '';
        this.data = [];
    }
}
BlogList.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var NebBlogContract = function() {
    LocalContractStorage.defineMapProperty(this, 'blogObj', {
        parse: function(text) {
            return new NebBlog(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'blogList', {
        parse: function(text) {
            return new BlogList(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'arrayMap');
    LocalContractStorage.defineMapProperty(this, 'dataMap');
    LocalContractStorage.defineProperty(this, 'size');
};
NebBlogContract.prototype = {
    init: function() {
        this.size = 0;
    },
    save: function(title, content) {
        title = title.trim();
        content = content.trim();
        if (title === '') {
            throw new Error('empty title');
        }
        if (content === '') {
            throw new Error('empty content');
        }
        var nebBlog = this.blogObj.get(title);
        if (nebBlog) {
            throw new Error('title has been occupied');
        }
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var nebBlog = new NebBlog();
        nebBlog.author = from;
        nebBlog.title = title;
        nebBlog.content = content;
        nebBlog.created_at = timestamp;
        this.blogObj.put(title, nebBlog);
        this.blogObj.put(from, nebBlog);
        var index = this.size;
        this.arrayMap.set(index, title);
        this.dataMap.set(title, nebBlog);
        this.size += 1;
        var fromList = this.blogList.get(from);
        var blogList = new BlogList();
        blogList.author = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(nebBlog);
            blogList.data = currentList;
        } else {
            blogList.data = [nebBlog];
        }
        this.blogList.put(from, blogList);
        return nebBlog;
    },
    get: function(title) {
        title = title.trim();
        if (title === '') {
            throw new Error('empty title');
        }
        return this.blogObj.get(title);
    },
    getList: function(limit, offset, sort) {
        sort = sort || 'desc';
        limit = limit || 10;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error('offset is not valid');
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        var j = 0;
        switch (sort) {
            case 'asc':
                for (var i = offset; i < number; i++) {
                    var key = this.arrayMap.get(i);
                    var object = this.dataMap.get(key);
                    result[j] = '{"title":"' + object.title + '","content":"' + object.content + '",author:"' + object.author + '","created_at":"' + object.created_at + '"}';
                    j++;
                }
                break;
            case 'desc':
            default:
                for (var i = (number - 1); i >= offset; i--) {
                    var key = this.arrayMap.get(i);
                    var object = this.dataMap.get(key);
                    result[j] = '{"title":"' + object.title + '","content":"' + object.content + '",author:"' + object.author + '","created_at":"' + object.created_at + '"}';
                    j++;
                }
                break;
        }
        return result;
    },
    getMyList: function(limit, offset, sort) {
        var from = Blockchain.transaction.from;
        return this._getListFromFrom(from, limit, offset, sort);
    },
    getUserList: function(from, limit, offset, sort) {
        return this._getListFromFrom(from, limit, offset, sort);
    },
    total: function() {
        return this.size;
    },
    _getListFromFrom: function(from, limit, offset, sort) {
        if (from === '') {
            throw new Error('empty from');
        }
        var list = this.blogList.get(from);
        var count = list.data.length;
        sort = sort || 'desc';
        limit = limit || 10;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > count) {
            throw new Error('offset is not valid');
        }
        var number = offset + limit;
        if (number > count) {
            number = count;
        }
        var result = [];
        var j = 0;
        switch (sort) {
            case 'asc':
                for (var i = offset; i < number; i++) {
                    var object = list.data[i];
                    result[j] = '{"title":"' + object.title + '","content":"' + object.content + '",author:"' + object.author + '","created_at":"' + object.created_at + '"}';
                    j++;
                }
                break;
            case 'desc':
            default:
                for (var i = (number - 1); i >= offset; i--) {
                    var object = list.data[i];
                    result[j] = '{"title":"' + object.title + '","content":"' + object.content + '",author:"' + object.author + '","created_at":"' + object.created_at + '"}';
                    j++;
                }
                break;
        }
        return result;
    }
};
module.exports = NebBlogContract;