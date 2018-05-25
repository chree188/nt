'use strict';
var MyContractOne = function () {
    LocalContractStorage.defineMapProperty(this, "MyCollection");
};

MyContractOne.prototype = {
    init: function () {
		this.adminAddress ="n1SC5veAe6gjA9pUY4uM13xNPS65sJJQp3m"; 
    },
    set: function (title,url,GoodLevel,MyType,Myuid) {
        var GetFrom = Blockchain.transaction.from;
        var obj = {};
        obj.title = title;
        var urlfinal;
        var rs =url.indexOf('http')
        if(rs!=0){
            urlfinal = 'http://'+url;
        }else{
            urlfinal = url;
        }
        obj.url = urlfinal;
        obj.GoodLevel = GoodLevel.toString().trim();
        obj.MyType = MyType.toString().trim();
        obj.Myuid  = Myuid.toString().trim();
        var alldata = this.MyCollection.get(GetFrom)
        if(alldata){
            alldata.push(obj);
            this.MyCollection.put(GetFrom, alldata)
        }else{
            var arr = [];
            arr.push(obj);
            this.MyCollection.put(GetFrom, arr)
        }
    },
    getall: function () {
        var GetFrom = Blockchain.transaction.from;
        var data = this.MyCollection.get(GetFrom)
        return data;
    },
	get: function (MyType) {
        var GetFrom = Blockchain.transaction.from;
        var data = this.MyCollection.get(GetFrom)
        for(var i=0;i<data.length;i++){
            if(data[i].MyType.toString() != MyType.toString().trim()){
                data.splice(i,1);
            }
        }
        return data;
    },
    del:function (Myuid) {
        var GetFrom = Blockchain.transaction.from;
        var data = this.MyCollection.get(GetFrom)
        for(var i=0;i<data.length;i++){
            if(data[i].Myuid == Myuid.toString().trim()){
                data.splice(i,1);
            }
        }
        this.MyCollection.put(GetFrom, data)
    },
    update:function (Myuid,title, url,GoodLevel,MyType) {
        var GetFrom = Blockchain.transaction.from;
        var data = this.MyCollection.get(GetFrom)
        for(var i=0;i<data.length;i++){
            if(data[i].Myuid == Myuid){
                data[i].title = title;
                data[i].url =  url;
                data[i].GoodLevel = GoodLevel;
                data[i].MyType = MyType;
            }
        }
        this.MyCollection.put(GetFrom, data)
    },
	balanceOf: function () {
    var GetFrom = Blockchain.transaction.from;
    return this.MyCollection.get(GetFrom);
  },
  
  withdraw: function(address, value) {
    var GetFrom = Blockchain.transaction.from
    if (GetFrom != this.adminAddress) {
        throw new Error("403")
    }

    var amount = new BigNumber(value * 1000000000000000000)
    var result = Blockchain.transfer(address, amount)
    return result
},


};
module.exports = MyContractOne;