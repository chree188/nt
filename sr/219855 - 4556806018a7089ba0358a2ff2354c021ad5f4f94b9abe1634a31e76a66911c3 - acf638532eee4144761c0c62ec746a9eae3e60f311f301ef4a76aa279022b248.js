'use strict';

var NameSend = function () {
  LocalContractStorage.defineMapProperty(this, "storage", {
    parse: function (text) {
      return text;
    },
    stringify: function (o) {
      return o;
    }
  });
};

NameSend.prototype = {
  init: function () {
  },

  save: function (name, address) {
    if(!Blockchain.verifyAddress(address)){
      throw new Error("Invalid address.");
    }
    var checkAddress = this.storage.get(name);
    if(checkAddress){
      throw new Error("This name already registred to " + checkAddress);
    }
    this.storage.put(name, address);
    return "Saved";
  },

  send: function (name) {
    var to = this.storage.get(name);
    var amount = Blockchain.transaction.value;

    if (!to) {
      throw new Error("No such name in storage.");
    }

    var result = Blockchain.transfer(to, amount);
    if (!result) {
      throw new Error("transfer failed.");
    }
    Event.Trigger("NameSend", {
      Sending: {
        from: Blockchain.transaction.from,
        to: to,
        value: amount.toString()
      }
    });
    return "Money sent";
  }
};
module.exports = NameSend;