"use strict";

var BlogItem = function(text) {
    if (text) {
        var value = JSON.parse(text);
        this.name = value.name;
        this.content = value.content;
        this.time = value.time;
        this.author = value.author;
        this.hash = value.hash;
        
    } else {
        this.name = "";
        this.content = "";
        this.time = ""
        this.author = "";
        this.hash = "";
    }
};

BlogItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BlogContract = function () {
   LocalContractStorage.defineMapProperty(this, "dataMap",null);
   LocalContractStorage.defineProperty(this, "size");
};

BlogContract.prototype = {
    init: function () {
        this.size = 0;
    },


    save: function (name, content, time) {
        name = name.trim();
        content = content.trim();
       
        if (name === "" || content === ""){
            throw new Error("empty name / content");
        }
       
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;
    
        var value = this.dataMap.get(from);

        if(!value) {
            var app = new BlogItem();
            app.name = name;
            app.content = content;
            app.time = time;
            app.author = from;
            app.hash = hash;

            var result = [];
            result.unshift(app);
            this.dataMap.set(from, result);
           
        } else {
            var result = value;
            var app = new BlogItem();
            app.name = name;
            app.content = content;
            app.time = time;
            app.author = from;
            app.hash = hash;
            result.unshift(app);
            this.dataMap.set(from, result);
        }
       

    },

    get: function (address) {
        var address = address.trim();
        if ( address === "" ) {
            throw new Error("地址不能为空")
        }
        if(!this.verifyAddress(address)) {
            throw new Error("请输入正确的钱包地址");
        }

        return this.dataMap.get(address);
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
          valid: result == 0 ? false : true
        };
    },

    len:function(){
      return this.size;
    }

};
module.exports = BlogContract;