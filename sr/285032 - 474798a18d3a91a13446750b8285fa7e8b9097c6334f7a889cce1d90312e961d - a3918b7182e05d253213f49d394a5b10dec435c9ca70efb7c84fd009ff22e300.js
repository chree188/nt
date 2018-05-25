'use strict';

/**
 * Nebelus 预言家合约代码
 */

/**
 * 下注的记录
 * @param text
 * @constructor
 */
let  Stanza = function (text) {
    if(text){
      let o = JSON.parse(text);
      this.rise = o.rise;
      this.fall = o.fall;
      this.status = o.status;
      this.open_price = o.open_price;
      this.close_price = o.close_price;
      this.rise_amount = o.rise_amount;
      this.fall_amount = o.fall_amount;
      this.txHash = o.txHash;
      this.balance = o.balance;
    }else{
      this.rise = [];
      this.fall = [];
      this.status = 0;
      this.open_price = 0;
      this.close_price = 0;
      this.rise_amount = 0;
      this.fall_amount = 0;
      this.txHash = '';
      this.balance = 0 ;
    }
};

/**
 * 每个人下注的场次
 * @param text
 * @constructor
 */
let AddressMessage = function (text) {
    if(text){
      let o = JSON.parse(text);
      this.times = o.times;
    }else{
      this.times = []
    }
};

Stanza.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

AddressMessage.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

let Application = function () {
  LocalContractStorage.defineMapProperty(this, "stanza", {
    parse: function (text) {
      return new Stanza(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineMapProperty(this, "addressMessage", {
    parse: function (text) {
      return new AddressMessage(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};


Application.prototype = {

  init: function (address) {
    if(address === undefined || address.length>0){
      LocalContractStorage.set("address", address);
    } else{
      LocalContractStorage.set("address", "test");
    }
  },

  /**
   * 下注
   * @param type 下注的类型
   * @param time 下注的时间
   * @returns {number}
   */
  bid: function (type,time) {
    //获取下注的金额
    let value = Blockchain.transaction.value;
    //获取下注的地址
    let from = Blockchain.transaction.from;
    //当时的时间
    let now = this._formate(new Date());
    //下注的时间
    let bid_date = this._formate(new Date(parseInt(time)));
    //如果下注的时间和当前的时间 间隔大于一小时  说明这个场次已经停止下注
    if(bid_date.getTime()-now.getTime()<60*60*1000){
       throw new Error("场次已经停止下注")
    }
    //获取下注时间场次的数据
    let record = this.stanza.get(bid_date.getTime());
    //获取这个地址的所有下注记录
    let addressMessage = this.addressMessage.get(from);
    //如果这个场次第一次下注  创建
    if(!record){
        record = new Stanza()
    }
    //如果这个用户第一次下注
    if(!addressMessage){
      addressMessage = new AddressMessage();
    }
    //计算这个用户这个场次是否已经下注了
    addressMessage.times.forEach(function (t) {
        if(t === bid_date.getTime()){
          throw new Error("你已经下注了！")
        }
    });
    //这个用户的下注记录
    let typeItem  = {};
    typeItem.address = from; //用户的地址
    typeItem.value = value; //用户下注的金额
    typeItem.fromHash =  Blockchain.transaction.hash; //用户下注的交易hash
    record.balance += value.toNumber();  //这个场次的余额
    if(type === 'rise'){ //如果下注涨
      record.rise_amount+=value.toNumber(); //累加到涨的总金额上
      record.rise.push(typeItem); //下注记录放到涨的记录里
    }else if(type === 'fall'){//如果下注跌
      record.fall_amount+=value.toNumber(); //累加到跌的总金额上
      record.fall.push(typeItem)//下注记录放到跌的记录里
    }else{//如果下注类型是其他类型
      throw new Error("下注的类型不存在！")
    }
    //把这个用户的下注的场次排序保存
    addressMessage.times.push(bid_date.getTime());
    addressMessage.times.sort(function (a,b) {
      return b-a;
    });
    //存储
    this.addressMessage.put(from,addressMessage);
    this.stanza.put(bid_date.getTime(),record);
    //返回下注的时间
    return bid_date.getTime();
  },


  _formate: function (date) {
    date.setSeconds(0);
    date.setMilliseconds(0);
    date.setMinutes(0);
    return date;
  },

  _translate:function (to,value) {
    let t_result = Blockchain.transfer(to, value);
    if(!t_result){
      let failed = JSON.parse(LocalContractStorage.get("failed"));
      if(failed instanceof Array){
        let iteam = {};
        iteam.to = to;
        iteam.value = value;
        failed.push(iteam)
      }else{
        failed = [];
        let iteam = {};
        iteam.to = to;
        iteam.value = value;
        failed.push(iteam)
      }
      LocalContractStorage.set("failed",JSON.stringify(failed))
    }
  },

  /**
   * 获取失败的数据
   * @returns {V|*}
   */
  get_failed:function () {
    return LocalContractStorage.get("failed")
  },
  /**
   * 重置失败的数据
   */
  reset_failed:function () {
    let from = Blockchain.transaction.from;
    //如果开奖的地址不是设置的地址 抛出异常
    if(from!==LocalContractStorage.get("address")){
      throw new Error("你没有操作权限!")
    }
    LocalContractStorage.set("failed",JSON.stringify([]))
  },

  /**
   * 管理员向失败的账户转账
   * @param address 地址
   * @param value 数量
   * @returns {string}
   */
  try_failed:function (address,value) {
    let from = Blockchain.transaction.from;
    //如果开奖的地址不是设置的地址 抛出异常
    if(from!==LocalContractStorage.get("address")){
      throw new Error("你没有操作权限!")
    }
    let t_result = Blockchain.transfer(address, new BigNumber(value));
    if(!t_result){
      throw new Error("转账失败!")
    }else{
      return "OK"
    }
  },

  /**
   * 开奖
   * @param time 开奖的时间期数
   * @param open_price 比特币的开盘价
   * @param close_price 收盘价
   * @returns {V|*}
   */
  notify: function (time,open_price,close_price) {
    let from = Blockchain.transaction.from;
    let v = this;
    //如果开奖的地址不是设置的地址 抛出异常
    if(from!==LocalContractStorage.get("address")){
      throw new Error("你没有操作权限!")
    }
    //计算下注的场次
    let date = this._formate(new Date(parseInt(time)));
    //获取到这个场次的下注记录
    let record = this.stanza.get(date.getTime());
    //如果下注的场次已经开奖了
    if(record && record.status===1){
      throw new Error("已经通知过了!")
    }
    //如果场次不存在创建并存储
    if(!record){
      record  = new Stanza();
      record.txHash = Blockchain.transaction.hash;
      record.open_price = open_price;
      record.close_price = close_price;
      record.status = 1;
      this.stanza.put(date.getTime(),record);
      return record;
    }
    record.txHash = Blockchain.transaction.hash;
    record.open_price = open_price;
    record.close_price = close_price;

    if(close_price>open_price){ //涨了
      if(record.rise.length ===0 && record.fall.length!==0){ // 如果没有人中奖退款
        record.fall.forEach(function (data) {
          data.get = data.value;
          v._translate(data.address,new BigNumber(data.value));
          record.balance =record.balance-data.value;
        })
      }else if(record.rise.length !==0 && record.fall.length!==0){//如果有人中奖  根据每个压上涨的nas的数量所占的比例  瓜分压压下跌的nas
        //转给管理员0.005 合约流0.005
        let to_admin = new BigNumber(record.fall_amount*0.005);
        this._translate(from,to_admin);
        record.balance = record.balance-to_admin.toNumber()*2;
        //压上涨的人 瓜分剩余的nas
        let reserve = record.fall_amount-to_admin.toNumber()*2;
        record.rise.forEach(function (data) { // 发放奖励
          let toUser = parseInt(data.value) + parseInt(reserve*(data.value/record.rise_amount));
          v._translate(data.address,new BigNumber(toUser));
          data.get = toUser;
          record.balance = record.balance-toUser;
        })
      }else if(record.rise.length !==0 && record.fall.length ===0){
        record.rise.forEach(function (data) {
          data.get = data.value;
          v._translate(data.address,new BigNumber(data.value));
          record.balance =record.balance-data.value;
        })
      }
    }else if(open_price === close_price){ //没有涨跌 退款
      record.fall.forEach(function (data) {
        data.get = data.value;
        v._translate(data.address,new BigNumber(data.value));
        record.balance =record.balance-data.value;
      });
      record.rise.forEach(function (data) {
        data.get = data.value;
        v._translate(data.address,new BigNumber(data.value));
        record.balance =record.balance-data.value;
      })
    }else{ //跌了
      if(record.fall.length === 0 && record.rise.length!==0){ // 如果没有人中奖退款
        record.rise.forEach(function (data) {
          data.get = data.value;
          v._translate(data.address,new BigNumber(data.value));
          record.balance =record.balance-data.value;
        })
      }else if(record.fall.length !== 0 && record.rise.length!==0){ // 发放奖励
        let to_admin = new BigNumber(record.rise_amount*0.005);
        this._translate(from,to_admin);
        record.balance = record.balance-to_admin.toNumber()*2;
        let reserve = record.rise_amount-to_admin.toNumber()*2;
        record.fall.forEach(function (data) { // 发放奖励
          let toUser = parseInt(data.value)+parseInt(reserve*(data.value/record.fall_amount));
          v._translate(data.address,new BigNumber(toUser));
          data.get = toUser;
          record.balance = record.balance-toUser;
        })
      }else if(record.fall.length !== 0 && record.rise.length===0){
        record.fall.forEach(function (data) {
          data.get = data.value;
          v._translate(data.address,new BigNumber(data.value));
          record.balance =record.balance-data.value;
        })
      }
    }
    record.status = 1;
    this.stanza.put(date.getTime(),record);
    let recordData = {};
    recordData.record = record;
    recordData.time = date.getTime();
    return recordData;
  },

  /**
   * 返回时间段内的所有下注记录
   * @param start_time
   * @param end_time
   * @returns {Array}
   */
  allRecord:function (start_time,end_time) {
    let record = [];
    start_time = parseInt(start_time);
    end_time = parseInt(end_time);
    while(start_time<=end_time){
      let date = this._formate(new Date(start_time));
      let data = this.stanza.get(date.getTime());
      let time =  date.getTime();
      if(data){
        let result = {};
        result.time = time;
        result.data = data;
        record.push(result)
      }
      start_time+=60*60*1000;
    }
    return record;
  },

  /**
   * 查询我的下注记录
   * @param page_size 每页的数据量
   * @param page_num 第几页
   * @returns {{}}
   */
  myRecord:function (page_size,page_num) {
    page_size = parseInt(page_size);
    page_num = parseInt(page_num);
    let record = [];
    let address = Blockchain.transaction.from;
    let addressMessage = this.addressMessage.get(address);
    if(addressMessage){
      let start = page_size*(page_num-1);
      let end = start+page_size;
      while(start<end && start<addressMessage.times.length){
        let time = addressMessage.times[start];
        let data = this.stanza.get(time);
        if(data){
          let result = {};
          result.data = data;
          result.time = time;
          record.push(result)
        }
        start+=1;
      }
    }
    let result = {};
    result.record = record;
    result.total = addressMessage.times.length;
    return result
  }
};

module.exports = Application;
