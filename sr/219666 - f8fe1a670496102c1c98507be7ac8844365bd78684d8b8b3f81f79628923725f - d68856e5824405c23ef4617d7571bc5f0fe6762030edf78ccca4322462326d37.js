"use strict";

var Notice = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.publicer = obj.publicer;
        this.content = obj.content;
        this.timestamp = obj.timestamp;
    } else {
        this.publicer = "";
        this.content = "";
        this.timestamp = "";
    }
};

Notice.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var PublicShow = function() {
   LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new Notice(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   LocalContractStorage.defineProperty(this, "size");
};

PublicShow.prototype = {
    init: function() {
        this.size = 0
    },
    add: function(publicer, content) {
        publicer = publicer.trim();
        content = content.trim();
        if (publicer === "" || content === "") {
            throw new Error("empty publicer / content");
        }

        var timestamp = Blockchain.transaction.timestamp;

        var notice = new Notice();
        notice.timestamp = timestamp;
        notice.publicer = publicer;
        notice.content = content;
        
        var index = this.size;
        this.dataMap.set(index, notice);
        this.size +=1;

    },

    len:function(){
      return this.size;
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.dataMap.get(key);
    }
};
module.exports = PublicShow;