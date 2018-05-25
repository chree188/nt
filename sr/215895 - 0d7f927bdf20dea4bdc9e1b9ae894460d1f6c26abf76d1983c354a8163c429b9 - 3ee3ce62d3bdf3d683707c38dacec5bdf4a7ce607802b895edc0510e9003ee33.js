//投票

"use strict";

var SampleContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   //LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
   LocalContractStorage.defineProperty(this, "tlp");
   LocalContractStorage.defineProperty(this, "xjp");
   LocalContractStorage.defineProperty(this, "pj");
};

SampleContract.prototype = {
    init: function () {
        this.size = 3;
        this.tlp = 0;
        this.xjp = 0;
        this.pj = 0;
        //配置候选人
        this.arrayMap.set(0, "特朗普");
        this.arrayMap.set(1, "习近平");
        this.arrayMap.set(2, "普京");

    },


    vote: function (key) {
        var index = parseInt(key);
        switch (index)
        {
        case 0:
          this.tlp += 1;
          break;
        case 1:
        this.xjp += 1;
          break;
        case 2:
        this.pj += 1;
          break;
        
        }
    },
 
    get:function(){
	var out = "";
	out = " 特朗普：" + this.tlp + " 习近平： " + this.xjp + " 普京： "+this.pj;
        return out;
    }
    
};

module.exports = SampleContract;