"use strict";

var LovePairContract = function () {

  //TODO
};



LovePairContract.prototype = {

  init: function () {
    //TODO
  },
  pair: function (user, target) {
    try {
      var tFind = this.get(user);
    } catch (e) {
      if (e.toString().indexOf("empty key") != -1) {
        return "请输入你的名字";
      } else {
        return "出现异常，请联系我们";
      }
    }
    if (tFind != target && tFind != null) {
      return "你怎么能三心二意";
    } else {
      try {
        var uFind = this.get(target);
        if (uFind == null && tFind != null) {
          return "ta还没提交，请继续加油暗示ta";
        } else if (tFind == null && uFind == null) {
          return "未有双方的记录，是否确认提交？";
        } else if (uFind == user) {
          return "恭喜你们两情相悦";
        } else {
          return "虽然ta心有所属，但不要气馁，加油！（不要忘了重名的可能性哟）";
        }
      } catch (e) {
        if (e.toString().indexOf("empty key") != -1) {
          return "请输入ta的名字";
        } else {
          return "出现异常，请联系我们";
        }
      }
    }
  },

  get: function (key) {
    if (key === "") {
      throw new Error("empty key");
    }
    var value = LocalContractStorage.get(key);
    return value;

  },

  save: function (user, target) {
    user = user.trim();
    target = target.trim();
    LocalContractStorage.set(user, target);
  }
};

module.exports = LovePairContract;