"use strict";



var tetris = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        //basic info
        this.creator = obj.creator;
        this.score = obj.score;
        this.totalplayer= obj.totalplayer;
        
   } else {
       this.creator = "";
       this.score = 0;
       this.totalplayer = 0;
	}
};

tetris.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var tetrisDB = function () {
    LocalContractStorage.defineProperties(this,{
                                          isOpen: null,
                                          admAdd: null,
                                          highestscore:null,
                                          total:null,
                                          mode:null
                                          });
    

    
    LocalContractStorage.defineMapProperty(this, "tetris", {
        parse: function (text) {
            return new tetris(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

tetrisDB.prototype = {
    init: function () {
        this.admAdd="n1NJaHRXpe49fc98GtuxxYVFyq1xsYCHx9d";
        this.isOpen = true;
        this.balance = 0;
        this.mode=0;
        this.total=0;
        var savetetris = new tetris();
        this.tetris.put(0, savetetris);
        
    },
    //view 拿信息
    
    getIsOpen: function() {
        return this.isOpen;
    },
    
    
    getAdminAddress: function() {
        return this.admAdd;
    },
    
    //检测彩蛋是否开启
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
    
    
savescore: function(savedscore){
    var from = Blockchain.transaction.from;
    var trysave = this.tetris.get(0);
    if(parseInt(trysave.score) < parseInt(savedscore)){
        
        trysave.score = savedscore;
        trysave.creator = from;
        trysave.totalplayer = this.total;
        this.tetris.set(0,trysave);
    }else{
        
    }
    
},
    
getMode: function(){
    return this.mode;
},

// start newgame
    newgame: function () {
        //鉴定开始
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        //设置彩蛋，玩的人数超过100后开启
        this.total++;
        if(this.total>100){
            this.mode = 1;
        }
      
  
    },
 
    gettetris: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty key")
        }
        return this.tetris.get(id);
    }
};
module.exports = tetrisDB;
