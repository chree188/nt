'use strict';

var CardItem = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.name = o.name;
				this.email = o.email
        this.phone = o.phone;
        this.title = o.title;
        this.website = o.website;
    } else {
        this.email = '';
        this.name = '';
        this.phone = '';
        this.title = '';
        this.website = '';
    }
}

CardItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
}
var CardContract = function() {
    LocalContractStorage.defineMapProperty(this, "card", {
        parse: function(text) {
            return new CardItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    })
}
CardContract.prototype = {
    init: function() {

    },
    update: function(name, title, email, website, phone) {
        var from = Blockchain.transaction.from;
        var item = new CardItem();
        item.name = name;
        item.title = title;
        item.email = email;
        item.website = website;
        item.phone = phone;
        this.card.put(from, item);
    },
    search: function (id) {
        var item = this.card.get(id);
        return item;
    }
}
module.exports = CardContract;