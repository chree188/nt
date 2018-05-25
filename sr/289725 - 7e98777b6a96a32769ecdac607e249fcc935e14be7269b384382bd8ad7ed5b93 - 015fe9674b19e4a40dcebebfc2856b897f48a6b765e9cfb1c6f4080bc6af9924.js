'use strict';

var CardItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.price = new BigNumber(obj.price);
        this.total = obj.total;
        this.name = obj.name;
        this.desc = obj.desc;
        this.seller = obj.seller;
        this.data = obj.data;
    } else {
        this.price = new BigNumber(0);
        this.total = 0;
        this.name = "";
        this.desc = "";
        this.seller = "";
        this.data = [];
    }
};

CardItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var PurchasedCardItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.card = obj.card;
        this.id = obj.id;
    } else {
        this.card = "";
        this.id = "";
    }
};

PurchasedCardItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var AutoSeller = function () {
    LocalContractStorage.defineMapProperty(this, "cards", {
        parse: function (text) {
            return new CardItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "purchasedCards", {
        parse: function (text) {
            return new PurchasedCardItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "sellers");
    LocalContractStorage.defineMapProperty(this, "customers");
    LocalContractStorage.defineMapProperty(this, "sellersProperty");
};
AutoSeller.prototype = {
    init: function () {
    },
    addCard: function (id, price, name, desc, data) {
        var newCardItem = this.cards.get(id);
        if(newCardItem){
            throw new Error("卡ID已存在");
        }
        newCardItem = new CardItem();
        if (name.length > 64){
            throw new Error("名称长度超出限制")
        }
        if (name.length < 1){
            throw new Error("名称长度太短")
        }
        if (desc.length > 256){
            throw new Error("描述长度超出限制")
        }
        newCardItem.desc = desc;
        newCardItem.name = name;
        newCardItem.price = new BigNumber(price);
        if (newCardItem.price.lt(0)){
            throw new Error("卡的价格必须大于0")
        }
        newCardItem.data = JSON.parse(data);
        if (!newCardItem.data || newCardItem.data.length == 0){
            throw new Error("卡的数量必须大于0")
        }
        newCardItem.total = newCardItem.data.length;
        newCardItem.seller = Blockchain.transaction.from;
        var sellerCards = this.sellers.get(newCardItem.seller);
        if(!sellerCards) {
            sellerCards = [];
        }
        this.cards.put(id, newCardItem);
        sellerCards.push(id);
        this.sellers.put(newCardItem.seller, sellerCards);
    },
    buyCard: function (id) {
        var cardItem = this.cards.get(id);
        if (!cardItem) {
            throw new Error("卡ID不存在");
        }
        if (!cardItem.price.eq(Blockchain.transaction.value)) {
            throw new Error("转账金额不正确");
        }
        if (cardItem.data.length == 0) {
            throw new Error("卡数量不足");
        }
        var sellerProperty = this.sellersProperty.get(cardItem.seller);
        if (!sellerProperty) {
            sellerProperty = new BigNumber(0);
        } else {
            sellerProperty = new BigNumber(sellerProperty);
        }
        sellerProperty = sellerProperty.add(Blockchain.transaction.value);
        var card = cardItem.data.shift();
        this.cards.put(id, cardItem);
        this.sellersProperty.put(cardItem.seller, sellerProperty.toString());
        var purchasedCardItem = new PurchasedCardItem();
        purchasedCardItem.card = card;
        purchasedCardItem.id = id;
        this.purchasedCards.put(Blockchain.transaction.hash, purchasedCardItem);
        var customersCards = this.customers.get(Blockchain.transaction.from);
        if(!customersCards) {
            customersCards = [];
        }
        customersCards.push(Blockchain.transaction.hash);
        this.customers.put(Blockchain.transaction.from, customersCards);
    },
    queryCard: function (id) {
        var cardItem = this.cards.get(id);
        if (!cardItem) {
            throw new Error("卡ID不存在");
        }
        var result = new Object();
        result.price = cardItem.price;
        result.total = cardItem.total;
        result.name = cardItem.name;
        result.desc = cardItem.desc;
        result.seller = cardItem.seller;
        result.remain = cardItem.data.length;
        return result;
    },
    queryPurchasedCard: function (hash) {
        return this.purchasedCards.get(hash);
    },
    queryBalance: function () {
        var from = Blockchain.transaction.from;
        var sellerProperty = this.sellersProperty.get(from);
        return sellerProperty;
    },
    withdraw: function () {
        var from = Blockchain.transaction.from;
        var sellerProperty = this.sellersProperty.get(from);
        if (!sellerProperty) {
            throw new Error("没有余额可提现");
        }
        sellerProperty = new BigNumber(sellerProperty);
        if (sellerProperty.lte(0)){
            throw new Error("没有余额可提现");
        }
        var result = Blockchain.transfer(from, sellerProperty);
        if (!result) {
            throw new Error("转账失败");
        }
        this.sellersProperty.del(from);
        return sellerProperty;
    }
};
module.exports = AutoSeller;