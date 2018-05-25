"use strict";

var Data = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.text = obj.text;
        this.info = obj.info;
    }
    else {
        this.key = null;
        this.text = null;
        this.info = null;
    }
}
Data.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}
var Demo = function () {
};
Demo.prototype = {

    init: function () {
        // todo
    },
    save: function (key,text,info) {

        var data = new Data();
        data.key = key;
        data.text = text;
        data.info = info;

        LocalContractStorage.set(key, data);
        var test = LocalContractStorage.get(key);
        if (test) return test;
        else return "eorro: Failed to save data";
    },
    get: function (key) {
        key = key.trim();
        var data = LocalContractStorage.get(key);

        if (data) {
            return data;
        }
        else return "eorro : Data don't exist";
    },
};
module.exports = Demo;