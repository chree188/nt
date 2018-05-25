'use strict';

//任务状态
const TaskStatus = {
  OPEN: 0,
  PROCESSING: 1,
  CANCELLED: 2,
  COMPLETED: 3
}

Object.freeze(TaskStatus);
//任务详情
var Task = function (text) {
  if (text) {
    obj = JSON.parse(text);
    this.id = obj.id;
    this.reward = obj.reward;
    this.ownerDeposit = obj.ownerDeposit;
    this.workerDeposit = obj.workerDeposit;
    this.title = obj.title;
    this.content = obj.content;
    this.status = obj.status;
    this.owner = obj.owner;
    this.worker = obj.worker;
  }else{
    this.id = "";
    this.reward = "0";
    this.ownerDeposit = "0";
    this.workerDeposit = "0";    
    this.title = "";
    this.content = "";
    this.status = "";    
    this.owner = "";
    this.worker = "";    
  }
}

Task.prototype = {
  toString: function () {
		return JSON.stringify(this);
	}
}

var RewardTask = function () {
  // 管理员
  LocalContractStorage.defineProperty(this, "owner");
  // 暂停标志
  LocalContractStorage.defineProperty(this, "isPause");
  // 发布人押金比例
  LocalContractStorage.defineProperty(this, "releaseDeposit"); 
  // 接受人押金比例
  LocalContractStorage.defineProperty(this, "receiveDeposit");
  // 系统佣金比例
  LocalContractStorage.defineProperty(this, "tax");
  // 任务计数器
  LocalContractStorage.defineProperty(this, "taskCount");  
  // 任务列表
  LocalContractStorage.defineMapProperty(this, "taskList");
}

RewardTask.prototype = {
  init: function () {
    //系统初始化
    this.owner = Blockchain.transaction.from;
    this.isPause = false;
    this.releaseDeposit = 0.2;
    this.receiveDeposit = 0.2;
    this.tax = 0.1;
    this.taskCount = 0;
  },
  /**
   * @dev 发布任务
   */
  release: function (title,content,reward) {
    //必须是未暂停状态
    this._notPause();
    var value = Blockchain.transaction.value;
    var from = Blockchain.transaction.from;
    var reward_b = new BigNumber(reward);
    var ownerDeposit = value.sub(reward_b);
    // 支付金额不等于零，支付金额不能小于任务奖金，任务押金不能小于指定比例
    if(value.eq(0) || 
      value.lt(reward_b) ||
      ownerDeposit.lt(reward_b.mul(this.releaseDeposit))){
      throw "less value";
    }
    // 记录新的任务
    this.taskCount++;
    var task = new Task();
    task.id = this.taskCount;
    task.title = title;
    task.content = content;
    task.reward = reward;
    task.ownerDeposit = ownerDeposit.toString();
    task.status = TaskStatus.OPEN;
    task.owner = from;
    this.taskList.set(this.taskCount,task);
  },
  /**
   * @dev 接受任务
   */
  receive: function (id) {
    //必须是未暂停状态
    this._notPause();
    var value = Blockchain.transaction.value;
    var from = Blockchain.transaction.from;    
    var task = this.taskList.get(id);
    // 任务id存在，并且任务状态是OPEN，任务接受人不能是任务发布人
    if(!task ||
      task.status !== TaskStatus.OPEN ||
      task.owner == from){
      throw "task status error";      
    }
    // 支付金额不能小于任务押金比例
    var reward_b = new BigNumber(task.reward);
    if(value.lt(reward_b.mul(this.receiveDeposit))){
      throw "less value";     
    }
    // 更改任务状态
    task.status = TaskStatus.PROCESSING;
    task.worker = from;
    task.workerDeposit = value.toString();
    this.taskList.set(id,task);
  },
  /**
   * @dev 取消任务
   */  
  cancel: function (id) {
    // 必须是未暂停状态
    this._notPause();
    // 不允许支付
    this._unpayable();    
    var from = Blockchain.transaction.from;    
    var task = this.taskList.get(id);
    // 任务id存在,任务状态是OPEN,交易发起账户必须是任务owner
    if(!task ||
      task.status !== TaskStatus.OPEN ||
      task.owner !== from){
      throw "task status error";      
    }
    // 更改任务状态
    task.status = TaskStatus.CANCELLED;
    this.taskList.set(id,task);
    var reward_b = new BigNumber(task.reward);
    // 向系统owner发送系统佣金 系统佣金=任务奖金*系统税率    
    var commission = reward_b.mul(this.tax);
    Blockchain.transfer(this.owner,commission);
    // 向任务owner退还押金 押金=任务奖金*发布人押金比例
    var ownerDeposit_b = new BigNumber(task.ownerDeposit);
    Blockchain.transfer(task.owner,ownerDeposit_b);
    // 向任务owner退还赏金剩余部分 剩余部分=任务奖金-系统佣金
    var refund = reward_b.sub(commission);
    Blockchain.transfer(task.owner,refund);

  },
  /**
   * @dev 完成任务
   */
  complete: function (id) {
    // 必须是未暂停状态
    this._notPause();
    // 不允许支付
    this._unpayable();    
    var from = Blockchain.transaction.from;    
    var task = this.taskList.get(id);
    // 任务id存在,任务状态是PROCESSING,交易发起账户必须是任务发布人
    if(!task ||
      task.status !== TaskStatus.PROCESSING ||
      task.owner !== from){
      throw "task status error";      
    }
    // 更改任务状态
    task.status = TaskStatus.COMPLETED;
    this.taskList.set(id,task);
    var reward_b = new BigNumber(task.reward);
    // 向系统owner发送系统佣金 系统佣金=任务奖金*系统税率    
    var commission = reward_b.mul(this.tax);
    Blockchain.transfer(this.owner,commission);
    // 向任务发布人退还押金 押金=任务奖金*发布人押金比例
    var ownerDeposit_b = new BigNumber(task.ownerDeposit);
    Blockchain.transfer(task.owner,ownerDeposit_b);
    // 向任务接受人退还押金 押金=任务奖金*接受人押金比例
    var workerDeposit_b = new BigNumber(task.workerDeposit);
    Blockchain.transfer(task.worker,workerDeposit_b);  
    // 向任务接受人发送赏金剩余部分 剩余部分=任务奖金-系统佣金
    var refund = reward_b.sub(commission);
    Blockchain.transfer(task.worker,refund);

  },
  /**
   * 任务列表
   */
  tasks: function (){
    var result = {"taskList":[]};
    for(var i=1;i<=this.taskCount;i++){
      var item = this.taskList.get(i);
      result.taskList.push(item);
    }
    return JSON.stringify(result);    
  },
  /**
   * 获取任务详情
   */
  task: function (id){
    var task = this.taskList.get(id);
    // 任务id存在
    if(!task){
      throw "task id error";      
    }
    var result = {"task":task};
    return JSON.stringify(result);    
  },
  info: function () {
    //系统状态信息，仅owner
    this._onlyOwner();
    var result = {
      "isPause":this.isPause,
      "owner":this.owner,
      "releaseDeposit":this.releaseDeposit,
      "receiveDeposit":this.receiveDeposit,
      "tax":this.tax,
      "taskCount":this.buyCount
    };
    return JSON.stringify(result);
  },
  pause: function(){
    //系统暂停，仅owner
    this._onlyOwner();
    this.isPause = true;
  },
  unpause: function(){
    //取消系统暂停，仅owner
    this._onlyOwner();
    this.isPause = false;
  },
  _onlyOwner: function(){
    //必须owner
    if(this.owner !== Blockchain.transaction.from){
      throw "require owner";
    }
  },
  _notPause: function() {
    //必须未暂停状态
    if(this.isPause == true){
      throw "require not pause";
    }
  },
  _unpayable: function() {
    if(Blockchain.transaction.value.gt(0)){
      throw "unpayable";
    }
  }
}

module.exports = RewardTask;