"use strict";

var PartTimeJob = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");//用来保存所有兼职记录
	LocalContractStorage.defineMapProperty(this, "createdMap");//用来存放每个地址和该地址创建的兼职编号数组
	LocalContractStorage.defineProperty(this, "size");
};

PartTimeJob.prototype = {
    init: function() {
		this.size = 1;
	},
    save: function(title, detail) {//发布兼职
        var title = title.trim();

        if (title === "") {
            throw new Error("empty title");
        }
		
		var detail = detail.trim();

        if (detail === "") {
            throw new Error("empty detail");
        }

        
        var key = this.size;
		var from = Blockchain.transaction.from;
        var obj = new Object();
		obj.key = key;
        obj.title = title;
		obj.detail = detail;
        obj.author = from;
		obj.createdDate = Blockchain.transaction.timestamp;
		
        this.dataMap.set(key, JSON.stringify(obj));//保存一条兼职记录
		
		//更新自己创建的兼职列表数组
		var tempObj = this.createdMap.get(from);
		var myArr;
		if(tempObj == null){
			myArr = [];//如果是第一次创建
			myArr.push(key);
		}else{
			myArr = JSON.parse(tempObj);
			myArr.push(key);
		}
		
		this.createdMap.set(from, JSON.stringify(myArr));//更新自己创建的兼职列表数组
		
		
		
		this.size += 1;
    },
	
    getAll: function() {//显示
		var from = Blockchain.transaction.from;
        var myArr = [];
		for(var i=1; i<this.size+1; i++){
			var tempObjStr = this.dataMap.get(i);
			if(tempObjStr == "" || tempObjStr == null){
				continue;
			}
			var tempObj = JSON.parse(tempObjStr);
			myArr.push(tempObj);
		}

        return myArr;
    },
	
	deleteJob: function(key){//删除一条自己创建的记录
		var key =parseInt(key);
		var from = Blockchain.transaction.from;
		var tempObj = this.createdMap.get(from);
		var myArr;
		if(tempObj == null || tempObj == ""){
			throw new Error("You have not created any.");
		}else{
			myArr = JSON.parse(tempObj);
			var i = myArr.indexOf(key);
			if(i < 0){//如果此记录不是该地址创建的
				throw new Error("The recorde doesn't exist.");
			}else{
				myArr.splice(i, 1);//从创建列表中移除
				this.createdMap.set(from, JSON.stringify(myArr));//重新保存
				
				//从保存所有兼职记录的dataMap中移除
				this.dataMap.delete(key);
			}
		}
		
				
	},
	
	getMy: function(){//显示自己创建的
		var from = Blockchain.transaction.from;
		var tempObj = this.createdMap.get(from);
		var myArr = [];
		if(tempObj == null){//没有创建过
			return myArr;
		}else{
			var myCreatedArr = JSON.parse(tempObj);
			for(var i=0; i<myCreatedArr.length; i++){
				var temp = JSON.parse(this.dataMap.get(myCreatedArr[i]));
				myArr.push(temp);
			}
		}

        return myArr;
	}
};

module.exports = PartTimeJob;