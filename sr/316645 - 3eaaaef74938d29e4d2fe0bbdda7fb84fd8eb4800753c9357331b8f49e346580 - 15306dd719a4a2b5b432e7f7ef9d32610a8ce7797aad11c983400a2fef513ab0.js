var zbItem = function (data) {
    if (data) {
        var obj = JSON.parse(data);
        this.app = obj.app;
        this.name = obj.name;
        this.text = obj.text;
        this.author = obj.author;
        this.key = obj.app + ':' + obj.name + ':' + obj.text;
    }
};

zbItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var zb = function () {
    LocalContractStorage.defineMapProperty(this, 'data', {
        parse: function (data) {
            return new zbItem(data);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

zb.prototype = {
    init: function () {

    },
    generate: function (app, name, text = '') {
        zbItem = new zbItem();
        zbItem.app = app;
        zbItem.name = name;
        zbItem.text = text;
        zbItem.author = Blockchain.transaction.from;
        zbItem.key = app + ':' + name + ':' + text;
        this.data.put(zbItem.key, zbItem);
    },
    get: function (app, name, text = '') {
        var key = app + ':' + name + ':' + text;
        return this.data.get(key);
    }

};

module.exports = zb;