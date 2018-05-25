"use strict";

var MemoItem = function (array) {
  if(array) {
    this.arrayMap = array
  } else {
    this.arrayMap = []
  }
}

var Memo = function () {
  LocalContractStorage.defineMapProperty(this, "memo", {})
}

Memo.prototype = {
    init: function () {
      console.log('init')
    },

    save: function (key, value) {
      key = key.trim();
      value = value.trim().toString();

      if (value === "" || key === ""){
        throw new Error("empty key / value");
      }
      if (value.length > 100){
        throw new Error("value exceed limit length")
      }

      var from     = Blockchain.transaction.from;
      var memoItem = this.memo.get(key);

      if (memoItem){
        let array = []
        array = array.concat(memoItem.arrayMap)
        array = array.concat([value])
        this.memo.del(key);

        var newMemoItem = new MemoItem(array);
        this.memo.set(key, newMemoItem)
        return true;
      } else {
        var newMemoItem = new MemoItem([value]);
        this.memo.set(key, newMemoItem)
        return true;
      }

    },

    del: function (key, index) {
      key = key.trim();

      if ( key === "" || index ==="") {
        throw new Error("empty key / index")
      }

      var memoItem = this.memo.get(key);
      if(memoItem) {
        this.memo.del(key);
      }

      return true;
    },

    get: function (key) {
      key = key.trim();

      if ( key === "" ) {
        throw new Error("empty key")
      }

      return this.memo.get(key);
    }
};

module.exports = Memo;
