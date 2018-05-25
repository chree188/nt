"use strict";

/*
每个月可以将自己喜欢的英语金句通过app提交到星云链，区块链会自动保存提交时间，英语金句以及作者钱包地址。所有人都可以随时查看全球唯美英语爱好者提交到区块链的相关数据，Come on，一起学英语吧！
*/

var AestheticalEnglish = function() {

  // 定一个了一个SuperDictionary类的属性，属性类型为字典，当前定义的属性名为repo
  LocalContractStorage.defineMapProperty(this, "repo", {

    parse: function(text) {
      // 返回数组对象
      return JSON.parse(text)
    },

    stringify: function(englishArr) {
      return JSON.stringify(englishArr)
    }

  });

};


AestheticalEnglish.prototype = {

  init: function() {
    // todo
  },

  save: function(englishWord, timeString) {

    englishWord = englishWord.trim();
    timeString = timeString.trim();
    if (englishWord === "" || timeString === "") {
      throw new Error("empty englishWord / timeString");
    }

    var from = Blockchain.transaction.from;

    var englishInfo = {
      "englishWord": englishWord,
      "timeString": timeString,
      "author": from
    }

    var englishItems = this.repo.get("english");

    if (englishItems) {
      var englishArr = [englishInfo,...englishItems]
      this.repo.set("english", englishArr);
    } else {
      this.repo.put("english", [englishInfo]);
    }
  },

  // 查询
  get: function() {

    return this.repo.get("english");
  }
};
module.exports = AestheticalEnglish;
