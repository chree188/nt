"use strict"

var ContractNode = function(contract) {
	if (contract) {
		var contractObj = JSON.parse(contract)
        this.contractName = contractObj.contractName
		this.contractDetail = contractObj.contractDetail
		this.author = contractObj.author
        this.preSigner = contractObj.preSigner
        this.preSignerPwd = contractObj.preSignerPwd
        this.signer = contractObj.signer
        this.signed = contractObj.signed
	} else {
        this.contractName = ""
	    this.contractDetail = ""
        this.author = ""
        this.preSigner = ""
        this.preSignerPwd = ""
        this.signer = ""
        this.signed = ""
	}
}

ContractNode.prototype = {
	toString: function () {
		return JSON.stringify(this)
	}
}

var SmartContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ContractNode(text)
        },
        stringify: function (obj) {
            return obj.toString()
        }
    })
}

SmartContract.prototype = {
    init: function () {
        // todo
    },

    createContract: function (contractName,contractDetail,preSigner,preSignerPwd) {

        contractName = contractName.trim()
        contractDetail = contractDetail.trim()

        if (contractName === "" || contractDetail === ""){
            throw new Error("Contract info must not be blank")
        }
        if (contractName.length > 64 || contractDetail.length > 64){
            throw new Error("Contract length exceed limit length")
        }

        var from = Blockchain.transaction.from
        var contractNode = this.repo.get(contractName)
        if (contractNode){
            throw new Error("contractName has been occupied")
        }

        contractNode = new ContractNode()
        contractNode.author = from
        contractNode.contractName = contractName
        contractNode.contractDetail = contractDetail
        contractNode.preSigner = preSigner
        contractNode.preSignerPwd = preSignerPwd

        this.repo.put(contractName, contractNode)
        return "Contract create success!"
    },

    getContract: function (contractName) {

        contractName = contractName.trim()
        if ( contractName === "" ) {
            throw new Error("empty contractName")
        }
        var contractNode = this.repo.get(contractName)
        if(contractNode){
            contractNode.preSigner = ""
            contractNode.preSignerPwd = ""
            return contractNode
        }else{
           throw new Error("Can not find contract") 
        }
        
    },

    signContract: function (contractName,preSigner,preSignerPwd){

        var from = Blockchain.transaction.from
        var contractNode = this.repo.get(contractName)
        if (!contractNode){
            throw new Error("contractName has not been found")
        }
        if(contractNode.signed != 1 && preSigner == contractNode.preSigner && preSignerPwd == contractNode.preSignerPwd){

            contractNode.signer = from
            contractNode.signed = 1
            this.repo.put(contractName,contractNode)
            return "Contract has been signed successfull."

        }else{
            throw new Error("Not authorized or contract has been signed")
        }
    }
}
module.exports = SmartContract