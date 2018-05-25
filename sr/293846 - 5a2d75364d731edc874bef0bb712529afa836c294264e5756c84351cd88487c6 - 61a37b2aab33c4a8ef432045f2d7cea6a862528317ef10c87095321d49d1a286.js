// NasBay by Soulchain.org
// Users can place a bid on an item. When the item auction expires,
// the highest bidder gets the ownership.
// 2018.

'use strict';

var Item = function(text) {
  if (text) {
    var obj = JSON.parse(text)

    this.id = obj.id
    this.name = obj.name
    this.price = obj.price // current bid price
    this.bidder = obj.bidder // current bidder
    this.owner = obj.owner
    this.imageUrl = obj.imageUrl
    this.desc = obj.desc
    this.expiration = obj.expiration
    this.numBids = 0
  } else {
    this.id = ""
    this.name = ""
    this.price = ""
    this.bidder = ""
    this.owner = ""
    this.imageUrl = ""
    this.desc = ""
    this.expiration = ""
    this.numBids = ""
  }
}

Item.prototype = {
  toString: function () {
    return JSON.stringify(this)
  }
}

var NasBay = function () {
  LocalContractStorage.defineProperty(this, "author")
  LocalContractStorage.defineProperty(this, "balance")
  LocalContractStorage.defineProperty(this, "numItems")
  LocalContractStorage.defineProperty(this, "isAuctionCreationPublic")
  LocalContractStorage.defineMapProperty(this, "items", {
    parse: function(text) {
      return new Item(text);
    },
    stringify: function (o) {
      return o.toString();
    },
  });
  LocalContractStorage.defineMapProperty(this, "addressToAllowance")
}

var notAuthorError = new Error("You are not the author")
var notOwnerError = new Error("You are not the item owner")
var itemDNEError = new Error("Item does not exist")

NasBay.prototype = {
  init: function() {
    this.author = Blockchain.transaction.from
    this.numItems = 0
    this.balance = new BigNumber(0)
    this.isAuctionCreationPublic = false

    var items = [
      {
        id: "0",
        name: "Hairy Bulls",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/0.png",
        desc: "Its cute looks can be deceiving as its bulls are deadly.",
      },
      {
        id: "1",
        name: "Big Eye",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/1.png",
        desc: "Big Eye can see as far as a mile ahead but he cannot hear anything.",
      },
      {
        id: "2",
        name: "Slime",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/2.png",
        desc: "Mostly friendly and is more comfortable around fire than ice.",
      },
      {
        id: "3",
        name: "Hexapus",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/3.png",
        desc: "Hexapus is an endangered species, as it has been a target for many because its legs are known to be a delicacy in the East.",
      },
      {
        id: "4",
        name: "Birdy Bulls",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/4.png",
        desc: "A friend of Hairy Bulls, Birdy Bulls is a fickle traveller that can be found anywhere in the world.",
      },
      {
        id: "5",
        name: "Dumbo",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/5.png",
        desc: "Friend of Slime, Dumbo gets drunk with Jello shots.",
      },
      {
        id: "6",
        name: "Mad Bulls",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/6.png",
        desc: "You don't want to mess with Mad Bulls, period. Very aggressive to strangers but loyal to his old friends.",
      },
      {
        id: "7",
        name: "Squary",
        price: "" + 1e16,
        owner: this.author,
        bidder: this.author,
        imageUrl: "http://nasbay.soulchain.org/images/7.png",
        desc: "Its body cannot be penetrated with even the strongest weapons, but its limbs are easily broken.",
      },
    ]

    for (var i=0; i<items.length; i++) {
      var item = items[i]

      this.postItem(item.name, item.price, item.imageUrl, item.desc)
    }
  },

  postItem: function(name, price, imageUrl, desc, expiration) {
    var sender = Blockchain.transaction.from

    if (!this.isAuctionCreationPublic && !this._isAuthor(sender)) {
      throw new Error("Only the author can create new auctions for now")
    }

    var idx = this.numItems
    var now = new Date()
    var expireInOneMonth = new Date(now.getFullYear(), now.getMonth()+1, now.getDate())
    var item = new Item(JSON.stringify({
      id: idx,
      name,
      price,
      bidder: sender,
      owner: sender,
      imageUrl,
      desc,
      expiration: expiration || expireInOneMonth,
      numBids: 0,
    }))

    this.items.set(idx, item)
    this.numItems += 1
  },

  updateItem: function(idx, name, price, imageUrl, desc, expiration) {
    var from = Blockchain.transaction.from

    if (!(this._isAuthor(sender) || item.owner === sender)) {
      throw notOwnerError
    }

    var item = this.getItem(idx)

    if (!item) {
      throw itemDNEError
    }

    item.name = name
    item.price = price
    item.imageUrl = imageUrl
    item.desc = desc
    item.expiration = expiration

    this.items.set(idx, item)
  },

  getItem: function(idx) {
    return this.items.get(idx)
  },

  getItems: function() {
    var items = []

    for (var i=0; i<this.numItems; i++) {
      var item = this.getItem(i)

      items.push(item)
    }

    return items
  },

  bid: function(idx) {
    var sender = Blockchain.transaction.from
    var payment = new BigNumber(Blockchain.transaction.value)
    var item = this.getItem(idx)

    if (!item) {
      throw itemDNEError
    }

    if (sender === item.owner) {
      throw new Error("You can't bid your own item")
    }

    var currentPrice = new BigNumber(item.price)

    if (payment.lt(currentPrice)) {
      throw new Error("Highest bid " + currentPrice + " is more expensive your bid " + payment)
    }

    this._addBidForItem(idx, payment, sender)

    return true
  },

  _addBidForItem: function(idx, price, bidder) {
    var item = this.getItem(idx)
    var prevPrice = new BigNumber(item.price)
    var prevBidder = item.bidder

    // Give money back to the previous bidder
    if (item.numBids > 0 && item.bidder !== bidder) {
      this._subtractAllowance(bidder, prevPrice)
      Blockchain.transfer(prevBidder, prevPrice)
    }

    item.price = price
    item.bidder = bidder
    item.numBids += 1
    this.items.set(idx, item)
  },

  _subtractAllowance: function(address, amount) {
    var allowance = this.addressToAllowance.get(address)

    if (!allowance) {
      throw new Error("User does not have allowance")
    }

    allowance = new BigNumber(allowance)

    if (allowance.lt(amount)) {
      throw new Error("This user did not send enough money when they put a bid before. Unable to refund.")
    }

    this.addressToAllowance.set(address, allowance.minus(amount))
  },

  // Run a cron job to finish expired auctions
  endAuctionForItems: function() {
    var sender = Blockchain.transfer.from

    if (!this._isAuthor(sender)) {
      throw notAuthorError
    }

    for (var i=0; i<this.numItems; i++) {
      var item = this.items[i]

      if (item.isVisible && item.expiration < new Date()) {
        this._endAuctionForItem(i)
      }
    }

    return true
  },

  _endAuctionForItem: function(idx) {
    var item = this.getItem(idx)

    if (!item) {
      throw itemDNEError
    }

    var prevOwner = item.owner
    var currentBidPrice = new BigNumber(item.price)

    this._subtractAllowance(item.bidder, currentBidPrice)

    Blockchain.transfer(prevOwner, currentBidPrice.times(0.95))

    item.owner = item.bidder
    item.isVisible = false
    this.items.set(idx, item)
  },

  getAuthor: function() {
    return this.author
  },

  withdraw: function(amount) {
    var sender = Blockchain.transaction.from

    if (!this._isAuthor(sender)) {
      throw notAuthorError
    }

    if (amount) {
      Blockchain.transfer(sender, amount)
    } else {
      Blockchain.transfer(sender, new BigNumber(this.balance))
      this.balance = new BigNumber(0)
    }
  },

  getBalance: function() {
    return this.balance
  },

  setIsAuctionCreationPublic: function(flag) {
    var sender = Blockchain.transfer.from

    if (!this._isAuthor(sender)) {
      throw notAuthorError
    }

    this.isAuctionCreationPublic = flag

    return true
  },

  _isAuthor: function(address) {
    if (!Blockchain.verifyAddress(address)) {
      throw new Error("Invalid sender address")
    }

    return address === this.author
  },
}

module.exports = NasBay;
