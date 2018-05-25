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
  LocalContractStorage.defineMapProperty(this, "user"); //[domain1,...]
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
    var domainInfo = this.search(domain);
    if (!domainInfo) {
      if (Blockchain.transaction.value.toString() == this.getFee(domain).toString()) {
        var user = Blockchain.transaction.from;
        this.amount = this.amount.plus(new BigNumber(Blockchain.transaction.value));
        this.domain.set(domain, { owner: user });
        var prev = this.user.get(user) || [];
        prev.push(domain);
        this.user.set(user, prev);
      } else {
        throw new Error('incorrect fee: income is ' + Blockchain.transaction.value + 'but required is ' + this.getFee(domain).toString());
      }
    } else {
      if (!domainInfo.price > 0)
        throw new Error(domain + ' already registered!');
      if (Blockchain.transaction.value.toString() !== domainInfo.price.toString())
        throw new Error('incorrect fee: income is ' + Blockchain.transaction.value + 'but required is ' + domainInfo.price.toString());
      var user = Blockchain.transaction.from;
      var prevUser=domainInfo.owner;
      if(user==prevUser)
        throw new Error('can not buy your own domain');
      var index=this.user.get(prevUser).indexOf(domain);
      var prevArr= this.user.get(prevUser) || [];
      prevArr=prevArr.splice(index,1);
      this.user.set(prevUser, prevArr);
      this.domain.set(domain, { owner: user });
      var prev = this.user.get(user) || [];
      prev.push(domain);
      this.user.set(user, prev);
      Blockchain.transfer(this.owner, this.amount);
    }
  },
  setRegisterFee: function(suffix, fee) {
    if (this.onlyAuthor()) {
      this.registerFee.set(suffix, new BigNumber(fee));
    } else {
      throw new Error('only author');
    }
  },
  resolution: function(domain, address,pubKey) {
    var owner = Blockchain.transaction.from;
    if (!Blockchain.verifyAddress(address)) {
      throw new Error('invalid address');
    }
    this.onlyOwner(domain);
    var info={ owner: owner, address: address };
    if(pubKey) info.pubKey=pubKey;
    this.domain.set(domain, info);
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
  },
  sell: function(domain, price) {
    if (parseInt(price) <= 0)
      throw new Error('price must greater than 0');
    var dom = this.domain.get(domain);
    dom.price = price;
    this.domain.set(domain, dom);
  },
  onlyOwner: function(domain) {
    if (this.search(domain).owner !== Blockchain.transaction.from) {
      throw new Error('only owner can do it');
    }
  }
};
module.exports = Domain;
//c18792339333bc7d76f5328eb1a5150df1ed663b0f88cd1c885773c55fb66ef6
