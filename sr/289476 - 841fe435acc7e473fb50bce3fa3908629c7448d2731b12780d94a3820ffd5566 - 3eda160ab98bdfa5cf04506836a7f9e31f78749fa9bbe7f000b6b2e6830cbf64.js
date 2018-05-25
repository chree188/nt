"use strict";

// Transformers
var Transformers = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.id = obj.id;
		this.name = obj.name;
		this.desc = obj.desc;
		// 武器
		this.weapon = obj.weapon;
		// 攻击力
		this.attack = obj.attack;
		// 职位
		this.position = obj.position;
		// 变形结果
		this.transformation = obj.transformation;
		this.life = obj.life;
		this.love = obj.love;
		this.dislike = obj.dislike;
		// 1.汽车人 2.霸天虎
		this.t_type = obj.t_type;
		// 状态 0.死亡 1.正常
		this.status = obj.status;
		this.time = obj.time;
		this.creator = obj.creator;
	} else {
	    this.id = "";
	    this.name = "";
	    this.desc = "";
	    this.weapon = "";
	    this.attack = "";
	    this.position = "";
	    this.transformation = "";
	    this.life = "";
	    this.love = "";
	    this.dislike = "";
	    this.t_type = "";
	    this.status = "";
	    this.time = "";
	    this.creator = "";
	}
};


Transformers.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TransformersPlay = function () {
    // 历史攻击次数
    LocalContractStorage.defineProperty(this, "attackSize");
    // 全部数量
    LocalContractStorage.defineProperty(this, "size");
    // 死亡数量
    LocalContractStorage.defineProperty(this, "deadSize");
    // 攻击历史记录 key 编号 value 攻击记录
    LocalContractStorage.defineMapProperty(this, "attackMap");
    // key 编号 value 变形金刚名称
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    // key 变形金刚名称 value 变形金刚对象
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function(jsonText) {
                    return new Transformers(jsonText);
                },
                stringify: function(obj) {
                    return obj.toString();
                }
    });
    // 生命 key 变形金刚名称 value 生命
    LocalContractStorage.defineMapProperty(this, "lifeMap");
    // 喜欢 key 变形金刚名称 value 喜欢数量
    LocalContractStorage.defineMapProperty(this, "loveMap");
    // 不喜欢 key 变形金刚名称 value 不喜欢数量
    LocalContractStorage.defineMapProperty(this, "dislikeMap");

};

TransformersPlay.prototype = {
    init: function () {
        this.size = 0;
        this.deadSize = 0;
        this.attackSize = 0;
    },

    add: function (name, position, transformation, attack, life, t_type) {
        // ["擎天柱", "总司令官", "大卡车", "10", "100", "1"]
        // ["威震天", "总司令官", "大手枪", "10", "100", "2"]
        // ["擎天柱","威震天2"]
       var index = this.size;
       if(this.dataMap.get(name)){
           throw new Error("已经添加过这个角色");
       }
       this.arrayMap.set(index, name);
       // 使用内置对象Blockchain获取提交内容的作者钱包地址
       var from = Blockchain.transaction.from;
       var info = new Transformers();
       info.id = index;
       info.name = name;
       info.desc = "";
       info.weapon = "";
       info.attack = attack;
       info.position = position;
       info.transformation = transformation;
       info.life = life;
       info.t_type = t_type;
       info.status = "1";
       info.time = new Date().getTime();
       info.creator = from;

       this.dataMap.set(name, info);
       this.lifeMap.set(name, life);
       this.loveMap.set(name, "0");
       this.dislikeMap.set(name, "0");
       this.size +=1;
    },
    get: function (name) {
        var transformation1 = this.dataMap.get(name);

        transformation1.life = this.lifeMap.get(name);
        transformation1.love = this.loveMap.get(name);
        transformation1.dislike = this.dislikeMap.get(name);

        return transformation1;
    },
     // 获取活着数量
     getName:function(){
         return this.size;
     },
    // 获取活着数量
     getLive:function(){
         return this.size;
     },
     // 获取死亡数量
     getDead:function(){
         return this.deadSize;
     },
     // 攻击 name.攻击者 name2.攻击对象
     goAttack:function(name, name2){
        var life2 = this.lifeMap.get(name2);
        if(!life2){
            throw new Error("没有这个攻击对象");
        }
        if(parseInt(life2) == 0){
            throw new Error("攻击对象已经阵亡，无法攻击");
        }
        var tf1 = this.dataMap.get(name);
        var attack1 = tf1.attack;

        var tf2 = this.dataMap.get(name2);
        var attack2 = tf2.attack;
        if(tf1.t_type == tf2.t_type){
            throw new Error("不能攻击本阵营对象");
        }

        var currentAttack = parseInt(attack1);
        var currentLife = parseInt(life2);
        var resultLife = currentLife - currentAttack;
        this.lifeMap.delete(name2);
        this.lifeMap.set(name2, resultLife);

        var index2 = this.attackSize;
        var date = new Date();//时间戳为10位需*1000，时间戳为13位的话不需乘1000
                    var Y = date.getFullYear() + '-';
                    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
                    var D = date.getDate() + ' ';
                    var h = date.getHours() + ':';
                    var m = date.getMinutes() + ':';
                    var s = date.getSeconds();
        this.attackMap.set(index2, name + " 攻击了 " + name2 + "， " + name2 + " 损失了 " + attack1 + " 点生命。 时间：" + Y+M+D+h+m+s);
        this.attackSize +=1;
     },
     // 获取某个变形金刚的生命
     getLife:function(name){


        return this.lifeMap.get(name);
     },
     // 喜欢
     goLove:function(name){

        var love1 = loveMap.get(name);
        var love2 = parseInt(love1);
        love2 +=1;
        loveMap.delete(name);
        loveMap.set(name, love2);
     },
     // 不喜欢
     goDislike:function(name){

        var dislike1 = dislikeMap.get(name);
        var dislike2 = parseInt(dislike1);
        dislike2 +=1;
        dislikeMap.delete(name);
        dislikeMap.set(name, dislike2);
     },

    getAll: function () {
       var limit = parseInt(1000);
               var offset = parseInt(0);
               if(offset>this.size){
                  throw new Error("offset is not valid");
               }
               var number = offset+limit;
               if(number > this.size){
                 number = this.size;
               }
               var result  = '[';
               for(var i=offset;i<number;i++){
                   var key = this.arrayMap.get(i);
                   var object = this.dataMap.get(key);
                   var a = JSON.stringify(object);
                   if(i < number -1){
                       result += a + ",";
                   } else {
                        result += a + "";
                   }
               }
               result += ']';

               return result;
    },
    // 获取所有的 根据类型
    getAllByType: function (t_type) {
        var t_type = t_type;
        var limit = parseInt(1000);
               var offset = parseInt(0);
               if(offset>this.size){
                  throw new Error("获取列表发生错误");
               }
               var number = offset+limit;
               if(number > this.size){
                 number = this.size;
               }
               var result  = '[';
               for(var i=offset;i<number;i++){
                   var name = this.arrayMap.get(i);
                   var object = this.dataMap.get(name);
                   if(object.t_type == t_type){
                       object.life = this.lifeMap.get(name);
                       object.love = this.loveMap.get(name);
                       object.dislike = this.dislikeMap.get(name);
                       var jsonStr = JSON.stringify(object);
                       result += jsonStr + ",";

                   }
               }
               if(result.lastIndexOf(",")){
                    result = result.substring(0, result.length-1);
               }
               result += ']';

               return result;
    },
    // 获取历史攻击记录
    getHistory: function () {
       var limit = parseInt(10000);
       var offset = parseInt(0);
       if(offset>this.attackSize){
          throw new Error("获取历史攻击记录发生错误");
       }
       var number = offset+limit;
       if(number > this.attackSize){
         number = this.attackSize;
       }
       var result  = '[';
       for(var i=offset;i<number;i++){
           var history = this.attackMap.get(i);
           var jsonStr = JSON.stringify(history);
           result += jsonStr + ",";
       }
       if(result.lastIndexOf(",")){
            result = result.substring(0, result.length-1);
       }
       result += ']';

       return result;
    }

};
module.exports = TransformersPlay;