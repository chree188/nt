var Item = function (text) {
  if (text) {
    var obj = JSON.parse(text)
    this.key = obj.email
    this.value = ''
  } else {
    this.key = ''
    this.value = ''
  }
}

Item.prototype = {
  toString: function () {
    return JSON.stringify(this)
  }
}

var User = function () {
  LocalContractStorage.defineMapProperty(this, 'repo', {
    parse: function (text) {
      return new Item(text)
    },
    stringify: function (obj) {
      return obj.toString()
    }
  })
}

User.prototype = {
  init: function () {
  },

  save: function (key, value) {
    key = key.trim()
    value = value.trim()

    var from = Blockchain.transaction.from
    var item = this.repo.get(key)

    if (item) {
      throw new Error('value has been occupied')
    }

    item = new Item()
    item.key = key
    item.value = from

    this.repo.put(from, item)
  },

  get: function (key) {
    key = key.trim()
    if (key === '') {
      throw new Error('empty key')
    }
    return this.repo.get(key)
  }
}

module.exports = User
