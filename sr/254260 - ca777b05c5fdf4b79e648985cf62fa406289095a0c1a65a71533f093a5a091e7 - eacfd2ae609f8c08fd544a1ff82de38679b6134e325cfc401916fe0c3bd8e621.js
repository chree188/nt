'use strict';

//消息类
var InfoItem = function (text){
    if (text) {
        var obj = JSON.parse(text);
        //发表用户的钱包地址
        this.author = obj.author;
        //用户填写的昵称
        this.nickname = obj.nickname;
        //发表时间戳
        this.timestamp  =obj.timestamp;
        //地理位置坐标
        //经纬度都保留6位有效数字
        this.longitude = obj.longitude;
        this.latitude = obj.latitude;
        //发表内容
        this.message = obj.message;
        //联系方式
        this.contact = obj.contact;

    }else{
        this.author = "";
        this.nickname = "";
        this.timestamp = new BigNumber(0);
        this.longitude = 0.0;
        this.latitude = 0.0;
        this.message = "";
        this.contact = "";
    }
};



InfoItem.prototype = {
    toString:function(){
        return JSON.stringify(this);
    }
};

var AdBuyInfo = function(text){
    if (text) {
        var obj = JSON.parse(text);
        this.buyer = obj.buyer;
        this.price = obj.price;
    }else{
        this.buyer = "";
        this.price = 0.0;
    }
};

AdBuyInfo.prototype = {
    toString:function(){
        return JSON.stringify(this);
    }
};

//消息管理类
var InfoManager = function(){
    //用于存储地址对应的数据
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new InfoItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    //用于按照size递增存储data，便于遍历数据
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    //用于存储某个地址有多少条数据
    LocalContractStorage.defineMapProperty(this, "sizeMap");
    // this.size = 0;
    LocalContractStorage.defineMapProperty(this,"receiveSubmit",{
        parse:function(text){
            return new AdBuyInfo(text);
        },
        stringify:function(o){
            return o.toString();
        }
    });
};

InfoManager.prototype = {
    init:function(){
        // this.size = 0;
        //存储size
        LocalContractStorage.put("storage_size",0);
    },
    save:function(title,content,url,timelast){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var adinfo = new AdBuyInfo();
        adinfo.buyer = from;
        adinfo.price = parseFloat(value);
        this.receiveSubmit.put('0',adinfo);
        var res1 = Blockchain.transfer(from,value);
        console.log("transfer result:", res1);
    },
    withdraw:function(){
        var adinfo = this.receiveSubmit.get('0');
        if (adinfo) {
            var buyer = adinfo.buyer;
            var price = adinfo.price;
            var res = "buyer="+buyer+",price="+price+"res=";
            if (!Blockchain.verifyAddress(buyer)) {
                return res+"-1";
            }else{
                var value = new BigNumber(price*0.99);
                var res1 = Blockchain.transfer(buyer,value);
                console.log("transfer result:", res1);
                Event.Trigger("transfer", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: buyer,
                        value: value
                    }
                });
                return res+"0,res="+res1;
            }
            // var res = Blockchain.transfer(buyer,price);
            // return res+"0,res="+res;
        }else{
            // throw new Error("no such buyer");
            return -2;
        }
    },
    getByKey:function(key){
        return this.repo.get(key);
    },
    getKeyByIndex:function(index){
        return this.arrayMap.get(index);
    },
    len:function(){
        return LocalContractStorage.get("storage_size");
    },
    //根据经纬度和区域大小了获得数据
    getByLocation:function(latitude,longitude,area){

    },
    //根据有数据的位置来获取
    forEach:function(start,end){
        start = parseInt(start);
        end = parseInt(end);
        var size = LocalContractStorage.get("storage_size");
        size = parseInt(size);
        if (start>size || start<0) {
            throw new Error("start exceed limit range");
        };
        if (end<start) {
            throw new Error("end exceed limit range");
        };
        if(end>size){
            end = size;
        }
        var result="";

        for (var i = start; i < end; i++) {
            var key = this.arrayMap.get(i.toString());
            if (!key)continue;
            var item = this.repo.get(key);
            if(!item)continue;
            result += item+"|";
        };

        return result;
    }


};

module.exports = InfoManager;

