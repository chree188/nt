var Monument = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.content = obj.content;
    this.author = obj.author;
    this.date = obj.date;
  } else {
    this.name = "";
    this.content = "";
    this.author = "";
    this.date = "";
  }
};

Monument.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var MonumentContract = function () {
  LocalContractStorage.defineMapProperty(this, "indexMap");
  LocalContractStorage.defineMapProperty(this, "monuments", {
    parse: function (text) {
      return new Monument(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineProperty(this, "size");
};

MonumentContract.prototype = {

  init: function () {
    this.size = 0;
  },

  save: function (name, content, date) {
    var name = name.trim();
    var content = content.trim();
    var date = date.trim();

    if (name === "" || content === "") {
      throw new Error("Empty name or content");
    }
    if (content.length > 2048 || name.length > 64) {
      throw new Error("name or content exceed limit length");
    }
    var from = Blockchain.transaction.from;
    var key = name + from;
    var monument = this.monuments.get(key);
    if (monument) {
      // update monument
      monument.content = content;
      this.monuments.put(key, monument);
    } else {
      // new monument
      monument = new Monument();
      monument.name = name;
      monument.content = content;
      monument.author = from;
      monument.date = date;
      var index = this.size;
      this.indexMap.set(index, key);
      this.monuments.put(key, monument);
      this.size += 1;
    }


  },

  get: function (name) {
    name = name.trim();
    if (name === "") {
      throw new Error("empty name")
    }
    var from = Blockchain.transaction.from;
    var key = name + from;
    return this.monuments.get(key);
  },

  len: function () {
    return this.size;
  },

  query: function (limit, offset) {
    limit = parseInt(limit);
    offset = parseInt(offset);
    if (offset > this.size) {
      throw new Error("offset is not valid");
    }
    var number = offset + limit;
    if (number > this.size) {
      number = this.size;
    }
    var result = [];
    for (var i = offset; i < number; i++) {
      var key = this.indexMap.get(i);
      var object = this.monuments.get(key);
      result.push(object);
    }
    var obj = {};
    obj.monuments = result;
    obj.size = this.size;
    return JSON.stringify(obj);
  }
};

module.exports = MonumentContract;
