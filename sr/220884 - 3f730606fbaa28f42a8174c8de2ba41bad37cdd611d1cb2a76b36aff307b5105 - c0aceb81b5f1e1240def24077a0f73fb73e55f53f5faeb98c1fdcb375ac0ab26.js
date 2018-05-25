"use strict";

var ShortnameEntity = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.shortname = obj.shortname;
    this.longname = obj.longname;
    this.author = obj.author;
  } else {
    this.shortname = "";
    this.longname = "";
    this.author = "";
  }
};

ShortnameEntity.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var ShortnameContract  = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ShortnameEntity(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperties(this, {
      depositRequirement: 0,
      totalShortnameCount: 0,
      daBoss: "n1UziJREeLNgTQPDK8AAfZdutJdBvHVhXQ5"
    });
    LocalContractStorage.defineMapProperty(this, "ownerList");
};

ShortnameContract.prototype = {
  init: function () {
  },
  claim: function (shortname, longname) {
    shortname = shortname.trim();
    longname = longname.trim();
    if (shortname === "" || longname === "") {
      throw new Error("short or long name cannot be empty");
    }
    if (shortname.length > 64 || longname.length > 64){
      throw new Error("key / value exceed limit length")
    }
    var shortnameEntity = this.repo.get(shortname);
    if (shortnameEntity){
      throw new Error("short name already claimed");
    }

    var from = Blockchain.transaction.from;
    shortnameEntity = new ShortnameEntity();
    shortnameEntity.shortname = shortname;
    shortnameEntity.longname = longname;
    shortnameEntity.author = from;
    this.repo.put(shortname, shortnameEntity);
    this.totalShortnameCount += 1;
    var shortnameList = this.ownerList.get(from);
    if (shortnameList) {
      shortnameList.push(shortname);
      this.ownerList.set(from, shortnameList);
    } else {
      var shortnameList = [];
      shortnameList.push(shortname);
      this.ownerList.set(from, shortnameList);
    }
  },
  change: function (shortname, longname) {
    shortname = shortname.trim();
    longname = longname.trim();
    if (shortname === "" || longname === "") {
      throw new Error("short or long name cannot be empty");
    }
    if (shortname.length > 64 || longname.length > 64){
      throw new Error("key / value exceed limit length")
    }
    var shortnameEntity = this.repo.get(shortname);
    if (!shortnameEntity){
      throw new Error("this short name need to be bought");
    }
    var from = Blockchain.transaction.from;
    if (from != shortnameEntity.author) {
      throw new Error("only owner can change shortname content");
    }
    shortnameEntity.longname = longname;
    this.repo.put(shortname, shortnameEntity);
  },
  get: function (shortname) {
    var shortnameEntity = this.repo.get(shortname);
    return shortnameEntity;
  },
  getAll: function () {
    var from = Blockchain.transaction.from;
    var shortnameList = this.ownerList.get(from);
    return shortnameList;
  },
  getCount: function () {
    return this.totalShortnameCount;
  }
};

module.exports = ShortnameContract;
