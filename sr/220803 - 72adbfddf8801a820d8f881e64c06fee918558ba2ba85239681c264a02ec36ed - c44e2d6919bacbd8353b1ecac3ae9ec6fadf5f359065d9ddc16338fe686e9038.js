"use strict";

var ProductContext = function(text) {
	if (text) {
		var obj = JSON.parse(text);
    this.name = obj.name;
    this.food_category = obj.food_category;
		this.kcal = obj.kcal;
		this.fat = obj.fat;
    this.carbs = obj.carbs;
    this.protein = obj.protein;
    this.sugars = obj.sugars;
    this.salt = obj.salt;
    this.cook_duration = obj.cook_duration;
    this.from = obj.from;
	} else {
    this.name = "";
    this.food_category = "";
    this.kcal = "";
    this.fat = "";
    this.carbs = "";
    this.protein = "";
    this.sugars = "";
    this.salt = "";
    this.cook_duration = "";
    this.from = "";
	}
};

ProductContext.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ProductContract = function(){
    LocalContractStorage.defineMapProperty(this, "productData", {
    parse: function (text) {
      return new ProductContext(text);
    },
    stringify: function (obj) {
      return obj.toString();
    }
  });
};

ProductContract.prototype = {
  init: function () {
    //TODO:
  },

  saveItem: function (key, kcal, fat, carbs, protein, sugars, salt, cook_duration, food_category) {
    var prodtuctItem = new ProductContext();
    prodtuctItem.name = key;
    prodtuctItem.food_category = food_category;
    prodtuctItem.kcal = kcal;
    prodtuctItem.fat = fat;
    prodtuctItem.carbs = carbs;
    prodtuctItem.protein = protein;
    prodtuctItem.sugars = sugars;
    prodtuctItem.salt = salt;
    prodtuctItem.cook_duration = cook_duration;
    prodtuctItem.from = Blockchain.transaction.from;
    this.productData.put(key, prodtuctItem);
    return "success";
  },

  getItem: function(key) {
  	return this.productData.get(key);
  },

  removeItem: function(key) {
    this.productData.delete(key);
  },

  getCountOfItems: function() {
    return this.productData.size;
  }
  };

  module.exports = ProductContract;