'use strict';

//投诉
var Report = function(obj){
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }
    if(typeof obj === "object"){
        this.aid = obj.aid; //投诉id
        this.trueName = obj.trueName; //司机名称
        this.carNo = obj.carNo; //车牌号码
        this.desc = obj.desc; //事件描述
        this.amount = obj.amount; //投诉数量
        this.date = obj.date; //提交日期
        this.refer = obj.refer; //提交人
    }else{
        this.aid = "";
        this.trueName = "";
        this.carNo = "";
        this.desc = "";
        this.amount = "";
        this.date = "";
        this.refer = "";
    }
};

Report.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//投诉黑名单
var Blacklist = function() {
    LocalContractStorage.defineMapProperties(this, {
        "reports": {
            parse: function (value) {
                return new Report(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"index");
    LocalContractStorage.defineMapProperty(this, "complainMap");
    LocalContractStorage.defineProperty(this, "complainList");
};

Blacklist.prototype = {

    //初始化
    init: function (reports) {
        this._name = "blackList of Nebulas";
        this._creator = Blockchain.transaction.from;
        this.size = 0;
        this.index = 0;
    },

    //排序
    sort: function(){

        var keys = this.size;
        var result = [];
        var max = 999999999; // 存放每一次拍完序后的，该过程中产生的最大的元素。

        for(var i=0; i<keys; i++) {
               //var temp = -1;
               var tempObj = this.complainMap.get(i);
              //  for( var k=0; k<keys; k++) {
              //        // 和上次循环产生的最大值进行比较
              //       if(this.complainMap.get(k).amout >= max) {
              //           continue;
              //       }

              //       if(temp < this.complainMap.get(k).amout) {
              //           temp = this.complainMap.get(k).amout;
              //           tempObj = this.complainMap.get(k);
              //       }
              // }
              result[i] = tempObj;
              //max = temp;
        }

        LocalContractStorage.set("complainList", result);

        return result;
    },

    //添加投诉
    addComplain: function (trueName, carNo, desc) {

        //调用地址
        var from = Blockchain.transaction.from;
        //初始化投诉数
        var amount = 1;
        //投诉id
        var index = this.index;

        //判断车牌号码是否存在
        if (this.queryComplain(carNo)){
            throw new Error("车牌号码已经存在！");
        }

        //新增一个数据
        var item = new Report({
            "trueName": trueName,
            "carNo": carNo,
            "desc": desc,
            "amount": amount,
            "aid" : index,
            "date": Blockchain.transaction.timestamp.toString(10),
            "refer": from
        });

        //总表与排序表统一添加，key不同
        this.reports.set(carNo, item);
        this.complainMap.set(index, item);
        this.size += 1;
        this.index += 1;
        this.sort();
    },

    //删除投诉
    delComplain: function(carNo){
        if(carNo){
            var report = this.queryComplain(carNo);
            var index = report.aid;

            //总表与排序表统一删除，key不同
            this.reports.del(carNo);
            this.complainMap.del(index);

            this.size--;
            this.sort();
        }else{
            throw new Error("车牌号码不存在！");
        }        
    },

    //投诉
    goComplain: function(carNo){
        if(carNo){
            var report = this.queryComplain(carNo);
            var amount = report.amount;
            var index = report.aid;
            amount += 1;
            report.amount = amount;
            //总表与排序表统一修改，key不同
            this.reports.set(carNo, report);
            this.complainMap.set(index, report);
            this.sort();
            return report;
        }else{
            throw new Error("车牌号码不存在！");
        }
    },

    //查询投诉
    queryComplain: function(carNo){
        carNo = carNo.trim();
        if (carNo === "") {
            throw new Error("车牌号码不能为空！");
        }
        return this.reports.get(carNo);
    },

    //投诉列表
    queryComplainList: function(){
        this.sort();
        return this.complainList;
    },

    //总数
    goTotal: function(){
        return this.size;
    }
};

module.exports = Blacklist;