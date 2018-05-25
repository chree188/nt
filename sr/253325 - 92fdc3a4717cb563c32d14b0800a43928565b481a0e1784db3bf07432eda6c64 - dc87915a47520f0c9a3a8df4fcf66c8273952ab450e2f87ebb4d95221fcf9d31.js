"use strict";



var bugua = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        //basic info
        this.id = obj.id;
        this.guaxiang = obj.guaxiang;
//		this.name = obj.name;
        this.tester = obj.tester;

        
   } else {
       this.guaxiang = "";
       this.tester = "";
       
	}
};

bugua.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var buguaDB = function () {
    LocalContractStorage.defineProperties(this,{
                                          isOpen: null,
                                          admAdd: null,
                                          totaltest:null,
                                          balance:null,
                                          mode:null
                                          });
    

    
    LocalContractStorage.defineMapProperty(this, "bagua", {
        parse: function (text) {
            return new bugua(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

buguaDB.prototype = {
    init: function () {
        this.admAdd="n1NJaHRXpe49fc98GtuxxYVFyq1xsYCHx9d";
        this.isOpen = true;
        this.totaltest = 0;
        this.balance = 0;
        this.mode="houtian";
        
    },
    //view 拿信息
    
    getIsOpen: function() {
        return this.isOpen;
    },
    
    gettotaltest: function() {
        return this.totaltest;
    },
    getbalance: function() {
        return this.balance;
    },
    
    getAdminAddress: function() {
        return this.admAdd;
    },
    
    //先天八卦，后天八卦
    getMode: function() {
        return this.mode;
    },

    
    setMode:function(calcmode){
        this.mode=calcmode;
    },
    
    //设置开始
    setIsOpen: function(isopen) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.isOpen = isopen;
        } else {
            throw new Error("Admin only");
        }
    },
    //提钱
    transfer: function(amount) {
        if (Blockchain.transaction.from === this.adminAddress) {
            var from = Blockchain.transaction.from;
            var amount = new BigNumber(value);
            var result = Blockchain.transfer(from, amount);
            if (!result) {
                throw new Error("transfer failed."+result);
            }
            this.balance = this.balance - amount;
        } else {
            throw new Error("Admin only");
        }
    },
    


// id guaxiang
    newtest: function (id, guaxiang) {
        //鉴定开始
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        //trim
        id = id.trim();
        guaxiang = guaxiang.trim();
        
        if (id === ""){
            throw new Error("empty id");
        }

        var from = Blockchain.transaction.from;
        var newbagua = this.bagua.get(id);
        if (newbagua){
            throw new Error("system error");
        }
        this.totaltest++;
        
        newbagua = new bugua();
        
        
        newbagua.id = id;
        newbagua.tester = from;
        newbagua.guaxiang = guaxiang;
        this.bagua.put(id, guaxiang);
        
      
  
    },
 
    gettest: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty key")
        }
        return this.bagua.get(id);
    }
};
module.exports = buguaDB;
