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
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Data(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}
Demo.prototype = {

    init: function () {
        // todo
    },
    save: function (key,text,info) {

        var data = new Data();
        data.key = key;
        data.text = text;
        data.info = info;

        this.repo.put(data.key, data);
        var test = this.repo.get(key);
        if (test) return data;
        else return "eorro: Failed to save data";
        return data;
    },
    get: function (key) {

        var data = this.repo.get(key);

        if (data) {
            return data;
        }
        else return "eorro : Data don't exist";
    },
};
module.exports = Demo;