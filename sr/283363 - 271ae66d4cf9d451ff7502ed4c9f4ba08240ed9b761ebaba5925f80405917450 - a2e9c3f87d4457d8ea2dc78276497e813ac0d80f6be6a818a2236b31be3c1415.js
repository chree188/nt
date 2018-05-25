var result = {
  one: {
    type: '保守型',
    text: '您认为“低风险”是投资的第一要义。十分关注本金，不愿意承受风险而带来的高收益。'
  },
  two: {
    type: '稳健型',
    text: '您对投资的风险和回报都有深刻的了解，您更愿意用较小的风险来获得确定的收益。'
  },
  three: {
    type: '平衡型',
    text: '您有一定的风险偏好，您对投资的期望是用适度的风险换取合理的回报。'
  },
  four: {
    type: '积极型',
    text: '您的风险偏好偏高，但是还没有达到热爱风险的地步，您期望用一定的风险换取较高的回报。'
  },
  five: {
    type: '激进型',
    text: '您明白高风险高回报、低风险低回报的投资定律。您可能还年轻，对未来的收入充分乐观。'
  }
};

var RiskItem = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.type = obj.type;
    this.author = obj.author;
  }
};

RiskItem.prototype = {
  toString: function () {
    return JSON.stringify(this)
  }
};

var TheRisk= function () {
  LocalContractStorage.defineMapProperty(this, "data", {
    pares: function (text) {
      return new RiskItem(text)
    },
    stringify: function (o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "resultMap");
};

TheRisk.prototype = {
  init: function () {
    this.resultMap.set("one", result.one);
    this.resultMap.set("two", result.two);
    this.resultMap.set("three", result.three);
    this.resultMap.set("four", result.four);
    this.resultMap.set("five", result.five);
  },
  save: function (grade) {
    var typeText = '保守型';
    switch (true) {
      case (grade <= 16) :
        typeText = "保守型";
        break;
      case (grade >= 17 && grade <= 24) :
        typeText = "稳健型";
        break;
      case (grade >= 25 && grade <= 32) :
        typeText = "平衡型";
        break;
      case (grade >= 33 && grade <= 39) :
        typeText = "积极型";
        break;
      case (grade >= 40) :
        typeText = "保守型";
        break;
      default:
        typeText = "激进型";
        break;
    }
    var from = Blockchain.transaction.from;
    var riskItem = new RiskItem();
    riskItem.from = from;
    riskItem.type = typeText;
    riskItem.grade = grade;
    this.data.put(from, riskItem);
  },
  get: function (grade) {
    switch (true) {
      case (grade <= 16) :
        return this.resultMap.get("one");
      case (grade >= 17 && grade <= 24) :
        return this.resultMap.get("two");
      case (grade >= 25 && grade <= 32) :
        return this.resultMap.get("three");
      case (grade >= 33 && grade <= 39) :
        return this.resultMap.get("four");
      case (grade >= 40) :
        return this.resultMap.get("five");
      default:
        return this.resultMap.get("one");
    }
  },
  search: function (from) {
    return this.data.get(from);
  }
};

module.exports = TheRisk;