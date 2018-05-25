"use strict";

var ScoreContent = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.name = obj.name;
		this.chinese = obj.chinese;
		this.math = obj.math;
		this.english = obj.english;
	} else {
		this.key = "";
		this.name = "";
		this.chinese = 0;
		this.math = 0;
		this.english = 0;
	}
};

ScoreContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var StudentContract = function () {
	LocalContractStorage.defineProperty(this, "promulgator");
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this, "arrayMap");
	LocalContractStorage.defineMapProperty(this, "dataMap", {
		parse: function (text) {
            return new ScoreContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
   
};

StudentContract.prototype = {
    init: function () {
		this.promulgator=Blockchain.transaction.from;
        this.size = 0;
    },
    
    save: function (key, name, chinese, math, english) {
		
		key = key.trim();
		name = name.trim();
		if(key ==="" || name ==="" ){
			throw new Error("wrong infor");
		}
		if(this.promulgator != Blockchain.transaction.from){
			throw new Error("have no right to write");
		}
		
		
        var index = this.size;
        this.arrayMap.set(index, key);
		
		var data = this.dataMap.get(key);

        if (data){
			data.key = key;
			data.name = name;
			data.chinese = chinese;
			data.math = math;
			data.english = english;
        }else{
			data = new ScoreContent();
			data.key = key;
			data.name = name;
			data.chinese = chinese;
			data.math = math;
			data.english = english;
		}
        this.dataMap.put(key, data);

        this.size +=1;
    },

    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },
 
	getfirst: function(key){

		var tmp_topnum = 0;
		var tmp_topscore = 0;

		for(var i=0; i< this.size; i++){
            var tmpkey = this.arrayMap.get(i);
			if(tmpkey){
				var object = this.dataMap.get(tmpkey);

				if(object){
					var score = parseInt(object.chinese) + parseInt(object.math) + parseInt(object.english);
					if(score > tmp_topscore){
						tmp_topnum = i;
						tmp_topscore = score;
					}
				}
			}
        }

		var rekey =  this.arrayMap.get(tmp_topnum);
		return this.dataMap.get(rekey);
	},
  
};

module.exports = StudentContract;