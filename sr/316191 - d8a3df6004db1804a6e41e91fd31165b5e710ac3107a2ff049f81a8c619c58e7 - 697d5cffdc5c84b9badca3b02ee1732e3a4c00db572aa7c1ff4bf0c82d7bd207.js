var BankVaultContract = function () {
    LocalContractStorage.defineMapProperty(this,'userMap');
};
BankVaultContract.prototype = {
	init: function () {
        
   },
    save: function (key,value) {
        this.userMap.set(key,value);
    },
    read:function(){
    	return LocalContractStorage.get('userMap');
    }
}
module.exports = BankVaultContract;