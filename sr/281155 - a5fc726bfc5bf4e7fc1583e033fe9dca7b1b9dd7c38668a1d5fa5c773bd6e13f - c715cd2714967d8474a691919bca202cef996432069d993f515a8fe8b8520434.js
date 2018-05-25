"use strict";


var YijingContract = function() { 
    // owner of the contract
    LocalContractStorage.defineProperty(this, "owner");
        
    // çˆ»å’Œå…«å¦çš„å¯¹åº”
    // 6çˆ»ä¸ºkeyï¼ŒæŒ‰ç…§ åˆçˆ»-äºŒçˆ»-ä¸‰çˆ»-å››çˆ»-äº”çˆ»-ä¸Šçˆ» åšå­—ç¬¦ä¸²è¿žæŽ¥
    // valueä¸ºå…«å¦çš„ä»£ç ï¼Œå¯é€šè¿‡ä»£ç æ‰¾åˆ°å…«å¦è§£æž
    LocalContractStorage.defineMapProperty(this, "baguaYaoMap");


    LocalContractStorage.defineMapProperty(this, "contractBaguaResult");
    
}

YijingContract.prototype = {
    init: function() {
        this.owner = Blockchain.transaction.from;
        this._setupBaguaYaoMap();
    },
  
    _setupBaguaYaoMap : function() {
        // Yao = 1: é˜³
        // Yao = 2: é˜´
 
        // å¡«å……baguaYaoMap
        // 6çˆ»ä¸ºkeyï¼ŒæŒ‰ç…§ åˆçˆ»-äºŒçˆ»-ä¸‰çˆ»-å››çˆ»-äº”çˆ»-ä¸Šçˆ» åšå­—ç¬¦ä¸²è¿žæŽ¥
        // valueä¸ºå…«å¦çš„ä»£ç ï¼Œå¯é€šè¿‡ä»£ç æ‰¾åˆ°å…«å¦è§£æž
         
        // 1:å¤	
        this.baguaYaoMap.set('2-2-2-2-2-2','1');
        // 2:å‰¥
        this.baguaYaoMap.set('2-2-2-2-2-1','2');
        // 3:æ¯”
        this.baguaYaoMap.set('2-2-2-2-1-2','3');
        // 4:è§‚
        this.baguaYaoMap.set('2-2-1-1-1-1','4');
        // 5:è±«
        this.baguaYaoMap.set('2-2-2-1-2-2','5');
        // 6:æ™‹
        this.baguaYaoMap.set('2-2-2-1-2-1','6');
        // 7:èƒ
        this.baguaYaoMap.set('2-2-2-1-1-2','7');
        // 8:å¦
        this.baguaYaoMap.set('2-2-2-1-1-1','8');
        // 9:è°¦
        this.baguaYaoMap.set('2-2-1-2-2-2','9');
        // 10:è‰®
        this.baguaYaoMap.set('2-2-1-2-2-1','10');
        // 11:è¹‡
        this.baguaYaoMap.set('2-2-1-2-1-2','11');
        // 12:æ¸
        this.baguaYaoMap.set('2-2-1-2-1-1','12');
        // 13:å°è¿‡
        this.baguaYaoMap.set('2-2-1-1-2-2','13');
        // 14:æ—…
        this.baguaYaoMap.set('2-2-1-1-2-1','14');
        // 15:å’¸
        this.baguaYaoMap.set('2-2-1-1-1-2','15');
        // 16:é
        this.baguaYaoMap.set('2-2-1-1-1-1','16');
        // 17:å¸ˆ
        this.baguaYaoMap.set('2-1-2-2-2-2','17');
        // 18:è’™
        this.baguaYaoMap.set('2-1-2-2-2-1','18');
        // 19:åŽ
        this.baguaYaoMap.set('2-1-2-2-1-2','19');
        // 20:æ¶£
        this.baguaYaoMap.set('2-1-2-2-1-1','20');
        // 21:è§£
        this.baguaYaoMap.set('2-1-2-1-2-2','21');
        // 22:æœªæµŽ
        this.baguaYaoMap.set('2-1-2-1-2-1','22');
        // 23:å›°
        this.baguaYaoMap.set('2-1-2-1-1-2','23');
        // 24:è®¼
        this.baguaYaoMap.set('2-1-2-1-1-1','24');
        // 25:å‡
        this.baguaYaoMap.set('2-1-1-2-2-2','25');
        // 26:è›Š
        this.baguaYaoMap.set('2-1-1-2-2-1','26');
        // 27:äº•
        this.baguaYaoMap.set('2-1-1-2-1-2','27');
        // 28:å·½
        this.baguaYaoMap.set('2-1-1-2-1-1','28');
        // 29:æ’
        this.baguaYaoMap.set('2-1-1-1-2-2','29');
        // 30:é¼Ž
        this.baguaYaoMap.set('2-1-1-1-2-1','30');
        // 31:å¤§è¿‡
        this.baguaYaoMap.set('2-1-1-1-1-2','31');
        // 32:å§¤
        this.baguaYaoMap.set('2-1-1-1-1-1','32');
        // 33:å¤
        this.baguaYaoMap.set('1-2-2-2-2-2','33');
        // 34:é¢
        this.baguaYaoMap.set('1-2-2-2-2-1','34');
        // 35:å±¯
        this.baguaYaoMap.set('1-2-2-2-1-2','35');
        // 36:ç›Š
        this.baguaYaoMap.set('1-2-2-2-1-1','36');
        // 37:éœ‡
        this.baguaYaoMap.set('1-2-2-1-2-2','37');
        // 38:å™¬å—‘
        this.baguaYaoMap.set('1-2-2-1-2-1','38');
        // 39:éš
        this.baguaYaoMap.set('1-2-2-1-1-2','39');
        // 40:æ— å¦„
        this.baguaYaoMap.set('1-2-2-1-1-1','40');
        // 41:æ˜Žå¤·
        this.baguaYaoMap.set('1-2-1-2-2-2','41');
        // 42:è´²	this.baguaYaoMap.set('1-2-1-2-2-1','42');
        // 43:æ—¢æµŽ
        this.baguaYaoMap.set('1-2-1-2-1-2','43');
        // 44:å®¶äºº
        this.baguaYaoMap.set('1-2-1-2-1-1','44');
        // 45:ä¸°
        this.baguaYaoMap.set('1-2-1-1-2-2','45');
        // 46:ç¦»
        this.baguaYaoMap.set('1-2-1-1-2-1','46');
        // 47:é©
        this.baguaYaoMap.set('1-2-1-1-1-2','47');
        // 48:åŒäºº
        this.baguaYaoMap.set('1-2-1-1-1-1','48');
        // 49:ä¸´
        this.baguaYaoMap.set('1-1-2-2-2-2','49');
        // 50:æŸ
        this.baguaYaoMap.set('1-1-2-2-2-1','50');
        // 51:èŠ‚
        this.baguaYaoMap.set('1-1-2-2-1-2','51');
        // 52:ä¸­å­š
        this.baguaYaoMap.set('1-1-2-2-1-1','52');
        // 53:å½’å¦¹
        this.baguaYaoMap.set('1-1-2-1-2-2','53');
        // 54:ç½
        this.baguaYaoMap.set('1-1-2-1-2-1','54');
        // 55:å…‘
        this.baguaYaoMap.set('1-1-2-1-1-2','55');
        // 56:å±¥
        this.baguaYaoMap.set('1-1-2-1-1-1','56');
        // 57:æ³°
        this.baguaYaoMap.set('1-1-1-2-2-2','57');
        // 58:å¤§ç•œ
        this.baguaYaoMap.set('1-1-1-2-2-1','58');
        // 59:éœ€
        this.baguaYaoMap.set('1-1-1-2-1-2','59');
        // 60:å°ç•œ
        this.baguaYaoMap.set('1-1-1-2-1-1','60');
        // 61:å¤§å£®
        this.baguaYaoMap.set('1-1-2-2-2-2','61');
        // 62:å¤§æœ‰
        this.baguaYaoMap.set('1-1-1-1-2-1','62');
        // 63:å¤¬
        this.baguaYaoMap.set('1-1-1-1-1-2','63');
        // 64:ä¹¾
        this.baguaYaoMap.set('1-1-1-1-1-1','64');

        
    },
    
    // æ ¹æ®ç”¨æˆ·åœ°å€ã€æ™ºèƒ½åˆçº¦åœ°å€å’Œæ™ºèƒ½åˆçº¦æäº¤çš„transaction hashè®¡ç®—å¾—åˆ°å…­çˆ»
    // æ ¹æ®å…­çˆ»å¾—åˆ°å…«å¦
    getBagua : function(contractAddress,contractTx) { 
        // Get Yao for 6 times
        var userAddress = Blockchain.transaction.from;
        var key = userAddress + "-" + contractAddress + "-" + contractTx;
        if (this.contractBaguaResult.get(key) != null) {
            // We already saved the result for this contract, let's not bother
            // calculating it again
            return this.contractBaguaResult.get(key);
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

        var baoguaNumber = this._getBaoguaNumber(yao1, yao2, yao3, yao4, yao5, yao6);
        this.contractBaguaResult.set(key, baoguaNumber);
        return baoguaNumber;

    },

    // æ ¹æ®å…­çˆ»è®¡ç®—å…«å¦
    _getBaoguaNumber : function(yao1, yao2, yao3, yao4, yao5, yao6) {
        var key = yao1 + '-' + yao2 + '-' + yao3 + '-' + yao4 + '-' + yao5 + '-' + yao6;
        return this.baguaYaoMap.get(key);
         
    },

    // å¦‚æžœé‡åˆ°å¤§é˜´æˆ–è€…å¤§é˜´ï¼Œåˆ™å˜å¦
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

    // æ ¹æ®ç”¨æˆ·åœ°å€ã€æ™ºèƒ½åˆçº¦åœ°å€å’Œæ™ºèƒ½åˆçº¦æäº¤çš„transaction hashè®¡ç®—çˆ»
    // 0: å¤§é˜´
    // 1: é˜³
    // 2: é˜´
    // 3: å¤§é˜³
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

    }


}

module.exports = YijingContract;

