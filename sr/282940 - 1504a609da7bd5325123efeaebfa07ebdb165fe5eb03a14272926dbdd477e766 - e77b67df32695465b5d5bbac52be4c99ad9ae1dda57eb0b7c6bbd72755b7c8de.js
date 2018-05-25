"use strict";

var RecordItem = function(text){
    if (text) {
      var item = JSON.parse(text);

      this.id = item.id;
      this.age = item.age;
      this.grade = item.grade;
      this.title = item.title;
      this.content = item.content;
      this.author = item.author;
    }else{
      this.id = "";
      this.age = "";
      this.grade = "";
      this.title = "";
      this.content = "";
      this.author = "";
    }
};

RecordItem.prototype = {
    toString:function(){
      return JSON.stringify(this);
    }
};

var LifeJourney = function(){
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"pageNum");
    LocalContractStorage.defineProperty(this,"addrSize");
    LocalContractStorage.defineMapProperty(this,"LifeJourneyRepo",{
        parse:function(text){
          return new RecordItem(text);
        },
        stringify:function (o){
          return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"userRepo");  //单一用户所有记录
    LocalContractStorage.defineMapProperty(this,"ageRepo");   //年龄所有记录
    LocalContractStorage.defineProperty(this,"addressRepo");  //所有用户钱包地址
};

LifeJourney.prototype = {
    init: function(){
        this.size = 0; //记录总条数
        this.addrSize = 0; //作者地址总个数
        this.pageNum = 50; //每页50条数据
    },
    //存储所有记录
    save: function (age,title,content,grade){
        
        age = parseInt(age)||0;
        title = title.trim();
        content = content.trim();
        grade = parseInt(grade)||0;
        if( !title || title === ""){
            throw new Error("请输入标题");
        }
        if (!content || content === "") {
            throw new Error("请入内容");
        }

        var id = this.size;
        var author = Blockchain.transaction.from;
        var recordItem = new RecordItem();
        recordItem.id = id;
        recordItem.age = age;
        recordItem.grade = grade;
        recordItem.title = title;
        recordItem.content = content;
        recordItem.author = author;

        //将该记录存入LifeJourneyRepo表；
        this.LifeJourneyRepo.put(id,recordItem);  
        
        //将该记录存入userRepo表；
        var userRecordIds = this.userRepo.get(author)||[]; //用数组装好该用户信息的所有id号
        userRecordIds[userRecordIds.length] = id;//新增该用户关联组的一条记录
        this.userRepo.set(author,userRecordIds);

        //将该记录存入ageRepo表；
        var ageRecordIds = this.ageRepo.get(age)||[];
        ageRecordIds[ageRecordIds.length] = id;
        this.ageRepo.set(age,ageRecordIds); 

        this.size ++;

        //将钱包地址存入addressRepo表中
        //1.查重
        var arrays = this.addressRepo || [];
        //不存在该author
        if (arrays.indexOf(author) == -1 ) {
        	arrays.push(author);
        	this.addressRepo = arrays; //存储
            this.addrSize ++;//计数加一
        }
     },
     //获取总记录条数
     getRecordNum:function(){
        return parseInt(this.size);
     },

     //获取总用户个数
     getAuthorNum:function(){
        return parseInt(this.addrSize);
     },

    //分页获取钱包信息
    getAddrs: function(p){
    	var page = parseInt(p);
    	page = (page === 0 || !page) ? 1 : page;
        var maxPage = this.getTotalPage();//最大页数
        
        var result = [];
        if (maxPage === 0 ) {
            return result;
        }
        //超出页码则循环回到第一页
        page = (page > maxPage)? page - maxPage :page;
        //返回指定页记录
        var star  = (page -1) * this.pageNum; 
        var end   = (this.addrSize  > page * this.pageNum)? page * this.pageNum : this.addrSize;
        var num =   end - star;//num为计算该页有多少条记录
       	var list = this.addressRepo || [];
        for (var i = num-1; i >=0; i--) {
        	result.push(list[star+i]);
        }
        return result;
    },

    //获取总页数
    getTotalPage:function(){
        var maxPage =parseInt(this.addrSize / this.pageNum);
        maxPage  = (this.size % this.pageNum === 0 ) ? maxPage: maxPage +1;
        return maxPage;
    },

    //获取某钱包的所有信息
    getUserRecord:function(author){
        author = author.trim();
        if(author === ""){
            throw new Error("未传入用户钱包地址");
        }
        var Ids = this.userRepo.get(author) || []; //获取该用户所有Id
        var result = [];
        for (var i = 0 ; i < Ids.length; i++) {
            var id = Ids[i];
            result.push(this.LifeJourneyRepo.get(id));
        }
        result = this._sorting(result); //按年龄从小到大排序
        return result;
    },

    //按年龄从小到大排序
    _sorting:function(arr){

        for (var i = 0; i <arr.length-1; i++) {
            for (var j = 0; j < arr.length -1-i; j++) {
                if (arr[j].age > arr[j+1].age) {
                    var temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
        return arr;
    },

    //获取某岁第p页信息
    getAgeRecord:function(age,p){
        age = parseInt(age); 
        var page = parseInt(p);
        page = (page === 0) ? 1 : page;
        var maxPage = this.getTotalAgePage(age);//最大页数

        var result = [];
        //页码为0或超出总页码，返回空
        if (maxPage === 0  || page>maxPage) {
            return result;
        }
        
        var ids = this.ageRepo.get(age) || [];

        //返回指定页记录
        var star  = (page -1) * this.pageNum; 
        var end   = (ids.length  > page * this.pageNum)? page * this.pageNum : ids.length;
        var num =   end - star;
        var result = [];
        for (var i = num -1 ; i >=0 ; i--) {
            var id = ids[star + i];
            result.push(this.LifeJourneyRepo.get(id));
        }
        return result;
    },

    //获取某岁总页数
    getTotalAgePage:function (age){
        age = parseInt(age);
        var ids = this.ageRepo.get(age)|| [];
        var maxPage =parseInt((ids.length) / this.pageNum);
        maxPage  = (ids.length % this.pageNum === 0 ) ? maxPage: maxPage +1;
        return maxPage;
    },

    
    //debug
    debug: function(name,age,author){
        if (name =="getAddrs") {
            var list = this.addressRepo || [];
            return {"list":list};
        }
        else if (name == "getRecords"){
        	var list = [];

            for (var i = 0; i < this.size; i++) {
                list.push(this.LifeJourneyRepo.get(i));
            }
            return {"list":list};
        }
        else if (name == "getTotalPage"){
            return {"getTotalPage":this.getTotalPage()};
        }
        else if (name == "getTotalAgePage"){
            return {"getTotalAgePage":this.getTotalAgePage(age)};
        }
        else if (name == "getRecordNum"){
            return {"总记录条数:":this.size};
        }
        else if (name == "getAuthorNum"){
            return {"总用户个数:":this.addrSize};
        }

        return ("没有这个方法");

    },
};
module.exports = LifeJourney;



