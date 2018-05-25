"use strict";

var RecordItem = function(text){
    if (text) {
      var item = JSON.parse(text);

      this.id = item.id;//ID
      this.author = item.author;//作者
      this.name = item.name;//名称
      this.job = item.job;//职位
      this.Connect = item.Connect;//联系方式
      this.money = new BigNumber(item.money);//价格
      this.remarks = item.remarks;//描述
      this.status = item.status;//类型 0:雇人 1:求职 
    }else{
      this.id = "";
      this.author ="";
      this.name = "";
      this.job = "";
      this.Connect ="";
      this.money = new BigNumber(0);
      this.remarks = "";
      this.status = "";
    }
};

RecordItem.prototype = {
    toString:function(){
      return JSON.stringify(this);
    }
};

var FHC = function(){
    LocalContractStorage.defineProperty(this,"size"); //自增ID
    LocalContractStorage.defineProperty(this,"pageNum");//单页数据条数
    LocalContractStorage.defineMapProperty(this,"RecordRepo",{
        parse:function(text){
          return new RecordItem(text);
        },
        stringify:function (o){
          return o.toString();
        }
    });
};

FHC.prototype = {
    init: function(){
        this.size = 0; //记录总条数
        this.pageNum =  12; //每页12条数据
    },
    //新增记录
    save: function (status,name,job,Connect,money,remarks){
        status = parseInt(status) || 0;
        name = name.trim();
        if( !name || name === ""){
            throw new Error("请输入称呼");
        }
        job = job.trim();
        if( !job || job === ""){
            throw new Error("请输入职业");
        }
        Connect = Connect.trim();
        if( !Connect || Connect === ""){
            throw new Error("请输入联系方式");
        }
        money = new BigNumber(money);
        if( money <= 0){
            throw new Error("请输入薪酬");
        }
        remarks = remarks.trim();
        if( !remarks || remarks === ""){
            throw new Error("请输入简介");
        }

        var id = this.size;
        var author = Blockchain.transaction.from;
        var recordItem = new RecordItem();
        recordItem.id = id;//ID
        recordItem.author = author;//作者
        recordItem.name = name;//名称
        recordItem.job = job;//职位
        recordItem.Connect = Connect;//联系方式
        recordItem.money = new BigNumber(money);//价格
        recordItem.remarks = remarks;//描述
        recordItem.status = status;//类型 0:雇人 1:求职

        //将该记录存入RecordRepo表；
        this.RecordRepo.put(id,recordItem);  

        this.size ++;
     },
     //获取总记录条数
     getRecordNum:function(){
        return parseInt(this.size);
     },

     //获取总页数
     getTotalPage:function(){
        var maxPage =parseInt(this.size / this.pageNum);
        maxPage  = (this.size % this.pageNum === 0 ) ? maxPage: maxPage +1;
        return maxPage;
     },

    //分页获取钱包信息
    getRecords: function(p){
    	var page = parseInt(p);
    	page = (page === 0 || !page) ? 1 : page;
        var maxPage = this.getTotalPage();//最大页数
        
        var result = [];
        if (maxPage === 0 ) {
            return result;
        }
        //超出页码则循环回到第一页
        page = (page > maxPage)? (page % maxPage) :page;
        page = (page === 0 || !page) ? 1 : page;

        //返回指定页记录
        var star  = (page -1) * this.pageNum; 
        var end   = (this.size  > page * this.pageNum)? page * this.pageNum : this.size;
        var num =   end - star;//num为计算该页有多少条记录

        for (var i = num - 1; i >= 0; i--) {
            var record = this.RecordRepo.get(star+i);
            result.push(record);
        }
        return result;
    },
    //获取最新num条记录
    getNewRecords:function(num){
        num = parseInt(num); 
        num = (num === 0 || !num) ? num : 6; //没输入数量则默认给6条数据
        num = (num > this.size)? this.size :num; //不能超出最大条数
        var result = [];
        for (var i =this.size-1;i >=this.size-num; i--) {
            var record = this.RecordRepo.get(i);
            result.push(record);
        }
        return result;
    },
};
module.exports = FHC;



