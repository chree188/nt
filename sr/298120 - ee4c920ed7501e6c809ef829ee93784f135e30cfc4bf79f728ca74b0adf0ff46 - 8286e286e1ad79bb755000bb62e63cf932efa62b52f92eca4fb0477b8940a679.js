var NebulagramContract = function() {
    LocalContractStorage.defineMapProperty(this, "messages")
}

NebulagramContract.prototype = {
    init: function() {},

    sendMessage: function(toAddress, message) {
        // need to verify wallet address
        if (toAddress != null && toAddress != "" && message != null && message != "") {
            this.messages.put(toAddress, message)

            return 'Send successful'
        } else {
            return 'Invalid to address or message, not sent'
        }
    },

    readMessage: function() {
        var message = this.messages.get(Blockchain.transaction.from)

        if (!message || message.trim() === "") {
            return "No message was received for this address"
        } else {
            return message;
        }
    },
}

module.exports = NebulagramContract