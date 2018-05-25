'use strict';

var DepositeContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.val = new BigNumber(o.val);
    this.endTimeTs = new BigNumber(o.endTimeTs);
    this.uuid = o.uuid;
    this.from = o.from;
  } else {
    this.val = new BigNumber(0);
    this.endTimeTs = new BigNumber(0);
    this.uuid = 'FFFF-FFFF-FFFF-FFFF-FFFF';
    this.from = 'FFFF-FFFF-FFFF-FFFF-FFFF';
  }
};

DepositeContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var CreditCertification = function () {
  LocalContractStorage.defineMapProperty(this, "creditCertification", {
    parse: function (text) {
      return new DepositeContent(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

// save value to contract, only after height of block, users can takeout
CreditCertification.prototype = {
  init: function () {},

  apply: function (uuid,endTimeTs) {
    var from = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;

    var deposit = new DepositeContent();
    deposit.val = value;
    deposit.endTimeTs = endTimeTs;
    deposit.uuid = uuid;
    deposit.from = from;

    this.creditCertification.put(uuid, deposit);
  },

  dissolution: function (uuid) {
    var deposit = this.creditCertification.get(uuid);
    if (!deposit) {
      throw new Error("deposit not exist.");
    }

    if(deposit.val <= 0){
      throw new Error("no more nas in this deposit.");
    }

    var timestamp=Blockchain.transaction.timestamp;

    if(!timestamp){
      throw new Error('can not get timestamp!');
    }

    if (timestamp*1000 < deposit.endTimeTs) {
      throw new Error("Can not dissolution to "+deposit.from +" "+ deposit.val+" before "+deposit.endTimeTs+". now is "+timestamp);
    }

    var amount = deposit.val;
    var result = Blockchain.transfer(deposit.from, amount);
    if (!result) {
      throw new Error("transfer failed.");
    }

    deposit.val = new BigNumber(0);
    this.creditCertification.put(uuid, deposit);

    return "dissolution success. transfered "+amount+" to "+deposit.from+", now is "+timestamp+",result:"+result;
  },

  watchContract: function (uuid) {
    return this.creditCertification.get(uuid);
  }
};
module.exports = CreditCertification;