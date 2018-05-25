var BankVaultContract = function () {
    LocalContractStorage.defineMapProperty(this, "bankVault", {
        parse: function (text) {
            return new DepositeContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
BankVaultContract.prototype = {
	init: function () {
        //TODO:
   },
    save: function () {
        var from = Blockchain.transaction.from;
        this.bankVault.put({aa:11});
    }
}
module.exports = BankVaultContract;