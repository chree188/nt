"use strict";

var TimeItem = function (array) {
  if(array) {
    this.arrayMap = array
  } else {
    this.arrayMap = []
  }
}

var TimeLine = function () {
  LocalContractStorage.defineMapProperty(this, "timeLine", {})
}

TimeLine.prototype = {
    init: function () {
      console.log('init')
    },

    save: function (key, value, time) {
      key = key.trim();
      value = value.trim().toString();

      if (value === "" || key === "" || time === "" ){
        throw new Error("empty key / value / time");
      }
      if (value.length > 100){
        throw new Error("value exceed limit length")
      }

      var from     = Blockchain.transaction.from;
      var timeItem = this.timeLine.get(key);

      if (timeItem){
        let array = []
        array = array.concat(timeItem.arrayMap)
        array = array.concat([{name:key, time:time, text:value, address: from}])
        this.timeLine.del(key);

        var newTimeItem = new TimeItem(array);
        this.timeLine.set(key, newTimeItem)
        return true;
      } else {
        var newTimeItem = new TimeItem([{name:key, time:time, text:value, address: from}]);
        this.timeLine.set(key, newTimeItem)
        return true;
      }

    },

    get: function (key) {
      key = key.trim();

      if ( key === "" ) {
        throw new Error("empty key")
      }

      return this.timeLine.get(key);
    }
};

module.exports = TimeLine;
