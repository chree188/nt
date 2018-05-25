'use strict';


const TYPE_MX_NORMAL = 1;
const TYPE_BS_NORMAL = 5;
const TYPE_BS_WIN = 2;
const TYPE_MX_WIN = 3;
const TYPE_LOSE = 4;


//买的种类
const TYPE_BS = 'bs';
const TYPE_MX = 'mx';

//保守型中1倍概率
const PRO_BS_NORMAL = 0.9;
//保守型中大奖概率
const PRO_BS_WIN = 0.01;
//保守型什么都没中概率
const PRO_BS_LOSE = 0.09;

//冒险型中10倍概率
const PRO_MX_NORMAL = 0.09;
//冒险型中大奖概率
const PRO_MX_WIN = 0.005;
//冒险型什么都没中概率
const PRO_MX_LOSE = 0.905;

//获得冒险大奖占奖池比重
const RATIO_MX_WIN = 0.2;
//获得保守大奖占奖池比重
const RATIO_BS_WIN = 0.1;

const DEFAULT_VALUE_NAS = 0.1;


//默认实验费用，Wei
const DEFAULT_VALUE = (new BigNumber(1000000000000000000)).times(DEFAULT_VALUE_NAS);


const MYWALLET = "n1UT4MRvvL79LimGSuc7duEjSYHsZVkSQB1";

var WinItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.type = obj.type;
        this.value = obj.value;
        this.address = obj.address;
    }else{
        this.address = "";
        this.type = TYPE_MX_WIN;
        this.value = new BigNumber(0);
    }
};

WinItem.prototype = {
    toString:function(){
        return JSON.stringify(this);
    }
};

//购买种类
var BuyItem  =function(text){
    if(text){
        var obj = JSON.parse(text);
        this.totalValue = obj.totalValue;
        this.type = obj.type;
        this.address = obj.address;
    }else{
        this.type = TYPE_BS;
        this.totalValue = new BigNumber(0);
        this.address = "";
    }   
}

BuyItem.prototype = {
    toString:function(){
        return JSON.stringify(this);
    }
};



//消息管理类
var InfoManager = function(){
    //获奖的数据存储
    LocalContractStorage.defineMapProperty(this,"winRepo",{
        parse:function(text){
            return new WinItem(text);
        },
        stringify:function(o){
            return o.toString();
        }
    });

    //计算获得大奖次数
    LocalContractStorage.defineProperty(this, "totalWin", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });

    //所有购买记录
    LocalContractStorage.defineMapProperty(this,"buyItems",{
        parse:function(text){
            return new BuyItem(text);
        },
        stringify:function(o){
            return o.toString();
        }
    });

    //计算购买了多少
    LocalContractStorage.defineProperty(this, "totalSize", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });

    //合约余额
    LocalContractStorage.defineProperty(this, "balance", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });

    //购买冒险型计数
    LocalContractStorage.defineProperty(this, "chooseMX", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });

    //购买保守型计数
    LocalContractStorage.defineProperty(this, "chooseBS", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });

    //抽奖者抽奖的结果
    LocalContractStorage.defineMapProperty(this,"chooseResult",{
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return parseInt(str);
        }
    });


};


InfoManager.prototype = {
    init:function(){
        this.chooseBS = 0;
        this.chooseMX = 0;
        this.totalSize = 0;
        this.totalWin = 0;
        this.balance = new BigNumber(0);
    },
    choose:function(type){
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;

        console.info("不能少于0.1nas");
        // return type;
        //如果比0.1nas少，则返回错误
        if(value.lt(DEFAULT_VALUE)){
            console.info("不能少于0.1nas");
            // throw new Error("不能少于0.1nas");
            return -1;
        }else{
            console.info("等于0.1nas");
            // throw new Error("等于0.1nas");
        }

        if(type === TYPE_BS || type === TYPE_MX){
            var buyItem = new BuyItem();
            buyItem.totalValue = this.balance;
            buyItem.address = from;
            buyItem.type = type;

            this.totalSize = this.totalSize + 1;
            this.buyItems.put(this.totalSize,buyItem);
            this.balance = this.balance.plus(value);

            if(type === 'mx'){
                // throw new Error("mx");
                return this._chooseMX(from);
            }else if(type === 'bs'){
                // throw new Error("bs");
                return this._chooseBS(from);
            }

        }else{
            return -2;
            // throw new Error("选择错误");
        }
        

    },
    _chooseMX:function(from){
        this.chooseMX = this.chooseMX + 1;
        var random = Math.random();
        //小于PRO_MX_LOSE，则代表输了
        if(random<PRO_MX_LOSE){
            this.chooseResult.put(from,TYPE_LOSE);
            return TYPE_LOSE;
        }
        //大于PRO_MX_LOSE，小于PRO_MX_LOSE+PRO_MX_WIN，代表中大奖了
        else if(random>=PRO_MX_LOSE && random<PRO_MX_LOSE+PRO_MX_WIN){
            this.chooseResult.put(from,TYPE_MX_WIN);
            //打钱给获得大奖的人
            var value = this.balance.times(RATIO_MX_WIN);
            this._transfer(from,value);

           this.totalWin = this.totalWin+1;
            var winItem = new WinItem();
            winItem.type = TYPE_MX_WIN;
            winItem.value = value;
            winItem.address = from;
            this.winRepo.put(this.totalWin,winItem);
            return TYPE_MX_WIN;
        }
        //大于PRO_MX_LOSE+PRO_MX_WIN，小于1，代表中了普通奖
        else{
            this.chooseResult.put(from,TYPE_MX_NORMAL);
            //打钱给获得普通奖的人
            this._transfer(from,DEFAULT_VALUE.times(10));

            this.totalWin = this.totalWin+1;
            var winItem = new WinItem();
            winItem.type = TYPE_MX_NORMAL;
            winItem.value = DEFAULT_VALUE.times(10);
            winItem.address = from;
            this.winRepo.put(this.totalWin,winItem);
            return TYPE_MX_NORMAL;
        }

    },  
    _chooseBS:function(from){
        this.chooseBS = this.chooseBS + 1;
        var random = Math.random();

        if(random<PRO_BS_LOSE){
            this.chooseResult.put(from,TYPE_LOSE);
            console.info("失败");
            return TYPE_LOSE;
        }
        else if(random>=PRO_BS_LOSE && random<PRO_BS_LOSE+PRO_BS_WIN){
            this.chooseResult.put(from,TYPE_BS_WIN);
            var value = this.balance.times(RATIO_BS_WIN);
            this._transfer(from,value);

            this.totalWin = this.totalWin+1;
            var winItem = new WinItem();
            winItem.type = TYPE_BS_WIN;
            winItem.value = value;
            winItem.address = from;
            this.winRepo.put(this.totalWin,winItem);
            console.info("中奖");
            // throw new Error("中奖");
            return TYPE_BS_WIN;
        }
        else{
            this.chooseResult.put(from,TYPE_BS_NORMAL);
            this._transfer(from,DEFAULT_VALUE);
            console.info("普通奖");
            // throw new Error("普通奖");
            return TYPE_BS_NORMAL;
        }
    },
    //打钱给获奖的人
    _transfer:function(address,value){
        var res = Blockchain.transfer(address,value);
        if(!res){
            // throw new Error("转账失败 address="+address+",value="+value);
            return JSON.stringify({"result":"转账失败","value":value});
        }
        this.balance = this.balance.minus(value);
        return 0;
    },
    getNumber:function(){

        var res = JSON.stringify({TYPE_BS:this.chooseBS,TYPE_MX:this.chooseMX});
        // var res = this.chooseBS+","+this.chooseMX;
        return res;
    },
    getResult:function(address){
        return this.chooseResult.get(address);
    },
    getBalance:function(){
        return this.balance;
    },
    getWinResult:function(){
        var num = this.totalWin;
        var res="";
        for(var i=1;i<num+1;i++){
            var item = this.winRepo.get(i);
            if(item)
            res+=item.toString()+"|";
        }
        return res;
    },
    getAllBuy:function(){
        var num = this.totalSize;
        var res = "";
        for(var i=1;i<num+1;i++){
            var item = this.buyItems.get(i);
            if(item)
            res+=item.toString()+"|";
        }
        return res;
    }
};

module.exports = InfoManager;

