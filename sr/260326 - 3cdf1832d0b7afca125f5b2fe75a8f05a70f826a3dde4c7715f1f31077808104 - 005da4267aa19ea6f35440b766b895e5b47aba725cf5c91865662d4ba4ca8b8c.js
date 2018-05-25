// NasWarriors by Soulchain
// 2018.

'use strict';

var Item = function (text) {
  if (text) {
    var obj = JSON.parse(text)

    this.id = obj.id
    this.name = obj.name
    this.price = obj.price
    this.owner = obj.owner
    this.imageUrl = obj.imageUrl
    this.desc = obj.desc
  } else {
    this.id = ""
    this.name = ""
    this.price = ""
    this.owner = ""
    this.imageUrl = ""
    this.desc = ""
  }
}

Item.prototype = {
  toString: function () {
    return JSON.stringify(this)
  }
}

var NasWarriors = function () {
  LocalContractStorage.defineProperty(this, "author")
  LocalContractStorage.defineProperty(this, "balance")
  LocalContractStorage.defineProperty(this, "numItems")
  LocalContractStorage.defineMapProperty(this, "items", {
    parse: function (text) {
      return new Item(text);
    },
    stringify: function (o) {
      return o.toString();
    },
  });
}

var notAuthorError = new Error("You are not the author")
var itemDNEError = new Error("Item does not exist")

NasWarriors.prototype = {
  init: function() {
    this.author = Blockchain.transaction.from
    this.numItems = 0
    this.balance = new BigNumber(0)

    var items = [
      {
        id: "0",
        name: "Shiny Axe",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/0.png",
        desc: "Not as sharp as a knife, but still deadly",
      },
      {
        id: "1",
        name: "Excaliber",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/1.png",
        desc: "People still wait for the man who can pull it from a rock",
      },
      {
        id: "2",
        name: "Scorpio",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/2.png",
        desc: "Scorpio is known to work particularly well with poison",
      },
      {
        id: "3",
        name: "Angel Rifle",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/3.png",
        desc: "A fallen angel stole a rifle and dropped it by mistake",
      },
      {
        id: "4",
        name: "Aladin",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/4.png",
        desc: "One must train for at least a decade to swing Aladin",
      },
      {
        id: "5",
        name: "Spiky Mace",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/5.png",
        desc: "An unknown adventurer found it in a deep dungeon",
      },
      {
        id: "6",
        name: "Fire Revolver",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/6.png",
        desc: "It usually only takes one shot to kill a bear with this",
      },
      {
        id: "7",
        name: "Cutlass",
        price: "" + 1e16,
        owner: this.author,
        imageUrl: "http://naswarriors.soulchain.org/images/7.png",
        desc: "All pirates aspire to have this Cutlass",
      },
    ]

    for (var i=0; i<items.length; i++) {
      var item = items[i]

      this.create(item.name, item.price, item.owner, item.imageUrl, item.desc)
    }
  },

  create: function(name, price, owner, imageUrl, desc) {
    var from = Blockchain.transaction.from

    if (!this._isAuthor(from)) {
      throw notAuthorError
    }

    var idx = this.numItems
    var item = new Item(JSON.stringify({
      id: idx,
      name,
      price,
      owner: from,
      imageUrl,
      desc,
    }))

    this.items.set(idx, item)
    this.numItems += 1
  },

  update: function(idx, name, price, owner, imageUrl, desc) {
    var from = Blockchain.transaction.from

    if (!this._isAuthor(from)) {
      throw notAuthorError
    }

    var item = this.getItem(idx)

    if (!item) {
      throw itemDNEError
    }

    // TODO: make it pass opt parameters
    item.name = name
    item.price = price
    item.owner = owner
    item.imageUrl = imageUrl
    item.desc = desc

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

  purchase: function(idx) {
    var sender = Blockchain.transaction.from
    var payment = new BigNumber(Blockchain.transaction.value)
    var item = this.getItem(idx)

    if (!item) {
      throw itemDNEError
    }

    var itemPrice = new BigNumber(item.price)
    var prevPrice = itemPrice
    var prevOwner = item.owner

    if (payment.lt(itemPrice)) {
      throw new Error("Item price " + itemPrice + " is more expensive than payment " + payment)
    }

    if (sender === item.owner) {
      throw new Error("You can't buy an item you already own")
    }

    // Give the sender back excess money
    if (itemPrice.lt(payment)) {
      var leftover = payment.minus(itemPrice)
      Blockchain.transfer(sender, leftover)
    }

    // Give current owner his cut
    Blockchain.transfer(prevOwner, itemPrice.times(0.95))

    // Transfer item ownership to new owner and increase price by 10%
    item.owner = sender
    item.price = itemPrice.times(1.1)
    this.items.set(idx, item)

    // Keep track of contract's balance (collected 5% fee from item transaction)
    this.balance = new BigNumber(this.balance).plus(itemPrice.times(0.05))

    return true
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

  _isAuthor: function(address) {
    if (!Blockchain.verifyAddress(address)) {
      throw new Error("Invalid sender address")
    }

    return address === this.author
  },
}

module.exports = NasWarriors;
