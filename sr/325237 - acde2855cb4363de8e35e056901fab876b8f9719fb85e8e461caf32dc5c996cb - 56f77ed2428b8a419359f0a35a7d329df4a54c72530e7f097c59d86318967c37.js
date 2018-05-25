"use strict";

var VideoItem = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.displayId = o.displayId;
        this.text = o.text;
        this.videoPath = o.videoPath;
        this.beCollectedCount = o.beCollectedCount;
        this.author = o.author;
    } else {
        this.displayId = "";
        this.text = "";
        this.videoPath = "";
        this.beCollectedCount = "";
        this.author = "";
    }
};

var Body = function () {
    LocalContractStorage.defineMapProperty(this, "cardMap");
    LocalContractStorage.defineProperty(this, "size");
};

Body.prototype = {
    init: function () {
        this.size = 0;
    },

    addVideo: function (value) {
        var index = this.size;
        this.size += 1;
        this.cardMap.set(index,value);
        console.log("index", index);

        return index;
    },

    deleteVideo: function (id) {
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


    getVideoById: function (id) {
        id = parseInt(id);
        if (id >= this.size){
            throw new Error("card id not found");
        }

        return this.cardMap.get(id);
    },

    getVideoLength: function () {
        return this.size;
    },

    getVideoList: function (limit, offset) {
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

module.exports = Body;