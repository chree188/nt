'use strict';
var MusicStore = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.song_name = obj.song_name;
        this.singer = obj.singer;
        this.album = obj.album;
        this.song_info = obj.song_info;
        this.created_at = obj.created_at;
    } else {
        this.id = '';
        this.from = '';
        this.song_name = '';
        this.singer = '';
        this.album = '';
        this.song_info = '';
        this.created_at = '';
    }
};
MusicStore.prototype = {
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
var MusicStoreContract = function() {
    LocalContractStorage.defineMapProperty(this, 'MusicStoreObj', {
        parse: function(text) {
            return new MusicStore(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'MusicStoreObjById', {
        parse: function(text) {
            return new MusicStore(text);
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
MusicStoreContract.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (song_name, singer, album, song_info) {
        song_name = song_name.trim();
        if (song_name === '') {
            throw new Error('empty song name');
        }
        singer = singer || '';
        album = album || '';
        song_info = song_info || '';
        singer = singer.trim();
        album = album.trim();
        song_info = song_info.trim();
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var musicStore = new MusicStore();
        musicStore.id = index;
        musicStore.from = from;
        musicStore.song_name = song_name;
        musicStore.singer = singer;
        musicStore.album = album;
        musicStore.song_info = song_info;
        musicStore.created_at = timestamp;
        this.MusicStoreObjById.put(index, musicStore);
        this.MusicStoreObj.put(from, musicStore);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, musicStore);
        this.size += 1;
        var fromList = this.userList.get(from);
        var userList = new UserList();
        userList.from = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(musicStore);
            userList.data = currentList;
        } else {
            userList.data = [musicStore];
        }
        this.userList.put(from, userList);
        return musicStore;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        return this.MusicStoreObj.get(from);
    },
    getById: function (id) {
        id = parseInt(id);
        if (id === '') {
            throw new Error('empty id');
        }
        return this.MusicStoreObjById.get(id);
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
                        song_name: object.song_name,
                        singer: object.singer,
                        album: object.album,
                        song_info: object.song_info,
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
                        song_name: object.song_name,
                        singer: object.singer,
                        album: object.album,
                        song_info: object.song_info,
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
                        song_name: object.song_name,
                        singer: object.singer,
                        album: object.album,
                        song_info: object.song_info,
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
                        song_name: object.song_name,
                        singer: object.singer,
                        album: object.album,
                        song_info: object.song_info,
                        created_at: object.created_at
                    };
                    j++;
                }
                break;
        }
        return result;
    }
};
module.exports = MusicStoreContract;