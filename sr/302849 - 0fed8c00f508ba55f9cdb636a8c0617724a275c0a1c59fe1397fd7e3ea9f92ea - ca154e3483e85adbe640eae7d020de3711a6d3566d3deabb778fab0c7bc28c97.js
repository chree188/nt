"use strict";


var YijingContract = function() { 
    // owner of the contract
    LocalContractStorage.defineProperty(this, "owner");
        
    // 爻和八卦的对应
    // 6爻为key，按照 初爻-二爻-三爻-四爻-五爻-上爻 做字符串连接
    // value为八卦的代码，可通过代码找到八卦解析
    LocalContractStorage.defineMapProperty(this, "baguaYaoMap");

    // 保存每个合约地址对应的八卦
    LocalContractStorage.defineMapProperty(this, "contractBaguaResult");

    // 如果合约的八卦为大吉，则对提交查询的人进行奖励
    // 定义每次奖励的NAS数量
    LocalContractStorage.defineProperty(this, "incentive",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    // 可以分发奖励的八卦
    LocalContractStorage.defineProperty(this, "incentiveBaguaNumber");
    LocalContractStorage.defineProperty(this, "incentivePayHistory");

    
}

YijingContract.prototype = {
    init: function() {
        this.owner = Blockchain.transaction.from;
        this._setupBaguaYaoMap();
        this.incentive = new BigNumber(0);
        this.incentiveBaguaNumber = "";
        this.incentivePayHistory = "";
    },
  
    _setupBaguaYaoMap : function() {
        // 爻 = 1: 阳
        // 爻 = 2: 阴
 
        // 填充baguaYaoMap
        // 6爻为key，按照 初爻-二爻-三爻-四爻-五爻-上爻 做字符串连接
        // value为八卦的代码，可通过代码找到八卦解析
         
        // 1:坤	
        this.baguaYaoMap.set('2-2-2-2-2-2','1');
        // 2:剥
        this.baguaYaoMap.set('2-2-2-2-2-1','2');
        // 3:比
        this.baguaYaoMap.set('2-2-2-2-1-2','3');
        // 4:观
        this.baguaYaoMap.set('2-2-1-1-1-1','4');
        // 5:豫
        this.baguaYaoMap.set('2-2-2-1-2-2','5');
        // 6:晋
        this.baguaYaoMap.set('2-2-2-1-2-1','6');
        // 7:萃
        this.baguaYaoMap.set('2-2-2-1-1-2','7');
        // 8:否
        this.baguaYaoMap.set('2-2-2-1-1-1','8');
        // 9:谦
        this.baguaYaoMap.set('2-2-1-2-2-2','9');
        // 10:艮
        this.baguaYaoMap.set('2-2-1-2-2-1','10');
        // 11:蹇
        this.baguaYaoMap.set('2-2-1-2-1-2','11');
        // 12:渐
        this.baguaYaoMap.set('2-2-1-2-1-1','12');
        // 13:小过
        this.baguaYaoMap.set('2-2-1-1-2-2','13');
        // 14:旅
        this.baguaYaoMap.set('2-2-1-1-2-1','14');
        // 15:咸
        this.baguaYaoMap.set('2-2-1-1-1-2','15');
        // 16:遁
        this.baguaYaoMap.set('2-2-1-1-1-1','16');
        // 17:师
        this.baguaYaoMap.set('2-1-2-2-2-2','17');
        // 18:蒙
        this.baguaYaoMap.set('2-1-2-2-2-1','18');
        // 19:坎
        this.baguaYaoMap.set('2-1-2-2-1-2','19');
        // 20:涣
        this.baguaYaoMap.set('2-1-2-2-1-1','20');
        // 21:解
        this.baguaYaoMap.set('2-1-2-1-2-2','21');
        // 22:未济
        this.baguaYaoMap.set('2-1-2-1-2-1','22');
        // 23:困
        this.baguaYaoMap.set('2-1-2-1-1-2','23');
        // 24:讼
        this.baguaYaoMap.set('2-1-2-1-1-1','24');
        // 25:升
        this.baguaYaoMap.set('2-1-1-2-2-2','25');
        // 26:蛊
        this.baguaYaoMap.set('2-1-1-2-2-1','26');
        // 27:井
        this.baguaYaoMap.set('2-1-1-2-1-2','27');
        // 28:巽
        this.baguaYaoMap.set('2-1-1-2-1-1','28');
        // 29:恒
        this.baguaYaoMap.set('2-1-1-1-2-2','29');
        // 30:鼎
        this.baguaYaoMap.set('2-1-1-1-2-1','30');
        // 31:大过
        this.baguaYaoMap.set('2-1-1-1-1-2','31');
        // 32:姤
        this.baguaYaoMap.set('2-1-1-1-1-1','32');
        // 33:复
        this.baguaYaoMap.set('1-2-2-2-2-2','33');
        // 34:颐
        this.baguaYaoMap.set('1-2-2-2-2-1','34');
        // 35:屯
        this.baguaYaoMap.set('1-2-2-2-1-2','35');
        // 36:益
        this.baguaYaoMap.set('1-2-2-2-1-1','36');
        // 37:震
        this.baguaYaoMap.set('1-2-2-1-2-2','37');
        // 38:噬嗑
        this.baguaYaoMap.set('1-2-2-1-2-1','38');
        // 39:随
        this.baguaYaoMap.set('1-2-2-1-1-2','39');
        // 40:无妄
        this.baguaYaoMap.set('1-2-2-1-1-1','40');
        // 41:明夷
        this.baguaYaoMap.set('1-2-1-2-2-2','41');
        // 42:贲	
        this.baguaYaoMap.set('1-2-1-2-2-1','42');
        // 43:既济
        this.baguaYaoMap.set('1-2-1-2-1-2','43');
        // 44:家人
        this.baguaYaoMap.set('1-2-1-2-1-1','44');
        // 45:丰
        this.baguaYaoMap.set('1-2-1-1-2-2','45');
        // 46:离
        this.baguaYaoMap.set('1-2-1-1-2-1','46');
        // 47:革
        this.baguaYaoMap.set('1-2-1-1-1-2','47');
        // 48:同人
        this.baguaYaoMap.set('1-2-1-1-1-1','48');
        // 49:临
        this.baguaYaoMap.set('1-1-2-2-2-2','49');
        // 50:损
        this.baguaYaoMap.set('1-1-2-2-2-1','50');
        // 51:节
        this.baguaYaoMap.set('1-1-2-2-1-2','51');
        // 52:中孚
        this.baguaYaoMap.set('1-1-2-2-1-1','52');
        // 53:归妹
        this.baguaYaoMap.set('1-1-2-1-2-2','53');
        // 54:睽
        this.baguaYaoMap.set('1-1-2-1-2-1','54');
        // 55:兑
        this.baguaYaoMap.set('1-1-2-1-1-2','55');
        // 56:履
        this.baguaYaoMap.set('1-1-2-1-1-1','56');
        // 57:泰
        this.baguaYaoMap.set('1-1-1-2-2-2','57');
        // 58:大畜
        this.baguaYaoMap.set('1-1-1-2-2-1','58');
        // 59:需
        this.baguaYaoMap.set('1-1-1-2-1-2','59');
        // 60:小畜
        this.baguaYaoMap.set('1-1-1-2-1-1','60');
        // 61:大壮
        this.baguaYaoMap.set('1-1-2-2-2-2','61');
        // 62:大有
        this.baguaYaoMap.set('1-1-1-1-2-1','62');
        // 63:夬
        this.baguaYaoMap.set('1-1-1-1-1-2','63');
        // 64:乾
        this.baguaYaoMap.set('1-1-1-1-1-1','64');

        
    },

    // 初始化奖励的参数，只有合约的所有人才能初始化该参数
    setupIncentive : function(newIncentive, newIncentiveBaguaNumber) {
        if (this.owner == Blockchain.transaction.from) {
            this.incentive = new BigNumber(newIncentive);
            this.incentiveBaguaNumber = newIncentiveBaguaNumber;
        }
    },

    getIncentiveConfig : function() {
        return "{incentive:" + this.incentive + ", incentiveBaguaNumber: " + this.incentiveBaguaNumber + "}";
        // return "{incentive: 1, incentiveBaguaNumber:  2}";
    },
    
    // 根据用户地址、智能合约地址和智能合约提交的transaction hash计算得到六爻
    // 根据六爻得到八卦
    getBagua : function(contractAddress,contractTx) { 
        // Get 爻 for 6 times
        var userAddress = Blockchain.transaction.from;
        var key = contractAddress + "-" + contractTx;
        if (this.contractBaguaResult.get(key) != null) {
            // We already saved the result for this contract, let's not bother
            // calculating it again
            return Number(this.contractBaguaResult.get(key));
        } 
        var yao1 = this._getYao(userAddress,contractAddress,contractTx, 1);
        var yao2 = this._getYao(userAddress,contractAddress,contractTx, 2);
        var yao3 = this._getYao(userAddress,contractAddress,contractTx, 3);
        var yao4 = this._getYao(userAddress,contractAddress,contractTx, 4); 
        var yao5 = this._getYao(userAddress,contractAddress,contractTx, 5);
        var yao6 = this._getYao(userAddress,contractAddress,contractTx, 6);
         
        // If yao is X, switch
        yao1 = this._switchXYao(yao1);
        yao2 = this._switchXYao(yao2);
        yao3 = this._switchXYao(yao3);
        yao4 = this._switchXYao(yao4);
        yao5 = this._switchXYao(yao5);
        yao6 = this._switchXYao(yao6);

        var baguaNumber = this._getBaguaNumber(yao1, yao2, yao3, yao4, yao5, yao6);
        this.contractBaguaResult.set(key, baguaNumber);
        if (this._validateForIncentive(baguaNumber)) {
            this._payIncentive(Blockchain.transaction.from, contractAddress, contractTx,baguaNumber);
        }
        return Number(baguaNumber);
    },

    _validateForIncentive : function(baguaNumber) {
        if (this.incentiveBaguaNumber.length == 0) {
            return false;    
        }    
        var baguaString = "";
        if (baguaNumber >= 1 && baguaNumber <= 9) {
            baguaString = "0" + baguaNumber;
        }
        else {
            baguaString = "" + baguaNumber;
        }
        if(baguaString.length > 0 &&
            this.incentiveBaguaNumber.indexOf(baguaString) > -1) {
            return true;    
        }
        return false;
    },

    // 分发奖励，忽略任何错误（比如合约余额不足等）
    _payIncentive : function(toAddress,contractAddress, contractTx,baoguaNumber) {
        
        var currentTime = new Date();
        try {
            var result = Blockchain.transfer(toAddress, this.incentive);
            this.incentivePayHistory += "{toAddress: " + toAddress + ", " +
                                   " contractAddress: " + contractAddress + ", " +
                                   " contractTx: " + contractTx + ", " +
                                   " incentive: " + this.incentive + ", " +
                                   " result: " + result + ", " +
                                   " currentTime: " + currentTime + ", " +
                                   " baoguaNumber: " + baoguaNumber + "};"
        } 
        catch(err) {
            // ignore any error
            this.incentivePayHistory += "{toAddress: " + toAddress + ", " +
                                   " contractAddress: " + contractAddress + ", " +
                                   " contractTx: " + contractTx + ", " +
                                   " incentive: " + this.incentive + ", " +
                                   " result: Error! " + err.message + ", " +
                                   " currentTime: " + currentTime + ", " +
                                   " baoguaNumber: " + baoguaNumber + "};"       
        }
    },
    getIncentivePayHistory : function() {
        
        if (this.owner == Blockchain.transaction.from) {
            return this.incentivePayHistory;
        } 
        else {
            return "only owner can query the incentive payment history";    
        }
    }, 
    withdraw : function(toAddress, value) {
        if (this.owner == Blockchain.transaction.from) {
            Blockchain.transfer(toAddress, this.incentive);
        } 
    },

    // 根据六爻计算八卦
    _getBaguaNumber : function(yao1, yao2, yao3, yao4, yao5, yao6) {
        var key = yao1 + '-' + yao2 + '-' + yao3 + '-' + yao4 + '-' + yao5 + '-' + yao6;
        return this.baguaYaoMap.get(key);
         
    },

    // 如果遇到大阴或者大阴，则变卦
    _switchXYao : function(yao) {
        if (yao == 0) {
            return 1;    
        }    
        else if (yao == 3) {
            return 2;    
        }
        else {
            return yao;    
        }
    },

    // 根据用户地址、智能合约地址和智能合约提交的transaction hash计算爻
    // 0: 大阴
    // 1: 阳
    // 2: 阴
    // 3: 大阳
    _getYao : function(userAddress,contractAddress,contractTx,number) {
        var d = new Date();
		var newRandomSeed =  userAddress + "-" + number;
        Math.random.seed(newRandomSeed);
        // Return 0 or 1, stands for the front size / back size of
        // 0 : front / yang
        // 1 : back / yin
        // the coin when make a prediction based on bagua
        var coin1 = parseInt(Math.random() * 2);
        var coin2 = parseInt(Math.random() * 2);
        var coin3 = parseInt(Math.random() * 2);
        return (coin1 + coin2 + coin3);

    },

    // 取得已经上链的八卦信息
    getBaguaOnChain : function(contractAddress,contractTx) {  
        var key = contractAddress + "-" + contractTx;
        if (this.contractBaguaResult.get(key) != null) {
            // We already saved the result for this contract, let's not bother
            // calculating it again
            return Number(this.contractBaguaResult.get(key));
        } 
        else {
            return -1;    
        }
    },

    accept: function(){
        // do nothing 
    }


}

module.exports = YijingContract;

