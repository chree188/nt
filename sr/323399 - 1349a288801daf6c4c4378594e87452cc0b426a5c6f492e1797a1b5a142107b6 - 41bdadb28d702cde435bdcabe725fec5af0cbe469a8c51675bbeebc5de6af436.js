"use strict";

// 1. add card
// 2. remove card
// 3. add favourite
// 4. get card list by type
// 5. update card score
// 6. add log

var CardItem = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.displayId = o.displayId;
        this.text = o.text;
        this.imgRelativePath = o.imgRelativePath;
        this.beCollectedCount = o.beCollectedCount;
        this.author = o.author;
    } else {
        this.displayId = "";
        this.text = "";
        this.imgRelativePath = "";
        this.beCollectedCount = "";
        this.author = "";
    }
};

var Interfaces = function () {
    LocalContractStorage.defineMapProperty(this, "cardMap");
    LocalContractStorage.defineProperty(this, "size");
};

Interfaces.prototype = {
    init: function () {
        this.size = 0;
    },

    addFavourite: function (id, deviceId) {


    },

    addCard: function (value) {
        var index = this.size;
        this.size += 1;
        this.cardMap.set(index,value);
        console.log("index", index);

        return index;
    },

    deleteCard: function (id) {
        id = parseInt(id);
        if (id >= this.size){
            throw new Error("card id not found");
        }
        var card = this.cardMap.get(id);
        if(card){
            this.cardMap.delete(id);
        }
        return card;
    },


    getCardById: function (id) {
        id = parseInt(id);
        if (id >= this.size){
            throw new Error("card id not found");
        }

        return this.cardMap.get(id);
    },

    cardLength: function () {
        return this.size;
    },

    getList: function (limit, offset) {
      limit = parseInt(limit);
      offset = parseInt(offset);
      if (offset > this.size){
          throw new Error("offset not valid");
      }

      var endPos = offset + limit;
      if (endPos > this.size){
          endPos = this.size;
      }

      var result = [];
      for (var i = offset; i < endPos; i++){
          var tmpCard = this.cardMap.get(i);
          if (tmpCard) {
              result.push(this.cardMap.get(i));
          }

      }
      return result;
    },


};

module.exports = Interfaces;