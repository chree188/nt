'use strict';

var AdItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.type = obj.type;
        this.content = obj.content;
        this.starttime = obj.starttime;
        this.endtime = obj.endtime;
        this.title = obj.title;
        this.url = obj.url;
        this.adurl = obj.adurl;
    }else{
        this.type = "text";
        this.content = "";
        this.starttime = 0;
        this.endtime = 0;
        this.title = "";
        this.url = "";
        this.adurl = "";
    }
}

AdItem.prototype = {
    toString:function(){
        return JSON.stringify(this);
    }
};

var AdBuyInfo = function(text){
    //等待竞选结果
    const TYPE_SUSPEND = 0;
    //竞选成功
    const TYPE_SUCCESS = 1;
    //竞选失败
    const TYPE_FAIL = -1;
    if (text) {
        var obj = JSON.parse(text);
        this.buyer = obj.buyer;
        this.price = obj.price;
        this.type = obj.type;
        this.timestamp = obj.timestamp;
        this.aditem = obj.aditem;
    }else{
        this.buyer = "";
        this.price = new BigNumber(0);
        this.type = TYPE_SUSPEND;
        this.timestamp = 0;
        this.aditem = null;
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
    //正在发布的广告
    LocalContractStorage.defineMapProperty(this,"publishingAd",{
        parse:function(text){
            return new AdBuyInfo(text);
        },
        stringify:function(o){
            return o.toString();
        }
    });
    //即将发布的广告
    LocalContractStorage.defineMapProperty(this,"willpublishAd",{
        parse:function(text){
            return new AdBuyInfo(text);
        },
        stringify:function(o){
            return o.toString();
        }
    });
    //用于记录现在合约里有多少钱
    LocalContractStorage.defineProperty(this, "balance", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    LocalContractStorage.defineProperty(this, "logresult", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });
};

const MYWALLET = "n1UT4MRvvL79LimGSuc7duEjSYHsZVkSQB1";

InfoManager.prototype = {
    init:function(){
        // this.size = 0;
        //存储size
        LocalContractStorage.put("storage_size",0);
        this.balance = new BigNumber(0);
    },
    //type,content,min,data.title,data.url]
    submitOrder:function(type,content,timelast,title,url,adurl){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var adinfo = new AdBuyInfo();

        this.balance.plus(value);
        
        if(value<new BigNumber(1000000000000000)){
            return -99;
        }

        var date = Date.now();

        adinfo.buyer = from;
        adinfo.price = value;
        adinfo.type = AdBuyInfo.TYPE_SUSPEND;
        adinfo.timestamp = date;

        var timeLast = parseInt(timelast);
        var aditem = new AdItem();
        aditem.type = type;
        aditem.content = content;
        aditem.title = title;
        aditem.url = url;
        aditem.starttime = date;
        aditem.endtime = date + timeLast*60*1000;
        aditem.adurl = adurl;

        adinfo.aditem = aditem;
        
        this._checkPublishing(adinfo);

        // this.receiveSubmit.put(from,adinfo);
        return 0;
    },
    _checkPublishing:function(adinfo){
        var key = "";
        var aditem = adinfo.aditem;
        var type = aditem.type;
        var value = adinfo.price;
        var lasttime = (aditem.endtime - aditem.starttime)/(60*1000);
        var from = adinfo.buyer;
        var timenow = Date.now();

        if(type === "text"){
            if(lasttime == 60){
                key = "text_hour";
            }else if(lasttime == 60*24){
                key = "text_day";
            }
        }
        if(type == "picture"){
            if(lasttime == 60){
                key = "picture_hour";
            }else if(lasttime == 60*24){
                key = "picture_day";
            }
        }

        var adbuyinfo =  this.publishingAd.get(key);
        if(adbuyinfo){
            //有人刊登，需要先检查结束时间
            //时间还没有到，不能结束，放置到即将发布的里面比较

            //结束时间小于当前时间，说明已经过期了，可以替换掉
            if(adbuyinfo.endtime<timenow){
                this.publishingAd.put(key,adinfo);
                return 1;
            }
            //还没有到时间，对比竞选队列
            else{
                var adInWill = this.willpublishAd.get(key);
                //如果竞选队列中没有，则直接放入
                if(!adInWill){
                    this.willpublishAd.put(key,adinfo);
                }
                //如果竞选队列中有，则比较价格
                else{
                    if(value > adInWill.value){
                        this.willpublishAd.put(key,adinfo);
                        return -1;
                    }else{
                        //否则将钱还掉
                        this.balance.minus(value);
                        Blockchain.transfer(from,value);
                        return -2;
                    }
                }
            }
        }else{
            //无人刊登
            this.publishingAd.put(key,adinfo);
            return -3;
        }

    },
    //获取正在展示的广告
    getPublishingAd:function(){
        var adbuy_text_hour =  this.publishingAd.get("text_hour");
        var adbuy_text_day =  this.publishingAd.get("text_day");
        var adbuy_picture_hour =  this.publishingAd.get("picture_hour");
        var adbuy_picture_day =  this.publishingAd.get("picture_day");
        var result = "";
        if(adbuy_text_hour){
            result += adbuy_text_hour.toString() +"*";
        }
        if(adbuy_text_day){
            result+=adbuy_text_day.toString()+"*";
        }
        if(adbuy_picture_hour){
            result+=adbuy_picture_hour.toString()+"*";
        }
        if(adbuy_picture_day){
            result += adbuy_picture_day.toString()+"*";
        }
        return result;
    },
    //或者将要展示的广告
    getWillPublishAd:function(){
        var adbuy_text_hour =  this.publishingAd.get("willpublishAd");
        var adbuy_text_day =  this.publishingAd.get("willpublishAd");
        var adbuy_picture_hour =  this.publishingAd.get("willpublishAd");
        var adbuy_picture_day =  this.publishingAd.get("willpublishAd");
        var result = "null";
        if(adbuy_text_hour){
            result += adbuy_text_hour.toString()+"*";
        }
        if(adbuy_text_day){
            result+=adbuy_text_day.toString()+"*";
        }
        if(adbuy_picture_hour){
            result+=adbuy_picture_hour.toString()+"*";
        }
        if(adbuy_picture_day){
            result += adbuy_picture_day.toString()+"*";
        }
        return result;
    },
    withdraw:function(){
        var from = Blockchain.transaction.from;
        //只有我能取钱
        if(from === MYWALLET){
            var amount = new BigNumber(value * 1000000000000000000)
            var res = Blockchain.transfer(from,amount);
        
            if(res){
                this.logresult = this.balance;
            }else{
                this.logresult = -1;
            }
            this.balance = new BigNumber(0);
        }else{
            this.logresult = -99;
        }
    },
    getLog:function(){
        return this.logresult;
    },
    getBalance:function(){
        return this.balance;
    }
};

module.exports = InfoManager;

