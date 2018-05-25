'use strict';
var Domain = function() {
  LocalContractStorage.defineMapProperty(this, "domain");
  LocalContractStorage.defineProperty(this, "amount", {
    stringify: function(obj) {
      return obj.toString();
    },
    parse: function(str) {
      return new BigNumber(str);
    }
  });
  LocalContractStorage.defineProperty(this, "owner");
  LocalContractStorage.defineProperty(this, "suffix");
  LocalContractStorage.defineMapProperty(this, "user");
  LocalContractStorage.defineMapProperty(this, "registerFee");
}
Domain.prototype = {
  init: function() {
    this.owner = Blockchain.transaction.from;
    this.amount = new BigNumber(0);
    this.suffix = ['.nas'];
    this.registerFee.set('.nas', new BigNumber(10 ** 15));
  },
  onlyAuthor: function() {
    return this.owner == Blockchain.transaction.from;
  },
  balanceOf: function() {
    return this.amount;
  },
  withdraw: function() {
    Blockchain.transfer(this.owner, this.amount);
    this.amount = new BigNumber(0);
  },
  setSuffix: function(suf) {
    if (this.onlyAuthor()) {
      this.suffix = suf;
    }
  },
  search: function(domain) {
    return this.domain.get(domain);
  },
  register: function(domain) {
    if (!this.validDomain(domain))
      throw new Error('invalid domain');
    if (!this.search(domain)) {
      if (Blockchain.transaction.value.toString()==this.getFee(domain).toString()) {
        var user = Blockchain.transaction.from;
        this.amount=this.amount.plus(new BigNumber(Blockchain.transaction.value));
        this.domain.set(domain, { owner: user });
        var prev = this.user.get(user) || [];
        prev.push(domain);
        this.user.set(user, prev);
      } else {
        throw new Error('incorrect fee: income is ' + Blockchain.transaction.value + 'but require is ' + this.getFee(domain).toString());
      }
    } else {
      throw new Error('already registered!');
    }
  },
  setRegisterFee: function(suffix, fee) {
    if (this.onlyAuthor()) {
      this.registerFee.set(suffix, new BigNumber(fee));
    } else {
      throw new Error('only author');
    }
  },
  resolution: function(domain, address) {
    var owner = Blockchain.transaction.from;
    if (this.search(domain).owner == owner) {
      this.domain.set(domain, { owner: owner, address: address });
    } else {
      throw new Error('cannot resolute it');
    }
  },
  getFee: function(domain) {
    if (!this.user.get(Blockchain.transaction.from))
      return 0;
    var reg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    var res = reg.exec(domain);
    return this.registerFee.get(res[1]);
  },
  validDomain: function(domain) {
    var reg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    var res = reg.exec(domain);
    return res && this.suffix.indexOf(res[1]) >= 0;
  },
  getMyDomains: function() {
    return this.user.get(Blockchain.transaction.from);
  }
};
module.exports = Domain;
