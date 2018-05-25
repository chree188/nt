"use strict";

var taskContract = function () {
    LocalContractStorage.defineMapProperty(this, "completedStorage", {
        parse: function (text) {
          return new completedHolder(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "taskStorage", {
        parse: function (text) {
          return new taskHolder(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

var completedHolder = function(text){
  if(text){
    var o = JSON.parse(text);
    this.answers = o.answers; //array of answers
  }else{
    this.answers = [];
  }
}

completedHolder.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
}

var taskHolder = function(text){
  if(text){
    var o  = JSON.parse(text);
    this.tasks = o.tasks;
  }else{
    this.tasks = {};
  }
}

taskHolder.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

taskContract.prototype = {
  init: function(){
    var taskList = new taskHolder();
    taskList.tasks = {};
    this.taskStorage.put('taskList',taskList);
  },
  acceptAnswer:function(taskId,answerId){
    var sendingAddress = Blockchain.transaction.from;

    if(!taskId || !answerId){
      throw new Error('taskId or answerId is missing');
    }

    var existingTasks = this.taskStorage.get('taskList').tasks;
    var existingFound = false;
    var alreadyCompleted = false;
    if(!existingTasks[taskId]){
      throw new Error('Task was not found.');
    }

    /*var existingAnswers = this.completedStorage.get(taskId).answers;
    var answerFound = false;
    for(var i = 0; i < existingAnswers.length; i++){
      var test_answerId = existingAnswers[i].answerId;
      if(test_answerId === answerId){
        answerFound = true;
      }
    }

    if(!answerFound){
      throw new Error('Answer not found to belong to this task.');
    }*/

    var existingTask = existingTasks[taskId];
    if(existingTask.taskCompleted){
      throw new Error('Existing task was already marked as completed');
    }

    if(existingTask.authorAddress === sendingAddress){
    }else{
      throw new Error('Sending address does not match author address of task');
    }

    var bounty = new BigNumber(existingTask.bounty);
    existingTask.taskCompleted = true;
    existingTask.completedBy = answerId;
    existingTasks[taskId] = existingTask;

    var updatedTasks = new taskHolder();
    updatedTasks.tasks = existingTasks;
    this.taskStorage.put('taskList',updatedTasks);

    var existingAnswers = this.completedStorage.get(taskId).answers;

    var winner = '';
    for(var i = 0; i < existingAnswers.length; i++){
      var answer = existingAnswers[i];
      var answerId_found = answer.answerId;
      if(answerId === answerId_found){
        winner = answer.submitterAddress;
        break;
      }
    }

    if(!winner.length){
      throw new Error('Answer not found to belong to this task.');
    }

    var result = Blockchain.transfer(winner, bounty);
    if (!result) {
      throw new Error("transfer failed.");
    }

    Event.Trigger("BankVault", {
      Transfer: {
        from: Blockchain.transaction.to,
        to: winner,
        value: bounty.toString()
      }
    });
  },
  submitAnswer:function(taskId,answer){
    var sendingAddress = Blockchain.transaction.from;

    if(!taskId || !answer){
      throw new Error('Missing taskId or answer');
    }

    var timeStamp = Date.now();
    var taskId = taskId.trim();
    var answer = answer.trim();

    var existingTasks = this.taskStorage.get('taskList').tasks;

    if(!existingTasks[taskId]){
      throw new Error('Task was not found.');
    }

    var existingTask = existingTasks[taskId];
    if(existingTask.taskCompleted){
      throw new Error('Existing task was already marked as completed');
    }

    var answerId = guid();
    var existingAnswers = this.completedStorage.get(taskId).answers;
    existingAnswers.push({
      taskId: taskId,
      answerId:answerId,
      submitterAddress:sendingAddress,
      answer:answer,
    });

    var updatedAnswers = new completedHolder();
    updatedAnswers.answers = existingAnswers;
    this.completedStorage.put(taskId,updatedAnswers);
  },
  postTask:function(title,authorName,body){
    var sendingAddress = Blockchain.transaction.from;
    var value = Blockchain.transaction.value;

    if(!title || !authorName || !body || !value){
      throw new Error("Missing title, authorname, body, or value");
    }

    /*if(title.length > 30 || authorName.length > 30 || body > 500){}*/

    var timeStamp = Date.now();
    var bounty = new BigNumber(value);

    var title = title.trim();
    var authorName = authorName.trim();
    var body = body.trim();

    var taskId = guid();
    var authorAddress = sendingAddress;
    var taskCompleted = false;

    var taskObj = {
      title:title,
      bounty:bounty,
      timeStamp:timeStamp,
      authorName:authorName,
      authorAddress:authorAddress,
      body:body,
      taskId:taskId,
      taskCompleted:taskCompleted,
      completedTime:0,
      completedBy: 'none',
    }

    var kill = false;
    var existingCount = 0;
    var existingTasks = this.taskStorage.get('taskList');

    var taskIds = Object.keys(existingTasks);
    for(var i = 0; i < taskIds.length; i++){
      var existingId = taskIds[i];
      var existingTask = existingTasks[existingId];
      var existingCreator = existingTask.authorAddress;
      if(existingCreator === authorAddress && !existingTask.taskCompleted){
        existingCount++;
      }
    }

    if(existingCount > 0){
      throw new Error("Too many open tasks");
    }

    var updatedTasks = new taskHolder();
    existingTasks.tasks[taskId] = taskObj;
    updatedTasks = existingTasks;

    this.taskStorage.put('taskList',updatedTasks);

    var newAnswerArray = new completedHolder();
    newAnswerArray.answers = [];
    this.completedStorage.put(taskId,newAnswerArray);
  },
  getTasks:function(){
    var sendingAddress = Blockchain.transaction.from;
    return{
      sendingAddress: sendingAddress,
      tasks: this.taskStorage.get('taskList'),
      answers:this.completedStorage,
      name:'getTasks',
    }
  },
  getAnswers:function(taskId){
    var sendingAddress = Blockchain.transaction.from;

    var answers = [];

    if(this.completedStorage.get(taskId)){
      answers = this.completedStorage.get(taskId).answers;
    }

    return{
      taskId:taskId,
      sendingAddress:sendingAddress,
      answers: answers,
      name:'getAnswers',
    }
  }
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = taskContract;
