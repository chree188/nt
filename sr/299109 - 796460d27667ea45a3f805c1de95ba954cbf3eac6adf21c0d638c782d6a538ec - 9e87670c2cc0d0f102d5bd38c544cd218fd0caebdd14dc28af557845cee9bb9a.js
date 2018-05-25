"use strict";
var Commodity = function (text) {
	if (text) {
        	var o = JSON.parse(text);
        	this.name = o.name;
          this.seller = o.seller;
          this.seller_email = o.seller_email;
          this.price = o.price;
          this.total_quantity = o.total_quantity;
          this.remained_quantity = o.remained_quantity;
        	this.description = o.description;
          this.link = o.link;
          this.timestamp = o.timestamp;
          this.id = "";
	}else{
          this.name = "";
          this.seller = "";
          this.seller_email = "";
          this.price = 0;
          this.total_quantity = 0;
          this.remained_quantity = 0;
          this.description = "";
          this.link = "";
          this.timestamp = "";
          this.id = "";
        }
};

var Tx = function () {
  this.id = "";
  this.buyer = "";
  this.commodity_id = "";
  this.quantity = 0;
  this.amount = 0;
  this.name = "";
  this.price = 0;
  this.timestamp = "";
}

Commodity.prototype = {
	toString: function () {
  		return JSON.stringify(this);
	}
};

var SaleContract = function () {
  LocalContractStorage.defineProperties(this, {
        CommoditiesCount: null,
        TxCount: null,
        donation: null
    });
	LocalContractStorage.defineMapProperty(this, "Commodities");
  LocalContractStorage.defineMapProperty(this, "CommoditiesCounts");
  LocalContractStorage.defineMapProperty(this, "Tx");
  LocalContractStorage.defineMapProperty(this, "TxCounts");
};

SaleContract.prototype = {
	init: function () {
    this.CommoditiesCount = 1;
    this.TxCount = 1;
    this.donation = "n1JZJZt5rsPgNHSRvwdTdRfbyFxw5XMQxFS";
  },

	addCommodity: function (name,seller_email,price,total_quantity,description,link) {
  		var from = Blockchain.transaction.from;
  		var timestamp = Blockchain.transaction.timestamp;
  		var id = from + timestamp;
		
  		var commodity = new Commodity();
          commodity.name = name;
          commodity.seller = from;
          commodity.seller_email = seller_email; 
          commodity.price = price;
          commodity.total_quantity = total_quantity;
          commodity.remained_quantity = total_quantity;
          commodity.description = description;
          commodity.link = link;
          commodity.timestamp = timestamp;
          commodity.id = id;
      this.CommoditiesCounts.put(this.CommoditiesCount, id);
      this.CommoditiesCount += 1;
  		this.Commodities.put(id, commodity);
	},

  buy: function (key, quantity) {
    console.log("start");
    var buyer = Blockchain.transaction.from;
    var timestamp = Blockchain.transaction.timestamp;
    var value = Blockchain.transaction.value;
    console.log(value);
    var id = buyer + timestamp;
    console.log(id);
    var commodity = this.Commodities.get(key);
    console.log(commodity);

    var rate = new BigNumber(10 ** 18);
    console.log(rate);
    var amount = new BigNumber(commodity.price).times(quantity);
    console.log(amount);
    var amountBN = amount.times(rate);
    console.log(amountBN);
    console.log("start IF");
    console.log(value.gte(amountBN));
    console.log(commodity.remained_quantity >= quantity);

      var tx = new Tx();
      tx.id = id;
      tx.buyer = buyer;
      tx.commodity_id = commodity.id;
      tx.quantity = quantity;
      tx.amount = amount.toNumber();
      tx.name = commodity.name;
      tx.price = commodity.price;
      tx.timestamp = timestamp;
      console.log(tx);

      commodity.remained_quantity -= quantity;
      console.log(commodity);

      var result1 = Blockchain.transfer(commodity.seller, amountBN);
      console.log(result1);
      var result2 = Blockchain.transfer(this.donation, value.minus(amountBN));
      console.log(result2);

      this.Commodities.put(key, commodity);

      this.TxCounts.put(this.TxCount, id);
      this.TxCount += 1;
      this.Tx.put(id, tx);
  },

  accept:function(){
    Blockchain.transfer(this.donation, Blockchain.transaction.value);
  },

  getCommoditiesCount: function (index) {
    return this.CommoditiesCount;
  },

  getTxCount: function (index) {
    return this.TxCount;
  },

  getCommodityKey: function (index) {
    return this.CommoditiesCounts.get(index);
  },

  getCommodity: function (key) {
    return this.Commodities.get(key);
  },

  getCommodities: function() {
    var counts = this.CommoditiesCount;
    var arr = [];
    for(let i = 1; i < counts ;i++) {
        var key = this.CommoditiesCounts.get(i);
        var commdity = this.Commodities.get(key);
        arr.push(commdity);
    }
    return arr;
  },

  getTxKey: function (index) {
    return this.TxCounts.get(index);
  },

  getTxes: function() {
    var counts = this.TxCount;
    var arr = [];
    for(let i = 1; i < counts ;i++) {
        var key = this.TxCounts.get(i);
        var tx = this.Tx.get(key);
        arr.push(tx);
    }
    return arr;
  },

  getTx: function (key) {
    return this.Tx.get(key);
  }


};
module.exports = SaleContract;