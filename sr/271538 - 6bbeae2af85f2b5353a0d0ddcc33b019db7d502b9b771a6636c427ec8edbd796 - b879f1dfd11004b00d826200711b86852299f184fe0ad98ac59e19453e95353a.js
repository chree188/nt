"use strict";

var NBTeam = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.balance = obj.balance;
    this.members = obj.members;
    this.count = obj.count; 
  } else {
    this.balance = new BigNumber(0);
    this.members = [];
    this.count = 0;
  }
};

NBTeam.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var NBMember = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.balance = obj.balance;
    this.expiryHeight = obj.expiryHeight;
  } else {
    this.balance = new BigNumber(0);
    this.expiryHeight = new BigNumber(0);
  }
};

NBMember.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var PoNBContract = function () {
  LocalContractStorage.defineMapProperty(this, "gameConfig", {
    stringify: function (obj) {
        return obj.toString();
    },
    parse: function (str) {
        return new BigNumber(str);
    }
  });
  LocalContractStorage.defineMapProperty(this, "team", {
    parse: function (text) {
      return new NBTeam(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "members", {
    parse: function (text) {
      return new NBMember(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineProperties(this, {
    daBoss: null,
    prizeRatio: null
  });
};

PoNBContract.prototype = {
  init: function () {
    this.gameConfig.put("minDeposit", "10000000000000000");// 0.01 NAS;
    this.team.put("ponb", new NBTeam());

    this.daBoss = "n1UziJREeLNgTQPDK8AAfZdutJdBvHVhXQ5";
    this.prizeRatio = 0.1;
  },
  deposit: function (height) {
    var contribution = Blockchain.transaction.value;
    var minDeposit = this.gameConfig.get("minDeposit");
    // throw new Error("contribution: " + contribution + "minDeposit: " + minDeposit);
    if (contribution.lt(minDeposit)) {
      throw new Error("deposit too low"+ "; contribution: " + contribution + "; minDeposit: " + minDeposit);
    }
    
    var prizeMoney = new BigNumber(0);
    var nbTeam = this.team.get("ponb");    
    if (nbTeam.count > 0) {
      prizeMoney = contribution.times(new BigNumber(this.prizeRatio));  
      this._distribute(prizeMoney, nbTeam);
    } 
    
    var from = Blockchain.transaction.from;
    var myMember = this.members.get(from);
    if (!myMember) {
      myMember = new NBMember();
      nbTeam.members.push(from);
      nbTeam.count += 1;
    } 
    var forMe = contribution.minus(prizeMoney);
    myMember.balance = (new BigNumber(myMember.balance)).plus(forMe);
    var bk_height = new BigNumber(Blockchain.block.height);
    myMember.expiryHeight = bk_height.plus(height);
    this.members.put(from, myMember);

    nbTeam.balance = (new BigNumber(nbTeam.balance)).plus(contribution);
    this.team.set("ponb", nbTeam);
  },
  _distribute: function (amount, nbTeam) {
    var teamMembers = nbTeam.members;
    teamMembers.forEach((addr) => {
      var member = this.members.get(addr);
      var mBalance = new BigNumber(member.balance);
      var ratio = mBalance.dividedBy(new BigNumber(nbTeam.balance));
      var money = amount.times(ratio);
      member.balance= mBalance.plus(money);
      this.members.set(addr, member);
    });
  },
  withdraw: function (value) {
		var from = Blockchain.transaction.from;
		var bk_height = new BigNumber(Blockchain.block.height);
		var amount = new BigNumber(value);

		var member = this.members.get(from);
		if (!member) {
			throw new Error("Join the game before you can withdraw.");
		}

		if (bk_height.lt(member.expiryHeight)) {
			throw new Error("Can not takeout before expiryHeight.");
		}

		if (amount.gt(member.balance)) {
			throw new Error("Insufficient balance.");
		}

		member.balance = member.balance.sub(amount);
		this.members.put(from, member);
    var theTeam = this.team.get("ponb");
    theTeam.balance = team.balance.sub(amount);
    this.team.put("ponb", theTeam);

		var result = Blockchain.transfer(from, amount);
		if (!result) {
			throw new Error("transfer failed.");
		}
		Event.Trigger("PoNB", {
			Transfer: {
				from: Blockchain.transaction.to,
				to: from,
				value: amount.toString()
			}
		});
	},
  getMinDeposit: function () {
    return this.gameConfig.get("minDeposit");
  },
  getTeam: function () {
    return this.team.get('ponb');
  },
  getMe: function () {
    var from = Blockchain.transaction.from;
    return this.members.get(from);
  },
  getBalance: function (addr) {
    var member = this.members.get(addr);
    return member.balance;
  },
  getBalances: function() {
    var theTeam = this.team.get("ponb");
    var members = theTeam.members;
    var result = [];
    members.forEach((member) => {
      var theBalance = this.getBalance(member);
      result.push({addr: member, balance: theBalance});
    });
    return result;
  }
};

module.exports = PoNBContract;