'use strict';
var BookStore = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.name = obj.name;
        this.author = obj.author;
        this.publisher = obj.publisher;
        this.isdn = obj.isdn;
        this.author_info = obj.author_info;
        this.book_info = obj.book_info;
        this.created_at = obj.created_at;
    } else {
        this.id = '';
        this.from = '';
        this.name = '';
        this.author = '';
        this.publisher = '';
        this.isdn = '';
        this.author_info = '';
        this.book_info = '';
        this.created_at = '';
    }
};
BookStore.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var UserList = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.data = obj.data;
    } else {
        this.from = '';
        this.data = [];
    }
}
UserList.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var BookStoreContract = function() {
    LocalContractStorage.defineMapProperty(this, 'BookStoreObj', {
        parse: function(text) {
            return new BookStore(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'BookStoreObjById', {
        parse: function(text) {
            return new BookStore(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'userList', {
        parse: function(text) {
            return new UserList(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'arrayMap');
    LocalContractStorage.defineMapProperty(this, 'dataMap');
    LocalContractStorage.defineProperty(this, 'size');
};
BookStoreContract.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (name, author, publisher, isdn, author_info, book_info) {
        name = name.trim();
        if (name === '') {
            throw new Error('empty name');
        }
        author = author.trim();
        publisher = publisher.trim();
        isdn = isdn.trim();
        author_info = author_info.trim();
        book_info = book_info.trim();
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var bookStore = new BookStore();
        bookStore.id = index;
        bookStore.from = from;
        bookStore.name = name;
        bookStore.author = author;
        bookStore.publisher = publisher;
        bookStore.isdn = isdn;
        bookStore.author_info = author_info;
        bookStore.book_info = book_info;
        bookStore.created_at = timestamp;
        this.BookStoreObjById.put(index, bookStore);
        this.BookStoreObj.put(from, bookStore);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, bookStore);
        this.size += 1;
        var fromList = this.userList.get(from);
        var userList = new UserList();
        userList.from = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(bookStore);
            userList.data = currentList;
        } else {
            userList.data = [bookStore];
        }
        this.userList.put(from, userList);
        return bookStore;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        return this.BookStoreObj.get(from);
    },
    getById: function (id) {
        id = parseInt(id);
        if (id === '') {
            throw new Error('empty id');
        }
        return this.BookStoreObjById.get(id);
    },
    getMyList: function(limit, offset, sort) {
        var from = Blockchain.transaction.from;
        return this._getListFromFrom(from, limit, offset, sort);
    },
    getUserList: function(from, limit, offset, sort) {
        return this._getListFromFrom(from, limit, offset, sort);
    },
    getMyTotal: function() {
        var from = Blockchain.transaction.from;
        return this._getTotal(from);
    },
    getUserTotal: function(from) {
        return this._getTotal(from);
    },
    _getTotal: function(from) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        var list = this.userList.get(from);
        var count = list.data.length;
        return count;
    },
    total: function() {
        return this.size;
    },
    _getListFromFrom: function(from, limit, offset, sort) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        var list = this.userList.get(from);
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
                    result[j] = {
                        id: object.id,
                        from: object.from,
                        name: object.name,
                        author: object.author,
                        publisher: object.publisher,
                        isdn: object.isdn,
                        author_info: object.author_info,
                        book_info: object.book_info,
                        created_at: object.created_at
                    };
                    j++;
                }
                break;
            case 'desc':
            default:
                for (var i = (number - 1); i >= offset; i--) {
                    var object = list.data[i];
                    result[j] = {
                        id: object.id,
                        from: object.from,
                        name: object.name,
                        author: object.author,
                        publisher: object.publisher,
                        isdn: object.isdn,
                        author_info: object.author_info,
                        book_info: object.book_info,
                        created_at: object.created_at
                    };
                    j++;
                }
                break;
        }
        return result;
    },
    getList: function (limit, offset, sort) {
        sort = sort || 'desc';
        limit = limit || 20;
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
        var result  = [];
        var j = 0;
        switch (sort) {
            case 'asc':
                for (var i = offset; i < number; i++) {
                    var key = this.arrayMap.get(i);
                    var object = this.dataMap.get(key);
                    result[j] = {
                        id: object.id,
                        from: object.from,
                        name: object.name,
                        author: object.author,
                        publisher: object.publisher,
                        isdn: object.isdn,
                        author_info: object.author_info,
                        book_info: object.book_info,
                        created_at: object.created_at
                    };
                    j++;
                }
                break;
            case 'desc':
            default:
                for (var i = (number - 1); i >= offset; i--) {
                    var key = this.arrayMap.get(i);
                    var object = this.dataMap.get(key);
                    result[j] = {
                        id: object.id,
                        from: object.from,
                        name: object.name,
                        author: object.author,
                        publisher: object.publisher,
                        isdn: object.isdn,
                        author_info: object.author_info,
                        book_info: object.book_info,
                        created_at: object.created_at
                    };
                    j++;
                }
                break;
        }
        return result;
    }
};
module.exports = BookStoreContract;