'use strict';

var FreezeBoxContent = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.guarantor = obj.guarantor;
    this.members = obj.members;
    this.status = obj.status;
    this.bank = new BigNumber(obj.bank);
    this.comission = new BigNumber(obj.comission);
  } else {
    this.name = "";
    this.guarantor = "";
    this.members = {};
    this.status = 0;              // 0 - open          1 - frozen
    this.bank = new BigNumber(0);
    this.comission = new BigNumber(0);
  }
};

FreezeBoxContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var FreezeBox = function () {
    LocalContractStorage.defineMapProperty(this, "storage", {
        parse: function (text) {
            return new FreezeBoxContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

FreezeBox.prototype = {
  init: function () {
  },

  create: function (name, guarantor, members, comission) {
    var members = JSON.parse(members);
    var entity = this.storage.get(name);
    var comission = new BigNumber(comission);

    if(entity){
      return {"success": false, "message": "Please choose another name"};
    }

    if(comission.lessThan(0)){
      return {"success": false, "message": "Comission should be positive number"};
    }

    if(comission.greaterThan(100)){
      return {"success": false, "message": "Maximum comission is 100%"};
    }

    if(!Blockchain.verifyAddress(guarantor)){
      return {"success": false, "message": "Invalid guarantor address"};
    }

    // @TODO delete repeats
    if(members.length < 2){
      return {"success": false, "message": "There should be more than 1 member"};
    }

    var freeze_box = new FreezeBoxContent();
    freeze_box.name = name;
    freeze_box.guarantor = guarantor;
    freeze_box.comission = comission;

    members.forEach(function(address){
      if(!Blockchain.verifyAddress(address)){
        return {"success": false, "message": address + "is invalid address"};
      }
      freeze_box.members[address] = new BigNumber(0);
    });

    this.storage.put(name, freeze_box);

    return {"success": true};
  },

  freeze: function (name) {
    var freeze_box = this.storage.get(name);

    if(!freeze_box){
      return {"success": false, "message": "There is no such freezeBox"};
    }

    if(freeze_box.guarantor !== Blockchain.transaction.from){
      return {"success": false, "message": "Only " + freeze_box.guarantor + " can freeze the box"};
    }

    if(freeze_box.bank.equals(0)){
      return {"success": false, "message": "Bank is empty"};      
    }
    
    if(freeze_box.status === 1){
      return {"success": false, "message": "Box is already frozen by guarantor"};
    }

    freeze_box.status = 1; // frozen
    this.storage.put(name, freeze_box);
    return {"success": true};
  },

  deposit: function (name) {
    var freeze_box = this.storage.get(name);

    if(!freeze_box){
      return {"success": false, "message": "There is no such freezeBox"};
    }

    if(freeze_box.status === 1){
      return {"success": false, "message": "Box is already frozen by guarantor"};
    }

    if(!freeze_box.members.hasOwnProperty(Blockchain.transaction.from)){
      return {"success": false, "message": "You are not a member of deal"};
    }

    var balance = new BigNumber(freeze_box.members[Blockchain.transaction.from]);
    freeze_box.members[Blockchain.transaction.from] = balance.plus(Blockchain.transaction.value);
    freeze_box.bank = freeze_box.bank.plus(Blockchain.transaction.value);

    this.storage.put(name, freeze_box);
    return {"success": true};
  },

  info: function (name) {
    var freeze_box = this.storage.get(name);

    if(!freeze_box){
      return {"success": false, "message": "There is no such freezeBox"};
    }

    if(!freeze_box.members.hasOwnProperty(Blockchain.transaction.from)){
      if(freeze_box.guarantor !== Blockchain.transaction.from){
        return {"success": false, "message": "FreezeBox info only accessible for it members or guarantor"};
      }
    }

    var output = freeze_box;
    output["success"] = true;
    return output;
  },

  open: function (name, beneficiary) {
    var freeze_box = this.storage.get(name);

    if(!freeze_box){
      return {"success": false, "message": "There is no such freezeBox"};
    }

    if(freeze_box.guarantor !== Blockchain.transaction.from){
      return {"success": false, "message": "Only " + freeze_box.guarantor + " can open the box"};
    }

    if(freeze_box.status === 0){
      return {"success": false, "message": "You need to freeze the box first"};
    }

    if(!freeze_box.members.hasOwnProperty(beneficiary)){
      return {"success": false, "message": beneficiary + " is not a member of deal"};      
    }

    var guarantorComission = freeze_box.bank.dividedToIntegerBy(100).times(freeze_box.comission);
    freeze_box.bank = freeze_box.bank.minus(guarantorComission);
    
    Blockchain.transfer(freeze_box.guarantor, guarantorComission);
    Blockchain.transfer(beneficiary, freeze_box.bank);

    this.storage.delete(name);

    return {"success": true};
  }
};
module.exports = FreezeBox;