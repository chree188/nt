'use strict'

var ZhonejieItem = function(text){
  if(text){
    var obj = JSON.parse(text);

    this.name      = obj.name;
    this.cellphone = obj.cellphone;
    this.company   = obj.company
    this.city      = obj.city;
  }
};

ZhonejieItem.prototype = {
  toString : function(){
    return JSON.stringify(this)
  }
};

var Zhonejie = function () {
  LocalContractStorage.defineMapProperty(this, "data", {
    parse: function (text) {
      return new ZhonejieItem(text);
    },
    stringify: function (z) {
      return z.toString();
    }
  });
};

Zhonejie.prototype ={
  init: function(){
  },

  save: function(name, cellphone, city, company){
    if(!cellphone){
      throw new Error("cellphone can not be blank!!!")
    }

    var from = Blockchain.transaction.from;
    var zhonejie_item = this.data.get(cellphone);
    if(zhonejie_item){
      throw new Error("zhonejie is are ready exists");
    }

    zhonejie_item = new ZhonejieItem();

    zhonejie_item.author    = from;
    zhonejie_item.name      = name;
    zhonejie_item.cellphone = cellphone;
    zhonejie_item.city      = city;
    zhonejie_item.company   = company;

    this.data.put(cellphone, zhonejie_item);
  },

  get: function(cellphone){
    if(!cellphone){
      throw new Error("cellphone can not be blank!!!")
    }
    return this.data.get(cellphone);
  }
}

module.exports = Zhonejie;
