'use strict';

const PRICE_EGG = 0.1;
const HATCH_PRICE = 0.99;
const EGG_PRODUCE_RATE = 0.04;
const HATCH_TIME = 1000*24*60*60;

const MY_WALLET = "n1ZzbPVwHsSxdB98oqp2ps9rF5hNzFV3AzX";

//用户农场信息
var FarmItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        //鸡场鸡总数
        this.chicken = obj.chicken;
        //鸡场蛋总数
        this.egg = obj.egg;
        //鸡场正在孵化鸡数
        this.hatching = obj.hatching;
        //开始孵化时间
        this.hatchingtime = obj.hatchingtime;
        //最后一次查看数据的时间
        this.lookingtime = obj.lookingtime;
        //当前时间
        this.timenow = obj.timenow;
    }else{
        this.chicken = 0;
        this.egg = 0;
        this.hatching = 0;
        this.hatchingtime = 0;
        this.lookingtime = 0;
        this.timenow = 0;
    }
}

FarmItem.prototype = {
    toString:function(){
        return JSON.stringify(this);
    },
    adopt:function(){
        this.chicken = 1;
        this.lookingtime = Date.now();
        this.timenow = Date.now();
    },
    buyEgg:function(num){
        this.refreshData();
        this.egg = this.egg + num;
    },
    sellEgg:function(num){
        this.refreshData();
        this.egg = this.egg-num;
    },
    hatchEgg:function(num){
        this.refreshData();
        this.hatchingtime = Date.now();
        this.hatching = num;
        this.egg = this.egg - num;
    },
    //更新信息
    refreshData:function(){
        this.timenow = Date.now();
        var timelast = this.timenow - this.lookingtime;
        var hour = timelast/(1000*3600);
        var egg_add = hour*EGG_PRODUCE_RATE*this.chicken;
        this.egg = this.egg + egg_add;
        this.lookingtime = Date.now();
        
        //检查有没有孵化出来
        if(this.hatching!=0){
            var hatchtime = this.timenow - this.hatchingtime;
            //孵化出来了
            if(hatchtime>HATCH_TIME){
                this.chicken = this.chicken + this.hatching;
                this.hatching = 0;
                this.hatchingtime = 0;
            }
        }
      
    }
}


//消息管理类
var InfoManager = function(){
    LocalContractStorage.defineMapProperty(this,"userFarm",{
        parse:function(text){
            return new FarmItem(text);
        },
        stringify:function(o){
            return o.toString();
        }
    });

};

InfoManager.prototype = {
    init:function(){
        
    },
    //收养母鸡
    adoptChicken:function(){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if(this.userFarm.get(from)){
            return -1;
        }
        
        var farmItem = new FarmItem();
        farmItem.adopt();
        this.userFarm.put(from,farmItem);
    },
    getFarmInfo:function(address){
        var farmItem = this.userFarm.get(address);
        if(farmItem){
            farmItem.timenow = Date.now();
            return farmItem;
        }else{
            return new FarmItem();
        }
    },
    hatchEgg:function(number){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var price = (new BigNumber('1e18')).times(HATCH_PRICE);
        var num = value.dividedBy(price);

        // throw new Error("购买个数"+num);
        if(parseInt(number)<1){
            throw new Error("需要大于0个");
        }
        if(num<number){
            // Blockchain.transfer(from,value);
            throw new Error("孵化金额不够");
            // return -1;
        }else{
            var numInt = parseInt(number);
            var farmItem = this.userFarm.get(from);
            if(farmItem){
                farmItem.refreshData();
                if(numInt > farmItem.egg){
                    throw new Error("鸡蛋数目不够孵化");
                }
                farmItem.hatchEgg(numInt);
                this.userFarm.put(from,farmItem);
            }else{
                throw new Error("鸡蛋数量需要大于0个");
            }
            return 0;
        }
    },
    buyEgg:function(number){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var price = (new BigNumber('1e18')).times(PRICE_EGG);
        var num = value.dividedBy(price);

        // throw new Error("购买个数"+num);
        if(parseInt(number)<1){
            throw new Error("需要大于0个");
        }

        if(num<number){
            // Blockchain.transfer(from,value);
            throw new Error("付款金额不够");
            // return -1;
        }else{
            var numInt = parseInt(number);
            var farmItem = this.userFarm.get(from);
            if(farmItem){
                farmItem.buyEgg(numInt);
                this.userFarm.put(from,farmItem);
            }else{
                farmItem = new FarmItem();
                farmItem.adopt();
                farmItem.buyEgg(numInt);
                this.userFarm.put(from,farmItem);
            }
            return 0;
        }
    },
    sellEgg:function(num){
        var from = Blockchain.transaction.from;
        var number = parseInt(num);
        if(number<1){
            throw new Error("鸡蛋数量需要大于1");
        }else{
            var farmItem = this.userFarm.get(from);
            if(farmItem){
                farmItem.refreshData();
                var egg = farmItem.egg;
                if(egg<num){
                    throw new Error("你的养鸡场里没有足够鸡蛋可卖");
                }else{
                    farmItem.sellEgg(num);
                    this.userFarm.put(from,farmItem);
                    var price = (new BigNumber('1e18')).times(num*PRICE_EGG);
                    var res = Blockchain.transfer(from,price);
                    if(!res){
                        throw new Error("目前市面上供大于求，等待有人买鸡蛋");
                    }
                    return 0;
                }
            }else{
                throw new Error("你的养鸡场里没有鸡蛋可卖");
            }
        }
    },
    withdraw:function(value){
        var valuef = parseFloat(value);
        var price = (new BigNumber('1e18')).times(valuef);
        var from = Blockchain.transaction.from;
        if(from!=MY_WALLET){
            throw new Error("无法取现");
        }        
        
        var res = Blockchain.transfer(MY_WALLET,price);
        if(res){
            return value;
        }else{
            throw new Error("取现失败");
        }

    },
    refreshData:function(){
        var from = Blockchain.transaction.from;
        var farmItem = this.userFarm.get(from);
        if(farmItem){
            farmItem.refreshData();
            this.userFarm.put(from,farmItem);
        }else{
            throw new Error("该账号没有养鸡场，先领养一只吧");
        }
    },
    refreshFarmInfo:function(){
        var from = Blockchain.transaction.from;


    }


};

module.exports = InfoManager;

