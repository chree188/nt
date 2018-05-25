"use strict";

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
