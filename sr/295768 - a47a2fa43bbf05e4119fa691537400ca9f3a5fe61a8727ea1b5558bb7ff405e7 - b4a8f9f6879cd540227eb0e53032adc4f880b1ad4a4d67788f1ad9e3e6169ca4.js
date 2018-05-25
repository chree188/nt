"use strict";

var Ad = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.image = obj.image;
    this.url = obj.url;
    this.title = obj.title;
    this.description = obj.description;
    this.id = obj.id;
    this.sponsorship_nas = obj.sponsorship_nas;
    this.balance = new BigNumber(obj.balance);
    this.sponsor = obj.sponsor;
  } else {
    this.image = '';
    this.url = '';
    this.title = '';
    this.description = '';
    this.id = 0;
    this.sponsorship_nas = 0;
    this.balance = new BigNumber(0);
    this.sponsor = '';
  }
};

Ad.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var FaucetContract = function () {
  //config
  LocalContractStorage.defineProperty(this, "per_nas");
  LocalContractStorage.defineProperty(this, "min_nas");
  LocalContractStorage.defineProperty(this, "max_nas");
  LocalContractStorage.defineProperty(this, "min_sponsorship_nas");
  LocalContractStorage.defineProperty(this, "interval");
  LocalContractStorage.defineProperty(this, "fee");
  LocalContractStorage.defineProperty(this, "admin");
  LocalContractStorage.defineProperty(this, "status");
  LocalContractStorage.defineProperty(this, "init_nas");
  //state
  LocalContractStorage.defineProperty(this, "balance");
  LocalContractStorage.defineProperty(this, "total_amount");
  LocalContractStorage.defineProperty(this, "ad_count");
  LocalContractStorage.defineProperty(this, "user_count");
  LocalContractStorage.defineProperty(this, "sponsor_count");
  LocalContractStorage.defineProperty(this, "current_ad");
  LocalContractStorage.defineProperty(this, "claim_count");
  LocalContractStorage.defineMapProperty(this, "users");
  LocalContractStorage.defineMapProperty(this, "sponsor_ads");
  LocalContractStorage.defineMapProperty(this, "ads", {
    parse: function (text) {
      return new Ad(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

//-----

FaucetContract.prototype = {
  init: function () {
    this.balance = new BigNumber(0);
    this.total_amount = new BigNumber(0);
    this.ad_count = 0;
    this.sponsor_count = 0;
    this.user_count = 0;
    this.claim_count = 0;
    this.current_ad = 0;

    this.min_nas = 0.001;
    this.max_nas = 0.003;
    this.init_nas = 0.001;
    this.interval = 60;
    this.min_sponsorship_nas = 0.01;
    this.status = 1;

    //todo
    this.admin = 'n1MmXphe3dhLFefGH9cBcxGsncc2J8cWTVJ';
    // this.admin = 'n1Z8qRgHuj55zURTWqGMWQpW2EoX57gf3h9';

  },

  config: function (min, max, interval, min_sponsorship_nas, status, init_nas) {
    if (Blockchain.transaction.from != this.admin) {
      throw new Error("Permission denied.");
    }
    this.min_nas = min;
    this.max_nas = max;
    this.interval = interval;
    this.min_sponsorship_nas = min_sponsorship_nas;
    this.status = status;
    this.init_nas = init_nas;
    return true;
  },

  dashboard: function () {
    return {
      balance: this.balance,
      total_amount: this.total_amount,
      ad_count: this.ad_count,
      sponsor_count: this.sponsor_count,
      user_count: this.user_count,
      claim_count: this.claim_count,


      min_nas: this.min_nas,
      max_nas: this.max_nas,
      interval: this.interval,
      min_sponsorship_nas: this.min_sponsorship_nas,
      status: this.status,
      init_nas: this.init_nas,

      current_ads: this.getCurrentAd(),
      ads: this.allAds(0, 0),

      from: Blockchain.transaction.from,
      last_claim: this.users.get(Blockchain.transaction.from)

    }
  },

  newSponsor: function (title, description, image, url) {
    var sponsor = Blockchain.transaction.from;
    var sponsorship_nas = Blockchain.transaction.value;
    var ad_id = this.ad_count;
    // var storyCount = this.count();
    if (new BigNumber(this.min_sponsorship_nas * 1000000000000000000).gt(sponsorship_nas)) {
      throw new Error("too little");
    }

    var ad = new Ad();
    ad.id = ad_id;
    ad.title = title;
    ad.description = description;
    ad.image = image;
    ad.url = url;
    ad.sponsorship_nas = sponsorship_nas;
    ad.balance = sponsorship_nas;
    ad.sponsor = sponsor;
    this.ads.put(this.ad_count, ad);

    if (!this.sponsor_ads.get(sponsor)) {
      this.sponsor_count = this.sponsor_count + 1;
    }
    this._saveSponsorAds(sponsor, ad_id);

    this.ad_count = ad_id + 1;
    this.total_amount = sponsorship_nas.plus(this.total_amount);
    this.balance = sponsorship_nas.plus(this.balance);

    return true;
  },

  _saveSponsorAds: function (sponsor, ad_id) {
    var ads = this.sponsor_ads.get(sponsor);
    ads = ads || [];
    ads.push(ad_id);
    this.sponsor_ads.del(sponsor);
    this.sponsor_ads.put(sponsor, ads);
  },

  _getAdsById: function (ad_ids) {
    var ret = [];
    if (!ad_ids || ad_ids.length == 0)
      return ret;
    for (var j = 0, len = ad_ids.length; j < len; j++) {
      var ad = this.ads.get(ad_ids[j]);
      if (ad) {
        ret.push(ad);
      }
    }

    return ret;
  },

  getSponsorAds: function () {
    var sponsor = Blockchain.transaction.from;
    var ad_ids = this.sponsor_ads.get(sponsor);
    return this._getAdsById(ad_ids);
  },

  claim: function () {
    if (this.status == 0) {
      throw new Error("closed");
    }
    var from = Blockchain.transaction.from;
    var nas = this._randomNas();

    var now = new Date().getTime();
    var latest_time = this.users.get(from);

    if (latest_time) {
      if ((now - latest_time) < 60 * this.interval * 1000) {
        throw new Error("wait");
      }
    }
    this.user_count = this.user_count + 1;
    this.users.put(from, now);

    this._toUser(from, nas);
    return {
      from: from,
      nas: nas
    }
  },

  startup: function (to) {
    if (this.status == 0) {
      throw new Error("closed");
    }

    var now = new Date().getTime();
    var latest_time = this.users.get(to);

    if (latest_time) {
      throw new Error("Sorry, only once.");
    }
    this.user_count = this.user_count + 1;
    this.users.put(to, now);
    this._toUser(to, new BigNumber(this.init_nas));
    return true;
  },

  _toUser: function (who, value) {
    var to = who;
    var value_wei = value.mul(1000000000000000000);
    if ((value_wei).gt(this.balance)) {
      throw new Error("Sorry, no enough nas.");
    }

    var result = Blockchain.transfer(to, value_wei);
    if (!result) {
      Event.Trigger("GetNasTransferFailed", {
        Transfer: {
          from: Blockchain.transaction.to,
          to: from,
          value: nas
        }
      });
      throw new Error("GetNas transfer failed. value:" + nas);
    }

    this.balance = new BigNumber(this.balance).minus(value_wei);
    this.claim_count = this.claim_count + 1;
    this._fromSponsor(value_wei);
  },

  _randomNas: function () {
    var range = this.max_nas - this.min_nas;
    var rand = Math.random();
    return new BigNumber((this.min_nas + Math.round(rand * range * 100000) / 100000).toString().substring(0, 8))//
  },

  _fromSponsor: function (value) {
    var ad = this.ads.get(this.current_ad);
    if (ad.balance.gt(value)) {
      ad.balance = ad.balance.sub(value);
      this.ads.set(ad.id, ad);
    } else {
      var surplus = new BigNumber(value).sub(ad.balance);
      ad.balance = 0;
      this.ads.set(ad.id, ad);
      this.current_ad = this.current_ad + 1;
      var newAd = this.ads.get(this.current_ad);
      newAd.balance = newAd.balance.sub(surplus);
      this.ads.set(newAd.id, newAd)

    }
  },

  getCurrentAd: function () {
    return this.ads.get(this.current_ad)
  },

  takeout: function (value) {
    if (Blockchain.transaction.from != this.admin) {
      throw new Error("Permission denied.");
    }

    var result = Blockchain.transfer(this.admin, value * 1000000000000000000);
    if (!result) {

      Event.Trigger("TakeoutFailed", {
        Transfer: {
          from: Blockchain.transaction.to,
          to: this.admin,
          value: value
        }
      });

      throw new Error("Takeout failed. Address:" + this.admin + ", NAS:" + value);
    }
    return 'success';
  },

  refund: function () {
    if (Blockchain.transaction.from != this.admin) {
      throw new Error("Permission denied.");
    }
    for (var i = this.current_ad; i < this.ad_count; i++) {
      var ad = this.ads.get(i);
      var result = Blockchain.transfer(ad.sponsor, ad.balance);
      if (!result) {
        Event.Trigger("RefundFailed", {
          Transfer: {
            from: Blockchain.transaction.to,
            to: ad.sponsor,
            value: ad.balance
          }
        });
      } else {
        this.balance = new BigNumber(this.balance).sub(ad.balance);
        ad.balance = new BigNumber(0);
        this.ads.put(i, ad);
      }
    }
    return 'success';
  },

  allAds: function (limit, offset) {
    if (limit == 0) {
      limit = this.ad_count;
    }
    var ret = [];
    for (var i = offset; i < limit + offset; i++) {
      var ad = this.ads.get(i);
      if (ad) {
        ret.push(ad);
      }
    }
    return ret;
  }

};

module.exports = FaucetContract;