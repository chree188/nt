"use strict";

var Address = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id =obj.id;
        this.url = obj.url;
        this.author = obj.author;
        this.content =obj.content;
        this.date = obj.date;
    } else {
        this.id ="";
        this.url = "";
        this.author = "";
        this.content = "";
        this.date =new Date();
    }
};

Address.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var InternetSafeContract = function () {
    LocalContractStorage.defineProperties(this, {
        _creator: null,
        _index : 0
    });
    LocalContractStorage.defineMapProperties(this, {
        "repo": {
            parse: function (text) {
                return new Address(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "urlKeys": {
            parse: function (text) {
                return text.toString();
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

InternetSafeContract.prototype = {
    init: function () {
        // todo
        this._creator = Blockchain.transaction.from;
        this._index = 0;
    },

    save: function (url,content) {
        url = url.trim();
        content = content.trim();
        if (url === "" || content === ""  ){
            throw new Error("empty url / content ");
        }
        var author = Blockchain.transaction.from;
        var address = this.repo.get(url);
        if (address){
            throw new Error("value has been occupied"+JSON.stringify(address));
        }
        address = new Address();
        address.author = author;
        address.url = url;
        address.content = content;
        address.date =new Date();
        this._index++;
        address.id=this._index;
        this.repo.put(url,address);
        ;
        this.urlKeys.set(this._index,url);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },
    getUrlList: function () {
        var list = [];
        for(var i=1;i<=this._index;i++){
            var key = this.urlKeys.get(i);
            var address = this.repo.get(key);;
                list.push(address);

        }
        return list;
    }
};
module.exports = InternetSafeContract;