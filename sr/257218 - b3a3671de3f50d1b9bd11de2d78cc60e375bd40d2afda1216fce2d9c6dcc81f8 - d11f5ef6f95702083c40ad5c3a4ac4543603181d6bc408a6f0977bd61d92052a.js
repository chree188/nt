'use strict';

var BankVaultContract = function () {
    LocalContractStorage.defineMapProperty(this, "userMap");
    LocalContractStorage.defineMapProperty(this.userMap, "innerMap");
    LocalContractStorage.defineMapProperty(this, "userBalanceMap", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });
    
    LocalContractStorage.defineMapProperties(this,{
        key1Map: null,
        key2Map: null
    });
};

BankVaultContract.prototype = {
    init: function () {
    },
    testStorage: function () {
        this.userMap.innerMap.set("robin", "1");
        this.userBalanceMap.set("robin",new BigNumber(1));
    },
    testRead: function () {
        //Read and store data
        var balance = this.userBalanceMap.get("robin");
        this.key1Map.set("robin", balance.toString());
        this.key2Map.set("robin", balance.toString());
    },
   setMap: function(e1, e2) {
       this.userMap.set("a", e1);
       this.userMap.innerMap.set("a", e2);
},
   getMap: function() {
       return {a: this.userMap.get("a"), b: this.userMap.innerMap.get("a")}
}
}

module.exports = BankVaultContract;