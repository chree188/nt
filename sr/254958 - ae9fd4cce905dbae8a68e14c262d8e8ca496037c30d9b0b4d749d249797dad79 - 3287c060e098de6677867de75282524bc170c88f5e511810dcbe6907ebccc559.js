'use strict';
var FuelStore = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.datetime = obj.datetime;
        this.mileage = obj.mileage;
        this.oil = obj.oil;
        this.price = obj.price;
        this.amount = obj.amount;
        this.lamp = obj.lamp;
        this.full = obj.full;
        this.forgot = obj.forgot;
        this.labeling = obj.labeling;
        this.created_at = obj.created_at;
    } else {
        this.id = '';
        this.from = '';
        this.datetime = '';
        this.mileage = '';
        this.oil = '';
        this.price = '';
        this.amount = '';
        this.lamp = '';
        this.full = '';
        this.forgot = '';
        this.labeling = '';
        this.created_at = '';
    }
};
FuelStore.prototype = {
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
var FuelStoreContract = function() {
    LocalContractStorage.defineMapProperty(this, 'FuelStoreObj', {
        parse: function(text) {
            return new FuelStore(text);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'FuelStoreObjById', {
        parse: function(text) {
            return new FuelStore(text);
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
FuelStoreContract.prototype = {
    init: function () {
        this.size = 0;
    },
    create: function (datetime, mileage, oil, price, amount, lamp, full, forgot, labeling) {
        datetime = datetime || '';
        mileage = mileage || '';
        oil = oil || '';
        price = price || '';
        amount = amount || '';
        lamp = lamp || '';
        full = full || '';
        forgot = forgot || '';
        labeling = labeling || '';
        datetime = datetime.trim();
        mileage = mileage.trim();
        oil = oil.trim();
        price = price.trim();
        amount = amount.trim();
        lamp = lamp.trim();
        full = full.trim();
        forgot = forgot.trim();
        labeling = labeling.trim();
        if (datetime === '') throw new Error('Empty datetime');
        if (mileage === '') throw new Error('Empty mileage');
        if (oil === '') throw new Error('Empty oil');
        if (price === '') throw new Error('Empty price');
        if (amount === '') throw new Error('Empty amount');
        if (lamp === '') throw new Error('Empty lamp');
        if (full === '') throw new Error('Empty full');
        if (forgot === '') throw new Error('Empty forgot');
        if (labeling === '') throw new Error('Empty labeling');
        var index = this.size;
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var fuelStore = new FuelStore();
        fuelStore.id = index;
        fuelStore.from = from;
        fuelStore.datetime = datetime;
        fuelStore.mileage = mileage;
        fuelStore.oil = oil;
        fuelStore.price = price;
        fuelStore.amount = amount;
        fuelStore.lamp = lamp;
        fuelStore.full = full;
        fuelStore.forgot = forgot;
        fuelStore.labeling = labeling;
        fuelStore.created_at = timestamp;
        this.FuelStoreObjById.put(index, fuelStore);
        this.FuelStoreObj.put(from, fuelStore);
        this.arrayMap.set(index, index);
        this.dataMap.set(index, fuelStore);
        this.size += 1;
        var fromList = this.userList.get(from);
        var userList = new UserList();
        userList.from = from;
        if (fromList) {
            var currentList = fromList.data;
            currentList.push(fuelStore);
            userList.data = currentList;
        } else {
            userList.data = [fuelStore];
        }
        this.userList.put(from, userList);
        return fuelStore;
    },
    get: function (from) {
        from = from.trim();
        if (from === '') {
            throw new Error('Empty from');
        }
        return this.FuelStoreObj.get(from);
    },
    getById: function (id) {
        id = parseInt(id);
        if (id === '') {
            throw new Error('Empty id');
        }
        return this.FuelStoreObjById.get(id);
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
    getMyAll: function(limit, offset, sort) {
        var from = Blockchain.transaction.from;
        return this._getAll(from, limit, offset, sort);
    },
    getUserAll: function(from, limit, offset, sort) {
        return this._getAll(from, limit, offset, sort);
    },
    _getAll: function(from, limit, offset, sort) {
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
    getAll: function (limit, offset, sort) {
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
            datetime: object.datetime,
            mileage : object.mileage,
            oil : object.oil,
            price : object.price,
            amount : object.amount,
            lamp : object.lamp,
            full : object.full,
            forgot : object.forgot,
            labeling : object.labeling,
            created_at: object.created_at
        };
    }
};
module.exports = FuelStoreContract;
