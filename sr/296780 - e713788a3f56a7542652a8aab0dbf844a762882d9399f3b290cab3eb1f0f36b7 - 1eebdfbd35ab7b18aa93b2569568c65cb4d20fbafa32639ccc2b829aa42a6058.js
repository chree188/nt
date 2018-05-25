"use strict";
var fact = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
        this.timestamp = obj.timestamp;
    } else {
        this.id = "";
        this.title = "";
        this.content = "";
        this.author = "";
        this.timestamp = "";
    }

};
fact.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var haorenConstract = function () {
    LocalContractStorage.defineMapProperty(this, "haorenMap", {
        parse: function (text) {
            return new fact(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "zanMap");
};
haorenConstract.prototype = {
    init: function () {
        LocalContractStorage.set("haorenlist", {});
    },
    /**
     * private function，whether it is a JS object
     * @param val
     * @returns {boolean}
     * @private
     */
    _isObject: function (val) {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    },

    /**
     * private function ,json to array
     * @param json
     * @returns {Array}
     * @private
     */
    _json2array: function (json) {
        var arr = [];
        if (this._isObject(json)) {
            for (var i in json) {
                arr[i] = json[i];
            }
        }
        return arr;
    },

    /**
     * private function,array to json
     * @param arr
     * @private
     */
    _array2json: function (arr) {
        var json = {};
        if (Array.isArray(arr)) {
            for (var i in arr) {
                json[i] = arr[i];
            }
        }
        return json;
    },

    /**
     * private function ,return index of item
     * @param array
     * @param val
     * @returns {number}
     * @private
     */
    _indexOf: function (array, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == val) return i;
        }
        return -1;
    },
    /**
     * private function ,remove item from array
     * @param array
     * @param val
     * @private
     */
    _remove: function (array, val) {
        var index = this._indexOf(array, val);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },
    submitfact: function (title, content) {
        let from = Blockchain.transaction.from;
        if (title === "" || content === "") {
            throw new Error("必填字段不能为空");
        }
        let ts = Date.now();
        let afact = new fact();
        afact.title= title;
        afact.content=content;
        afact.author= from;
        afact.timestamp= ts;
        afact.id= ts+from;
        let key = ts+from;
        this.haorenMap.set(key,afact);
        let haorenlist = LocalContractStorage.get("haorenlist");
        let haorenlistArr = this._json2array(haorenlist);
        haorenlistArr.push(key);
        haorenlist = this._array2json(haorenlistArr);
        LocalContractStorage.set("haorenlist", haorenlist);
        this.zanMap.set(key,0);
        return '{"result":1}';

    },

    factlist:function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        let haorenlist = LocalContractStorage.get("haorenlist");
        let haorenlistArr =this._json2array(haorenlist);
        if (offset > haorenlistArr.length) {
            throw new Error("offset 数值太大");
        }
        let number = offset + limit;
        if (number > haorenlistArr.length) {
            number = haorenlistArr.length;
        }

        let result = [];
        for (var i = offset; i < number; i++) {
            result.push(this.haorenMap.get(haorenlistArr[i]));
        }
        return result;
    },

    zan: function (id) {
        let value = this.zanMap.get(id);
        let nvalue = value+1;
        this.zanMap.set(id,nvalue);
        return nvalue;
    },

    getzan:function (id) {
        return this.zanMap.get(id);
    }

};
module.exports = haorenConstract;