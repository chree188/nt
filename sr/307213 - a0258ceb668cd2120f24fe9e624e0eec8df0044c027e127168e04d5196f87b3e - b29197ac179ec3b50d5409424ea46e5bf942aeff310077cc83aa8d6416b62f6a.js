"use strict";

var DateProduct = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.datetime = obj.datetime;
        this.nickname = obj.nickname;
        this.message = obj.message;
        this.author = obj.author;
        this.price = new BigNumber(obj.price);
        this.ordernumber = obj.ordernumber;
    }
    else {
        this.datetime = "";
        this.nickname = "";
        this.message = "";
        this.author = "";
        this.price = new BigNumber(0);
        this.ordernumber = "";
    }
};

DateProduct.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Birthday = function() {
    LocalContractStorage.defineMapProperty(this, "dateProducts", {
        parse: function(text) {
            return new DateProduct(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "selledDates");

    LocalContractStorage.defineMapProperty(this, "topFivePrecious", {
        parse: function(text) {
            return new DateProduct(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        "sellCount": null,
        "admin": null,
    });
};

Birthday.prototype = {
    init: function(address) {
        this.sellCount = 0;
        this.admin = address;
    },

    getSellCount: function() {
        return this.sellCount;
    },

    getDateProduct: function(datetime) {
        datetime = datetime.trim();
        if (datetime === "") {
            throw new Error("empty datetime");
        }
        if (!datetime.match('\\d+')) {
            throw new Error("datetime not match");
        }

        var product = this.dateProducts.get(datetime);
        if (!product) {
            return {'error': 'date product not found', 'code': 1};
        }
        return product;
    },

    getAllDateProducts: function(){
        var rets = []
        for (var i=0; i < this.sellCount; i++) {
            var datetime = this.selledDates.get(i)
            var product = this.dateProducts.get(datetime);
            if (product) {
                rets.push(product);
            }
        }
        return {"products": rets};
    },

    getTopFivePrecious: function() {
        var rets = []
        for (var i=0; i < 5; i++) {
            var product = this.topFivePrecious.get(i);
            if (product) {
                rets.push(product);
            }
        }
        return {"products": rets};
    },

    buyDateProduct: function(datetime, nickname, message) {
        datetime = datetime.trim();
        nickname = nickname.trim();
        message = message.trim();
        if (datetime === "") {
            throw new Error("empty datetime");
        }
        if (!datetime.match('\\d+')) {
            throw new Error("datetime not match");
        }
        if (nickname.length > 64 || message.length > 64) {
            throw new Error("nickname/message exceed limit length");
        }

        var product = this.dateProducts.get(datetime);
        if (product) {
            return {'error': 'date product exist', 'code': 1, 'product': product};
        }

        product = new DateProduct();
        product.datetime = datetime;
        product.nickname = nickname;
        product.message = message;
        product.author = Blockchain.transaction.from;
        product.price = Blockchain.transaction.value;
        product.ordernumber = Blockchain.transaction.hash;
        
        var curSellCount = this.sellCount
        this.dateProducts.put(datetime, product);
        this.selledDates.put(curSellCount, datetime);
        this.sellCount += 1;
        
        var minPrice = null;
        var minIdx = -1;
        for (var i=0; i < 5; i++) {
            var tp = this.topFivePrecious.get(i);
            if (!tp) {
                minPrice = null;
                minIdx = i;
                break;
            }
            if (!minPrice || minPrice.greaterThan(tp.price)) {
                minPrice = tp.price;
                minIdx = i;
            }
        }
        if (!minPrice || minPrice.lessThan(product.price)) {
            this.topFivePrecious.set(minIdx, product);
        }
        return {'error': null, 'code': 0, 'ordernumber': product.ordernumber};
    },

    replaceOwner: function(datetime, nickname, message) {
        datetime = datetime.trim();
        nickname = nickname.trim();
        message = message.trim();
        if (datetime === "") {
            throw new Error("empty datetime");
        }
        if (!datetime.match('\\d+')) {
            throw new Error("datetime not match");
        }
        if (nickname.length > 64 || message.length > 64) {
            throw new Error("nickname/message exceed limit length");
        }
        var product = this.dateProducts.get(datetime);
        if (!product) {
            return {'error': 'date product not found', 'code': 1};
        }

        var oldPrice = product.price;
        var oldAuthor = product.author;
        var value = Blockchain.transaction.value;
        if (value <= oldPrice) {
            return {'error': 'your bid is less than current price', 'code': 1};
        }

        product = new DateProduct();
        product.datetime = datetime;
        product.nickname = nickname;
        product.message = message;
        product.author = Blockchain.transaction.from;
        product.price = Blockchain.transaction.value;
        product.ordernumber = Blockchain.transaction.hash;
        
        this.dateProducts.put(datetime, product);
        var result = Blockchain.transfer(oldAuthor, oldPrice);

        var minPrice = null;
        var minIdx = -1;
        for (var i=0; i < 5; i++) {
            var tp = this.topFivePrecious.get(i);
            if (!tp) {
                minPrice = null;
                minIdx = i;
                break;
            }
            if (!minPrice || minPrice.greaterThan(tp.price)) {
                minPrice = tp.price;
                minIdx = i;
            }
        }
        if (!minPrice || minPrice.lessThan(product.price)) {
            this.topFivePrecious.set(minIdx, product);
        }
        return {'error': null, 'code': 0, 'ordernumber': product.ordernumber, 'oldAuthor': oldAuthor, 'oldPrice': oldPrice};
    },

    withdraw: function(amount) {
        var num = new BigNumber(amount);
        if (!num || num.lessThan(new BigNumber(0))) {
            throw new Error("amount is null/negative");
        }
        if (Blockchain.transaction.from === this.admin) {
            var result = Blockchain.transfer(Blockchain.transaction.from, num);
            return {'error': null, 'code': 0, 'result': result};
        }
        else {
            throw new Error("you are not the administrator");
        }
    },

    administrator: function() {
        return this.admin;
    },

    debug: function() {
        var ret = {
            'dateProducts': JSON.stringify(this.dateProducts),
            'topFivePrecious': JSON.stringify(this.topFivePrecious),
            'sellCount': this.sellCount,
            'admin': this.admin
        };
        return ret;
    }
}

module.exports = Birthday;
