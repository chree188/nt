"use strict";

var WeightRecord = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.weight = obj.weight;
    this.timestamp = obj.timestamp;
    this.m = obj.m;
    this.w = obj.w;
    this.y = obj.y;
    this.d = obj.d;
    this.remark = obj.remark;
  } else {
    this.weight = "";
    this.timestamp = "";
    this.m = "";
    this.w = "";
    this.y = "";
    this.d = "";
    this.remark = "";
  }
}

var WeightRecordContract = function() {
  LocalContractStorage.defineMapProperty(this, "userWeightRecordMap", {
    parse: function(text) {
      return JSON.parse(text);
    },
    stringify: function(c) {
      return JSON.stringify(c);
    }
  }),
  LocalContractStorage.defineMapProperty(this, "userTargetWeightMap", {
    parse: function(text) {
      return JSON.parse(text);
    },
    stringify: function(c) {
      return JSON.stringify(c);
    }
  })
};

WeightRecordContract.prototype = {
  init: function() {

  },
  get: function(from) {
    if (!from) {
      throw new Error("undefined params")
    }
    from = from.trim()
    if (from === "") {
      throw new Error("empty value error")
    }
    var userTargetWeight = this.userTargetWeightMap.get(from);
    var userWeightRecordArr = this.userWeightRecordMap.get(from);
    return {
      target: userTargetWeight,
      record: userWeightRecordArr
    }
  },

  saveWeight: function(weight, remark, timestamp, y, m, d, w) {
    if (!weight || !remark || !timestamp || !y || !m || !d || !w) {
      throw new Error("undefined params")
    }
    weight = weight.trim();
    remark = remark.trim();
    timestamp = timestamp.trim();
    y = y.trim();
    m = m.trim();
    d = d.trim();
    w = w.trim();

    if (weight === "" || remark === "" || timestamp === "" || y === "" || m === "" || d === "" || w === "") {
      throw new Error("empty value error")
    }
    if (weight.length >= 10 || remark.length >= 20 || timestamp.length >= 100) {
      throw new Error("limited length")
    }
    var from = Blockchain.transaction.from;
    var userWeightRecordArr = []
    if (this.userWeightRecordMap.get(from)) {
      userWeightRecordArr = this.userWeightRecordMap.get(from);
    } else {
      userWeightRecordArr = []
    }
    var weightRecord = new WeightRecord();
    weightRecord.weight = weight;
    weightRecord.remark = remark;
    weightRecord.timestamp = timestamp;
    weightRecord.y = y;
    weightRecord.m = m;
    weightRecord.d = d;
    weightRecord.w = w;
    userWeightRecordArr.push(weightRecord)
    this.userWeightRecordMap.set(from, userWeightRecordArr)
    return userWeightRecordArr
  },

  saveTarget: function(targetWeight) {
    if (!targetWeight) {
      throw new Error("undefined params")
    }
    targetWeight = targetWeight.trim();
    if (targetWeight === "") {
      throw new Error("empty value error")
    }
    if (targetWeight.length >= 10) {
      throw new Error("limited length")
    }
    var from = Blockchain.transaction.from;
    var userTargetWeight = {}
    if (this.userTargetWeightMap.get(from)) {
      userTargetWeight = this.userTargetWeightMap.get(from);
    } else {
      userTargetWeight = {}
    }
    userTargetWeight.target = targetWeight;
    userTargetWeight.unit = "Kg";
    this.userTargetWeightMap.set(from, userTargetWeight)
    return userTargetWeight
  }
};

module.exports = WeightRecordContract;
