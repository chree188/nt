"use strict";


/**
 * 币需真相 短地址服务
 * @constructor
 */
var ShortAddress = function () {
    //map address to feedback
    LocalContractStorage.defineMapProperty(this, "addressMapName");
    LocalContractStorage.defineMapProperty(this, "nameMapAddress");

};

ShortAddress.prototype = {
    init: function () {
    },

    getAddressByName: function (name) {
        return this.nameMapAddress.get(name)
    },
    getNameByAddress: function (address) {
        return this.addressMapName.get(address)
    },
    /**
     * 保存address 和 name的映射关系
     * @param address
     * @param name
     */
    saveAddress: function (address, name) {
        if(!this.verifyAddress(address)){
            throw new Error("bad address");
        }
        var oldAddress = this.nameMapAddress.get(name);
        if(oldAddress) {
            throw new Error("bad name");
        }
        //unbind name
        var oldName = this.addressMapName.get(address);
        if(oldName){
            this.nameMapAddress.del(oldName);
        }
        this.addressMapName.put(address, name);
        this.nameMapAddress.put(name, address);
        return name;
    },

    verifyAddress: function (address) {
        var result = Blockchain.verifyAddress(address);
        return result;
    },
};

module.exports = ShortAddress;


