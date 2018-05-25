var BankVaultContract = function () {
    LocalContractStorage.defineMapProperty(this, "bankVault", {
     
    });
};
BankVaultContract.prototype = {
	init: function () { },
    save: function () {
        var from = Blockchain.transaction.from;
        this.bankVault.put({aa:11});
    }
}
module.exports = BankVaultContract;