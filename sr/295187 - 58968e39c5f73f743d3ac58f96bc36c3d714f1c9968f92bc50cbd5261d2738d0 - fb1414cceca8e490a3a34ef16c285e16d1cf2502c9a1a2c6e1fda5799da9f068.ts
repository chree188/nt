"use strict";

class TaskPO {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.taskID = obj.taskID || 0;
        this.taskName = obj.taskName;
        this.announcer = obj.announcer;
        this.participant = obj.participant;
        this.taskInfo = obj.taskInfo;
        this.deadline = obj.deadline;
        this.totalMoney = obj.totalMoney;
        this.numOfPeople = obj.numOfPeople;
        this.numOfParticipant = obj.numOfParticipant;
        this.state = obj.state;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class TaskContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userMap"); //存储用户账户，任务ID
        LocalContractStorage.defineMapProperty(this, "participantMap"); //存储用户账户，用户参与的任务ID
        LocalContractStorage.defineMapProperty(this, "tasks", { //存储任务ID，任务
            parse: function (text) {
                return new TaskPO(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    addTask (taskName,taskInfo,deadline,totalMoney,numOfPeople) {
        var index = this.count;
        var announcer = Blockchain.transaction.from;
        // var dictItem = this.repo.get(key);
        // if (dictItem){
        //     throw new Error("value has been occupied");
        // }

        console.warn(announcer);
        console.warn(index);

        var task = new TaskPO();

        task.taskID = index;
        task.taskName = taskName;
        task.announcer = announcer;
        task.participant = "";
        task.taskInfo = taskInfo;
        task.deadline = deadline;
        task.totalMoney = totalMoney;
        task.numOfPeople = parseInt(numOfPeople);
        task.state = "进行中";
        task.numOfParticipant = 0;

        this.tasks.put(index, task);

        var currentTaskID = this.userMap.get(announcer)||[];
        currentTaskID.push(index);

        this.userMap.put(announcer,currentTaskID);
        this.count = new BigNumber(index).plus(1);
    }

    joinTask(taskID){
        // taskID = taskID.trim();
        // if ( taskID === "" ) {
        //     throw new Error("taskID为空！");
        // }

        var wallet = Blockchain.transaction.from
        var task = this.getTaskByID(taskID);
        if(task.state!="进行中"){
            return("任务不在进行中！");
        }
        if(task.numOfPeople == task.numOfParticipant){
            return("任务参与人数已满!");
        }else{
            task.numOfParticipant = new BigNumber(task.numOfParticipant).plus(1);

            task.participant = task.participant + wallet+",";

            this.tasks.push(parseInt(taskID),task)
            this.participantMap.put(wallet,task.participant);
            return("参与成功！");
        }
    }

    getTaskByID (taskID) {

        return this.tasks.get(taskID);
    }

    getTaskByUser () {
        var wallet = Blockchain.transaction.from;
        // var taskIDs = this.userMap.get(wallet);

        var allTasks=this.get(60,0);
        var userTasks=[];
        for(const task of allTasks){
            if(task.announcer == wallet){
                userTasks.push(task);
            }
        }

        if(userTasks==[]){
            console.log("您尚未发布任务！");
        }
        return userTasks;


        // var result  = [];
        // for (const id of taskIDs) {
        //     var task = this.tasks.get(id);
        //     if(task) {
        //         result.push(task);
        //     }
        // }
        // return result
    }

    getUserParticipantTask () {
        var wallet = Blockchain.transaction.from;

        // var tasksID = this.participantMap.get(wallet);
        // var result = [];
        // for(const id of tasksID){
        //     var task = this.tasks.get(id);
        //     if(task){
        //         result.push(task);
        //     }
        // }
        // return result;
        var allTasks=this.get(60,0);
        var userTasks=[];
        for(const task of allTasks){
            if(task.participant.indexOf(wallet)!= -1){
                userTasks.push(task);
            }
        }

        if(userTasks==[]){
            console.log("您尚未参与任务！");
        }
        return userTasks;

    }

    get(limit, offset) {
        var result = [];
        offset = new BigNumber(offset);
        limit = new BigNumber(limit);

        for (var i = offset; i.lessThan(offset.plus(limit)); i = i.plus(1)) {
            var index = i.toNumber();
            var task = this.tasks.get(index);
            if (task) {
                result.push(task);
            }
        }
        return result;
    }
}

module.exports = TaskContract;
