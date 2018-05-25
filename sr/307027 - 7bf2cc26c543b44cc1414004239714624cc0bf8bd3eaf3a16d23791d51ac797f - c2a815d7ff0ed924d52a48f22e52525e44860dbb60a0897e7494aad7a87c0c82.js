"use strict"

var DonateContract = function () {
   
    LocalContractStorage.defineMapProperty(this, "donationPool"); 
    
};


DonateContract.prototype = {
    init: function () {
    },
    
    saveDonation: function(hash, wallet) {
        if(Blockchain.verifyAddress(wallet)) {
            this.donationPool.put(hash, wallet);
            return true;
        }
        return false;
    },
    
    donate: function(hash) {
        var wallet = this.donationPool.get(hash);
        if(wallet === undefined) {
            return false;
        }
        
        var value = Blockchain.transaction.value;
        
        //var result = Blockchain.transfer(wallet, value);
        Event.Trigger("donate", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: wallet,
                    value: value
                }
        });
    },
    
    debug: function(key) {
        return this.donationPool.get(key);
    }
    
};

module.exports = DonateContract;