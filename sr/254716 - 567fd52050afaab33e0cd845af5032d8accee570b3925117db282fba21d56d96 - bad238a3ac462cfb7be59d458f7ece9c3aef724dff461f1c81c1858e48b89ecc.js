var WishBoard = function() {
  // 定义智能合约中用到的变量
  LocalContractStorage.defineMapProperty(this, "user_to_id")
  LocalContractStorage.defineMapProperty(this, "id_to_message")
  LocalContractStorage.defineProperty(this, "user_count")
}

WishBoard.prototype = {
  // 将第一个用户初始化为1.
  init: function() {
    this.user_count = 1;
  },

  postMessage: function (new_user_message) {
    if(Blockchain.transaction.value != 0) {
        throw new Error("Please make your wish.");
    }

    var user_id = this.user_to_id.get(Blockchain.transaction.from);
    if(!user_id) {
      user_id = this.user_count;
      this.user_count++;
      this.user_to_id.put(Blockchain.transaction.from, user_id);
    }
    this.id_to_message.put(user_id, new_user_message);
  },

  getMyMessage: function () {
    var user_id = this.user_to_id.get(Blockchain.transaction.from);
    if(user_id) {
      return this.id_to_message.get(user_id);
    }
  },

  getRandomMessage: function () {
    var random_user_id = Math.floor(Math.random() * this.user_count);
    return this.id_to_message.get(random_user_id);
  },
  getMessages: function() {
    var messages = [];
    for (var i = 0; i < this.user_count; i++) {
      var message = this.id_to_message.get(i);
      messages.push(message);
    }
    return messages
  },
  getUserCount: function() {
    return this.user_count
  },
}

module.exports = WishBoard