'use strict';
var MovieStore = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.movie_name = obj.movie_name;
        this.director = obj.director;
        this.star = obj.star;
        this.movie_info = obj.movie_info;
        this.created_at = obj.created_at;
    } else {
        this.id = '';
        this.from = '';
        this.movie_name = '';
        this.director = '';
        this.star = '';
        this.movie_info = '';
        this.created_at = '';
    }
};
MovieStore.prototype = {
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
var MovieStoreContract = function() {
    LocalContractStorage.defineMapProperty(this, 'MovieStoreObj', {
        parse: function(text) {
            return new MovieStore(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'MovieStoreObjById', {
        parse: function(text) {
            return new MovieStore(text);
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
MovieStoreContract.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (movie_name, director, star, movie_info) {
        movie_name = movie_name.trim();
        if (movie_name === '') {
            throw new Error('empty song name');
        }
        director = director || '';
        star = star || '';
        movie_info = movie_info || '';
        director = director.trim();
        star = star.trim();
        movie_info = movie_info.trim();
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var movieStore = new MovieStore();
        movieStore.id = index;
        movieStore.from = from;
        movieStore.movie_name = movie_name;
        movieStore.director = director;
        movieStore.star = star;
        movieStore.movie_info = movie_info;
        movieStore.created_at = timestamp;
        this.MovieStoreObjById.put(index, movieStore);
        this.MovieStoreObj.put(from, movieStore);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, movieStore);
        this.size += 1;
        var fromList = this.userList.get(from);
        var userList = new UserList();
        userList.from = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(movieStore);
            userList.data = currentList;
        } else {
            userList.data = [movieStore];
        }
        this.userList.put(from, userList);
        return movieStore;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        return this.MovieStoreObj.get(from);
    },
    getById: function (id) {
        id = parseInt(id);
        if (id === '') {
            throw new Error('empty id');
        }
        return this.MovieStoreObjById.get(id);
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
                        movie_name: object.movie_name,
                        director: object.director,
                        star: object.star,
                        movie_info: object.movie_info,
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
                        movie_name: object.movie_name,
                        director: object.director,
                        star: object.star,
                        movie_info: object.movie_info,
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
                        movie_name: object.movie_name,
                        director: object.director,
                        star: object.star,
                        movie_info: object.movie_info,
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
                        movie_name: object.movie_name,
                        director: object.director,
                        star: object.star,
                        movie_info: object.movie_info,
                        created_at: object.created_at
                    };
                    j++;
                }
                break;
        }
        return result;
    }
};
module.exports = MovieStoreContract;