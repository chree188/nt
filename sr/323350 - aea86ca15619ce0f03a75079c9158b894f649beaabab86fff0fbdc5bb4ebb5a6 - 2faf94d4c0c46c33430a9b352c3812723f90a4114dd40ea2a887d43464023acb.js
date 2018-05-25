"use strict";


var Notarization = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.name = obj.name;
        this.idNo = obj.idNo;
        this.phone = obj.phone;
        this.desc = obj.desc;
        this.message = obj.message;
        this.sj = obj.sj;
        this.from = obj.from;
    } else {
        this.key = "";
        this.name = "";
        this.idNo = "";
        this.phone = "";
        this.desc = "";
        this.message = "";
        this.sj = "";
        this.from = "";
    }
};

Notarization.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var NotarizationContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

NotarizationContract.prototype = {
    init: function () {
        this.size = 0;
        this.size1 = 0;
    },
    save: function (key, name, idNo, phone, desc, message, sj) {
        var index = this.size;
        var from = Blockchain.transaction.from;
        var notar = this.dataMap.get(key);
        if (notar) {
            throw new Error("Notarization is exeist");
        } else {
            notar = new Notarization();
            notar.key = key;
            notar.name = name;
            notar.idNo = idNo;
            notar.phone = phone;
            notar.desc = desc;
            notar.message = message;
            notar.sj = sj;
            notar.from = from;
            this.size += 1;
            this.arrayMap.put(index, key);
            this.dataMap.put(key, notar);
        }

    },
    get: function (key) {
        return this.dataMap.get(key);
    },
    len: function () {
        return this.size;
    },
    forEach: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = '';
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += key + '`' + object.name + '`' + object.idno + '`' + object.phone + '`' + object.desc + '`' + object.message + '`' + object.sj + '`' + object.from + '^'
        }
        return result;
    }
};

module.exports = NotarizationContract;