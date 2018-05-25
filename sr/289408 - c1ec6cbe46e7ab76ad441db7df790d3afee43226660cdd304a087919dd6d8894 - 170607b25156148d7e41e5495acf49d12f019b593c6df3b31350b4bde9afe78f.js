var CookBookItem = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.author = obj.author;
    this.method = obj.method;
  }
};

CookBookItem.prototype = {
  toString: function() {
    return JSON.stringify(this)
  }
};

var TheCook = function() {
  LocalContractStorage.defineMapProperty(this, "data", {
    pares: function(text) {
      return new RiskItem(text)
    },
    stringify: function(o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "cookBookMap");
};

TheCook.prototype = {
  init: function() {

  },
  save: function(name, author, method) {
    var cookBookItem = new CookBookItem();
    cookBookItem.name = name;
    cookBookItem.author = author;
    cookBookItem.method = method;
    if (!this.cookBookMap.get(name)){
      var date = [];
      date.push(cookBookItem);
      this.cookBookMap.set(name, date);
    } else {
      var date = this.cookBookMap.get(name);
      date.push(cookBookItem);
      this.cookBookMap.set(name, date);
    }
  },
  get: function(name) {
    return this.cookBookMap.get(name);
  },
};

module.exports = TheCook;