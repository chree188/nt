'use strict';
var Confess = function() {
  LocalContractStorage.defineMapProperty(this, "arrayMap");
  LocalContractStorage.defineMapProperty(this, "dataMap");
  LocalContractStorage.defineProperty(this, "size");
};
Confess.prototype = {
  init: function() {
    this.size = 0;
  },
  set: function(value1, value2) {
    var index = this.size;
    var from = Blockchain.transaction.from;
    if (!value1 || !value2) {
      throw new Error('invalid inputs 1!');
    }
    if (value1.length > 140 || value2.length > 16) {
      throw new Error('invalid inputs 2!');
    }
    var prev = this.dataMap.get(from);
    var now = Date.now();
    if (prev) {
      if (parseInt(prev.time) + 86400 * 7000 > now)
        throw new Error('can not rewite before ' + (parseInt(prev.time) + 86400 * 7000));
      this.dataMap.set(from, { text: value1, name: value2, time: now });
    } else {
      this.arrayMap.set(index, from);
      this.dataMap.set(from, { text: value1, name: value2, time: now });
      this.size += 1;
    }
  },

  get: function(key) {
    return this.dataMap.get(key);
  },

  len: function() {
    return this.size;
  },
  pull: function(offset, limit) {
    offset = parseInt(offset);
    limit = parseInt(limit);
    var result = [];
    if (offset > this.size)
      return result;
    var now = parseInt(Date.now());
    var i = 0,
      j = this.size - offset - 1;
    while (!(i == limit || j < 0)) {
      var re = this.dataMap.get(this.arrayMap.get(j));
      j--;
      if (parseInt(re.time) + 86400 * 7000 > now) {
        i++;
        result.push(re);
      }
    }
    return result;
  }
}
module.exports = Confess;
//300705a280955653dd666ffe9929ab743e02a2af014a7dee6a724deca2d32ca6
