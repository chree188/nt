'use strict';
var ChatRoom = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.content = obj.content;
        this.created_at = obj.created_at;
    } else {
        this.id = '';
        this.from = '';
        this.content = '';
        this.created_at = '';
    }
};
ChatRoom.prototype = {
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
var ChatRoomContract = function() {
    LocalContractStorage.defineMapProperty(this, 'ChatroomObj', {
        parse: function(text) {
            return new ChatRoom(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'ChatroomObjById', {
        parse: function(text) {
            return new ChatRoom(text);
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
ChatRoomContract.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (content) {
        content = content.trim();
        if (content === '') {
            throw new Error('empty content');
        }
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var chatRoom = new ChatRoom();
        chatRoom.id = index;
        chatRoom.from = from;
        chatRoom.content = content;
        chatRoom.created_at = timestamp;
        this.ChatroomObjById.put(index, chatRoom);
        this.ChatroomObj.put(from, chatRoom);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, chatRoom);
        this.size += 1;
        var fromList = this.userList.get(from);
        var userList = new UserList();
        userList.from = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(chatRoom);
            userList.data = currentList;
        } else {
            userList.data = [chatRoom];
        }
        this.userList.put(from, userList);
        return chatRoom;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('empty from');
        }
        return this.ChatroomObj.get(from);
    },
    getById: function (id) {
        id = parseInt(id);
        if (id === '') {
            throw new Error('empty id');
        }
        return this.ChatroomObjById.get(id);
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
                        "id": object.id,
                        "from": object.from,
                        "content": object.content,
                        "created_at": object.created_at
                    };
                    j++;
                }
                break;
            case 'desc':
            default:
                for (var i = (number - 1); i >= offset; i--) {
                    var object = list.data[i];
                    result[j] = {
                        "id": object.id,
                        "from": object.from,
                        "content": object.content,
                        "created_at": object.created_at
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
                        "id": object.id,
                        "from": object.from,
                        "content": object.content,
                        "created_at": object.created_at
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
                        "id": object.id,
                        "from": object.from,
                        "content": object.content,
                        "created_at": object.created_at
                    };
                    j++;
                }
                break;
        }
        return result;
    }
};
module.exports = ChatRoomContract;