"use strict";

var Task = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.work = obj.work;
        this.schedule = obj.schedule;
        this.info = obj.info;
        this.time = obj.time;
    } else {
        this.work = "";
        this.schedule = "";
        this.info = "";
        this.time = "";
    }

}

Task.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Tasks = function() {
    LocalContractStorage.defineMapProperty(this, "data");
};

Tasks.prototype = {
    init: function() {

    },

    add: function(work, schedule, info, time) {
        var user = Blockchain.transaction.from;

        var newTasks = [];

        var task = new Task();
        task.work = work;
        task.schedule = schedule;
        task.info = info;
        task.time = time;

        var oldTasks = this.data.get(user);
        if (oldTasks == null) {
            newTasks.push(task);
        } else {
            newTasks = JSON.parse(oldTasks);
            newTasks.push(task);
        }

        this.data.put(user, JSON.stringify(newTasks));
    },

  del: function(index){
    var user = Blockchain.transaction.from;
    var oldTasks = this.data.get(user);
    var newTasks = JSON.parse(oldTasks);
    newTasks.splice(index, 1);
        this.data.put(user, JSON.stringify(newTasks));

  },
  
  change:function(index, work, schedule, info, time){
    var user = Blockchain.transaction.from;
    var oldTasks = this.data.get(user);
    var newTasks = JSON.parse(oldTasks);
    newTasks[index].work = work;
    newTasks[index].schedule = schedule;
    newTasks[index].info = info;
    newTasks[index].time = time;
    this.data.put(user, JSON.stringify(newTasks));
  },


    get: function() {
        var user = Blockchain.transaction.from;
        return this.data.get(user);
    }

}

module.exports = Tasks;