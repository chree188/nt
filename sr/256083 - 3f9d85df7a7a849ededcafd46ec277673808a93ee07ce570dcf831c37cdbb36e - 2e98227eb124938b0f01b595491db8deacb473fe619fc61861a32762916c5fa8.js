"use strict";
var MiddlemanContract = function() {
  // Data stored by the smart contract
  LocalContractStorage.defineProperty(this, "transaction_id")
  LocalContractStorage.defineMapProperty(this, "buyer_to_id")
  LocalContractStorage.defineMapProperty(this, "seller_to_id")
  LocalContractStorage.defineMapProperty(this, "id_to_value")
  LocalContractStorage.defineMapProperty(this, "id_to_step") // 1-2-3
  LocalContractStorage.defineMapProperty(this, "id_to_buyer")
  LocalContractStorage.defineMapProperty(this, "id_to_seller")
}

MiddlemanContract.prototype = {
  // init is called once, when the contract is deployed.
  init: function() {
    this.transaction_id = 1; // The first user_id should be 1 (not 0)
  },

  createTransaction: function(seller_address) {
    if(Blockchain.transaction.value<= 0) {
      throw new Error("You need to send money or this app is useless.")
    }
    var buyerBuying = this.buyer_to_id.get(Blockchain.transaction.from);
    var buyerSelling = this.seller_to_id.get(Blockchain.transaction.from);
    var sellerBuying = this.buyer_to_id.get(seller_address);
    var sellerSelling = this.seller_to_id.get(seller_address);
    if(buyerSelling != null || buyerBuying != null) {
        throw new Error("You are already participating in another transaction.");
    }
    if(sellerBuying != null || sellerSelling != null) {
        throw new Error("The seller is already participating in another transaction.");
    }
    var current_id = this.transaction_id;
    this.transaction_id += 1;

    this.buyer_to_id.put(Blockchain.transaction.from, current_id);
    this.seller_to_id.put(seller_address, current_id);
    this.id_to_value.put(current_id, Blockchain.transaction.value);
    this.id_to_step.put(current_id, 1);
    this.id_to_buyer.put(current_id, Blockchain.transaction.from);
    this.id_to_seller.put(current_id, seller_address);
  },

  confirmSending: function() {
    if(Blockchain.transaction.value != 0) { // Users only pay the gas fee.
        throw new Error("Don't send money with this function.");
    }
    var current_id = this.seller_to_id.get(Blockchain.transaction.from);
    if(current_id == null) {
        throw new Error("There is currently no transaction associated with your address.");
    }
    var step = this.id_to_step.get(current_id);
    if(step!=1) {
      throw new Error("You can not do that right now.")
    }
    this.id_to_step.put(current_id, 2);
  },

  confirmReceiving: function() {
    if(Blockchain.transaction.value != 0) { // Users only pay the gas fee.
        throw new Error("Don't send money with this function.");
    }
    var current_id = this.buyer_to_id.get(Blockchain.transaction.from);
    if(current_id == null) {
        throw new Error("There is currently no transaction associated with your address.");
    }
    var step = this.id_to_step.get(current_id);
    if(step!=2) {
      throw new Error("You can not do that right now.")
    }

    var amount = this.id_to_value.get(current_id);
    var seller_address = this.id_to_seller.get(current_id);
    var result = Blockchain.transfer(seller_address, amount);
    if (!result) {
      throw new Error("Transfer failed.");
    }
    Event.Trigger("MiddlemanContract", {
      Transfer: {
        from: Blockchain.transaction.from,
        to: seller_address,
        value: amount.toString()
      }
    });
    this.id_to_step.put(current_id, 3);

    this.buyer_to_id.del(Blockchain.transaction.from);
    this.seller_to_id.del(this.id_to_seller.get(current_id));
  },

  getAddressInfo: function () {
    var current_id_buyer = this.buyer_to_id.get(Blockchain.transaction.from);
    var current_id_seller = this.seller_to_id.get(Blockchain.transaction.from);
    
    var data = {};
    if(current_id_buyer == null && current_id_seller == null) {
        data["isAlreadyTransacting"] = false;
        return JSON.stringify(data);
    } else {
        data["isAlreadyTransacting"] = true;
        var current_id;
        if(current_id_buyer) {
          current_id = current_id_buyer;
          data["isBuyer"] = true;
          data["isSeller"] = false;
        } else {
          current_id = current_id_seller;
          data["isBuyer"] = false;
          data["isSeller"] = true;
        }
        data["buyer"] = this.id_to_buyer.get(current_id);
        data["seller"] = this.id_to_seller.get(current_id);
        data["value"] = this.id_to_value.get(current_id);
        data["step"] = this.id_to_step.get(current_id);
        return JSON.stringify(data);
    }
  },

  getTransactionAsBuyer: function () {
    var current_id = this.buyer_to_id.get(Blockchain.transaction.from);
    if(current_id == null) {
        throw new Error("There is currently no transaction associated with your address.");
    }
    var data = {};
    data["buyer"] = this.id_to_buyer.get(current_id);
    data["seller"] = this.id_to_seller.get(current_id);
    data["value"] = this.id_to_value.get(current_id);
    data["step"] = this.id_to_step.get(current_id);
    return JSON.stringify(data);
  },

  getTransactionAsSeller: function () {
    var current_id = this.seller_to_id.get(Blockchain.transaction.from);
    if(current_id == null) {
        throw new Error("There is currently no transaction associated with your address.");
    }
    var data = {};
    data["buyer"] = this.id_to_buyer.get(current_id);
    data["seller"] = this.id_to_seller.get(current_id);
    data["value"] = this.id_to_value.get(current_id);
    data["step"] = this.id_to_step.get(current_id);
    return JSON.stringify(data);
  },

  getTransactionCount: function() {
    return this.transaction_id;
  },
}

module.exports = MiddlemanContract