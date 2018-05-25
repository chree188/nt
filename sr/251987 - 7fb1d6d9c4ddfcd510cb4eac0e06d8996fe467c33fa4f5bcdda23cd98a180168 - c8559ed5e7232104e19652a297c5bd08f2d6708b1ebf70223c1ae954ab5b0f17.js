/**
 * author: LiuXuFei
 */
'use strict';
var DappStore = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.name = obj.name;
        this.info = obj.info;
        this.address = obj.address;
        this.hash = obj.hash;
        this.website = obj.website;
        this.github = obj.github;
        this.icon = obj.icon;
        this.instructions = obj.instructions;
        this.wechat = obj.wechat;
        this.mobile = obj.mobile;
        this.email = obj.email;
        this.remark = obj.remark;
        this.created_at = obj.created_at;
    } else {
        this.id = '';
        this.from = '';
        this.name = '';
        this.info = '';
        this.address = '';
        this.hash = '';
        this.website = '';
        this.github = '';
        this.icon = '';
        this.instructions = '';
        this.wechat = '';
        this.mobile = '';
        this.email = '';
        this.remark = '';
        this.created_at = '';
    }
};
DappStore.prototype = {
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
};
UserList.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var DappStoreContract = function() {
    LocalContractStorage.defineMapProperty(this, 'DappStoreObj', {
        parse: function(text) {
            return new DappStore(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'DappStoreObjById', {
        parse: function(text) {
            return new DappStore(text);
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
DappStoreContract.prototype = {
    init: function () {
        this.size = 0;
    },
    save: function (name, info, address, hash, website, github, icon, instructions, wechat, mobile, email, remark) {
        name = name || '';
        info = info || '';
        address = address || '';
        hash = hash || '';
        website = website || '';
        github = github || '';
        icon = icon || '';
        instructions = instructions || '';
        wechat = wechat || '';
        mobile = mobile || '';
        email = email || '';
        remark = remark || '';
        name = name.trim();
        info = info.trim();
        address = address.trim();
        hash = hash.trim();
        website = website.trim();
        github = github.trim();
        icon = icon.trim();
        instructions = instructions.trim();
        wechat = wechat.trim();
        mobile = mobile.trim();
        email = email.trim();
        remark = remark.trim();
        if (name === '') throw new Error('Empty name');
        if (info === '') throw new Error('Empty info');
        if (address === '') throw new Error('Empty address');
        if (hash === '') throw new Error('Empty hash');
        if (website === '') throw new Error('Empty website');
        if (icon === '') throw new Error('Empty icon');
        if (instructions === '') throw new Error('Empty instructions');
        if (wechat === '') throw new Error('Empty wechat');
        if (mobile === '') throw new Error('Empty mobile');
        if (email === '') throw new Error('Empty email');
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var dappStore = new DappStore();
        dappStore.id = index;
        dappStore.from = from;
        dappStore.name = name;
        dappStore.info = info;
        dappStore.address = address;
        dappStore.hash = hash;
        dappStore.website = website;
        dappStore.github = github;
        dappStore.icon = icon;
        dappStore.instructions = instructions;
        dappStore.wechat = wechat;
        dappStore.mobile = mobile;
        dappStore.email = email;
        dappStore.remark = remark;
        dappStore.created_at = timestamp;
        this.DappStoreObjById.put(index, dappStore);
        this.DappStoreObj.put(from, dappStore);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, dappStore);
        this.size += 1;
        var fromList = this.userList.get(from);
        var userList = new UserList();
        userList.from = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(dappStore);
            userList.data = currentList;
        } else {
            userList.data = [dappStore];
        }
        this.userList.put(from, userList);
        return dappStore;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('Empty from');
        }
        return this.DappStoreObj.get(from);
    },
    getById: function (id) {
        id = parseInt(id);
        if (id === '') {
            throw new Error('Empty id');
        }
        return this.DappStoreObjById.get(id);
    },
    getTotal: function() {
        return this.size;
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
            throw new Error('Empty from');
        }
        var list = this.userList.get(from);
        var count = list.data.length;
        return count;
    },
    getMyList: function(limit, offset, sort) {
        var from = Blockchain.transaction.from;
        return this._getListFromFrom(from, limit, offset, sort);
    },
    getUserList: function(from, limit, offset, sort) {
        return this._getListFromFrom(from, limit, offset, sort);
    },
    _getListFromFrom: function(from, limit, offset, sort) {
        from = from.trim();
        if (from === '') {
            throw new Error('Empty from');
        }
        var list = this.userList.get(from);
        var count = list.data.length - 1;
        sort = sort || 'desc';
        limit = limit || 10;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit < 0) {
            throw new Error('limit is not valid');
        }
        if (offset < 0 || offset > count) {
            throw new Error('offset is not valid');
        }
        var result = [];
        var j = 0;
        switch (sort) {
            case 'asc':
                var start = offset;
                if (limit > count) {
                    var end = count;
                } else {
                    var end = offset + limit;
                }
                for (var i = start; i <= end; i++) {
                    var object = list.data[i];
                    result[j] = this._object(object);
                    j++;
                }
                break;
            case 'desc':
            default:
                if (offset > count) {
                    var start = count;
                } else {
                    var start = count - offset;
                }
                if (limit > count) {
                    var end = 0;
                } else {
                    var end = count - limit;
                }
                for (var i = start; i >= end; i--) {
                    var object = list.data[i];
                    result[j] = this._object(object);
                    j++;
                }
                break;
        }
        return result;
    },
    getList: function (limit, offset, sort) {
        var count = this.size - 1;
        sort = sort || 'desc';
        limit = limit || 20;
        offset = offset || 0;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (limit < 0) {
            throw new Error('Limit is not valid');
        }
        if (offset < 0 || offset > count) {
            throw new Error('Offset is not valid');
        }
        var result  = [];
        var j = 0;
        switch (sort) {
            case 'asc':
                var start = offset;
                if (limit > count) {
                    var end = count;
                } else {
                    var end = offset + limit;
                }
                for (var i = start; i <= end; i++) {
                    var key = this.arrayMap.get(i);
                    var object = this.dataMap.get(key);
                    result[j] = this._object(object);
                    j++;
                }
                break;
            case 'desc':
            default:
                var start = count - offset;
                if (limit > count) {
                    var end = 0;
                } else {
                    var end = count - limit;
                }
                for (var i = start; i >= end; i--) {
                    var key = this.arrayMap.get(i);
                    var object = this.dataMap.get(key);
                    result[j] = this._object(object);
                    j++;
                }
                break;
        }
        return result;
    },
    _object: function (object) {
        return {
            id: object.id,
            from: object.from,
            name: object.name,
            info : object.info,
            address : object.address,
            hash : object.hash,
            website : object.website,
            github : object.github,
            icon : object.icon,
            instructions : object.instructions,
            wechat : object.wechat,
            mobile : object.mobile,
            email : object.email,
            remark : object.remark,
            created_at: object.created_at
        };
    }
};
module.exports = DappStoreContract;
