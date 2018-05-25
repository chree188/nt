WitnessContract = function() {
    LocalContractStorage.defineMapProperties(this, {
        messages: null,
        messageCounter: null,
        messageBlockNo: null
    });
};

WitnessContract.prototype = {
    init: function() {},
    store: function(message) {
        var from = Blockchain.transaction.from;
        var counter = this.messageCounter.get(from);
        if (!counter) {
            counter = 0;
        }
        k = from + counter;
        this.messages.set(k, message);
        this.messageCounter.set(from, ++counter);
        this.messageBlockNo.set(k, Blockchain.block.height);
        return true;
    },
    query: function(from, counter) {
        k = from + counter;
        return {
            message: this.messages.get(k),
            blockNo: this.messageBlockNo.get(k)
        };
    }
};

module.exports = WitnessContract;