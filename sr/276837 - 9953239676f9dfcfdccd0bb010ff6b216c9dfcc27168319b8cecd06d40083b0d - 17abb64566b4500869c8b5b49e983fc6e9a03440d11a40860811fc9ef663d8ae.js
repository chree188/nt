'use strict';

// 定义信息类
var Person = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.mobile = obj.mobile;                 // 手机
        this.email = obj.email;                  // 邮箱
        this.nickname = obj.nickname;            // 昵称
        this.idcard = obj.idcard;            // 身份证
        this.name = obj.name;            // 姓名
        this.birthday = obj.birthday;            // 出生年月日
        this.city = obj.city;            // 城市
        this.icon = obj.icon;            // 图标地址
        this.sex = obj.sex;            // 性别
        this.company = obj.company;            // 公司
        this.info=obj.info;            // 地址
        this.timestamp=obj.timestamp;            // 地址
    } else {
    	  this.mobile = "";                 // 手机
          this.email = "";                  // 邮箱
          this.nickname = "";            // 昵称
          this.idcard = "";            // 身份证
          this.name = "";            // 姓名
          this.birthday = "";            // 出生年月日
          this.city = "";            // 城市
          this.icon = "";            // 图标地址
          this.sex = 1;            // 性别
          this.company = "";            // 公司
          this.info="";            // 钱包地址
          this.timestamp=0;
    }
};

// 将信息类对象转成字符串
Person.prototype.toString = function () {
    return JSON.stringify(this)
};

// 定义智能合约
var PersonContract = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为BottleMap
    // 这里不使用prototype是保证每布署一次该合约此处的BottleMap都是独立的
    LocalContractStorage.defineMapProperty(this, "personMap", {
        // 从personMap中读取，反序列化
        parse: function (text) {
            return new Person(text);
        },
        // 存入personMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

// 定义合约的原型对象
PersonContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {
    	 this.size = 0;
    },
    // 修改地址信息
    edit : function (mobile,email,nickname,city,sex,info,icon,company,idcard,name,birthday) {
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        var person=this.personMap.get(from);
        if(!person){
        	person=new Person();
        	person.timestamp=new Date().getTime();
        	 this.size +=1;
        }
        if(info){
        	person.info=info;
        }
        if(mobile){
        	person.mobile=mobile;
        }
        if(email){
        	person.email=email;
        }
        if(nickname){
        	person.nickname=nickname;
        }
        if(idcard){
        	person.idcard=idcard;
        }
        if(birthday){
        	person.birthday=birthday;
        }
        if(city){
        	person.city=city;
        }
        if(icon){
        	person.icon=icon;
        }
        if(sex){
        	person.sex=sex;
        }
        if(company){
        	person.company=company;
        }
        // 此处调用前面定义的序列化方法stringify，将Bottle对象存储到存储区
        this.personMap.put(from, person);
    },
    get : function (key) {
        var person  = this.personMap.get(key);
        return person ;
    },
    getTotal : function () {
        return this.size ;
    },
};
// 导出代码，标示智能合约入口
module.exports = PersonContract;