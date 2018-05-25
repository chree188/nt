'use strict';


var Contract = function () {
    LocalContractStorage.defineMapProperty(this, 'contracts');
    LocalContractStorage.defineProperty(this, "currentContractId");
};

Contract.prototype = {
    init: function () {
        this.currentContractId = 0;
    },
    getAll: function () {
        var result = [];
        var item;
        for (var i = 1; i <= this.currentContractId; i++) {
            item = this.contracts.get(i);
            result.push(item);
        }
        return result;
    },
    getMyOriginate: function () {
        var result = [];
        var item;
        for (var i = 1; i <= this.currentContractId; i++) {
            item = this.contracts.get(i);
            if(item.partA==Blockchain.transaction.from){
                result.push(item);
            }else continue;
            
        }
        return result;
    },
     getMyAccept: function () {
        var result = [];
        var item;
        for (var i = 1; i <= this.currentContractId; i++) {
            item = this.contracts.get(i);
            if(item.partB==Blockchain.transaction.from){
                result.push(item);    
            }else continue;
            
        }
        return result;
    },
    newContract: function (partAName,partBName,partB,title,content) {

        this.currentContractId += 1;
        var id = this.currentContractId;
        var partA = Blockchain.transaction.from;


        var startTime = Blockchain.block.timestamp;
        this.contracts.put(id, {
            id: id,
            partA: partA,
            partB: partB,
            partAName: partAName,
            partBName: partBName,
            AApprove: true,
            BApprove: false,
            title: title,
            content: content,
            startTime:startTime
        });
        return id;
    },
    getByIndex: function (index) {
        return this.contracts.get(index);
    },
    getCurrentContractId: function(){
        return this.currentContractId;
    },
    approveContract: function(index){
        var item = this.contracts.get(index);
        this.contracts.put(index, {
            id: index,
            partA: item.partA,
            partB: item.partB,
            partAName: item.partAName,
            partBName: item.partBName,
            AApprove: true,
            BApprove: true,
            title: item.title,
            content: item.content,
            startTime: Blockchain.block.timestamp
        });
    }
};


module.exports = Contract;