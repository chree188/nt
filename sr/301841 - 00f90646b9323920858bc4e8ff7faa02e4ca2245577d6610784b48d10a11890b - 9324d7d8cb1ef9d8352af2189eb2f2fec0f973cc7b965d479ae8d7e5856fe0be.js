'use strict';

var TwentyOneDaysContract = function () {

    LocalContractStorage.defineProperty(this, "activities", null);
    LocalContractStorage.defineProperty(this, "owner", null);
    LocalContractStorage.defineProperty(this, "developerBalance", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new BigNumber(str);
        }
    });
};

TwentyOneDaysContract.prototype = {
    init: function () {
        this.activities = [];
        this.owner = Blockchain.transaction.from;
        this.developerBalance = new BigNumber(0);
    },
    createActivity: function (title, description, startDate, endDate) {
        if(Blockchain.transaction.value.lt(new BigNumber(100000000000000))){
            throw new Error("Deposit should be greater than 0.0001NAS." + Blockchain.transaction.value);
        }

        if((endDate - startDate) < 86400){
            throw new Error("Activity should last at least one day.");
        }

        if(endDate <= Blockchain.transaction.timestamp){
            throw new Error("End day must be greater than current day.");
        }
 
        var activities = this.activities;
        activities.push({
            index: activities.length,
            creator: Blockchain.transaction.from,
            title: title,
            description: description,
            createDate: Blockchain.transaction.timestamp,
            startDate: startDate,
            endDate: endDate,
            state: 0,   // 0: ongoing, 1: finished and check in all days, 2: failed to check in all days
            balance: Blockchain.transaction.value,
            checkinDays: 0,
            checkinEvents: []
        });
        this.activities = activities;
    },

    checkinActivity: function(activityIndex, description){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }
        
        if(activityIndex < 0 || activityIndex >= this.activities.length){
            throw new Error("Invalid index.");
        }

        if(this.activities[activityIndex].creator !== Blockchain.transaction.from){
            throw new Error("Must be owner of activity.");
        }

        if(this.activities[activityIndex].startDate > Blockchain.transaction.timestamp){
            throw new Error("You can only checkin after activity start.");
        }

        if(this.activities[activityIndex].endDate < Blockchain.transaction.timestamp){
            throw new Error("You can't checkin after activity end.");
        }

        var activities = this.activities;

        activities[activityIndex].checkinEvents.push(
            {
                timestamp: Blockchain.transaction.timestamp,
                description: description,
                tx: Blockchain.transaction.hash
            }
        );

        activities[activityIndex] = this._updateActivityState(activities[activityIndex]);

        this.activities = activities;
    },

    _updateActivityState: function(activity){
        if(activity.state !== 0){
            return activity;
        }
        var activityFinished = false;

        if(activity.checkinEvents.length > 0){
            var lastCheckinTimestamp = activity.checkinEvents[activity.checkinEvents.length - 1].timestamp;
            if((lastCheckinTimestamp >= (activity.endDate - 86400)) && 
                (lastCheckinTimestamp < activity.endDate)){
                activityFinished = true;
            }
        }

        if(Blockchain.transaction.timestamp >= activity.endDate){
            activityFinished = true;
        }

        var validCheckinDays = this._getValidCheckinDays(activity.startDate, activity.endDate, activity.checkinEvents);
        activity.checkinDays = validCheckinDays;
        
        if(activityFinished){            
            var activityPeriod = Math.floor((activity.endDate - activity.startDate) / 86400);
            
            if(validCheckinDays === activityPeriod){
                activity.state = 1;
            }else{
                activity.state = 2;
                activity.balance = new BigNumber(activity.balance);
                var userBalance = activity.balance.times(validCheckinDays).div(activityPeriod).toFixed(0);
                if(userBalance < 0){
                    userBalance = 0;
                }
                if(userBalance > activity.balance){
                    userBalance = activity.balance;
                }
                this.developerBalance = this.developerBalance.plus(activity.balance.minus(userBalance));
                activity.balance = userBalance;
            }           
        }

        return activity;
    },

    _getValidCheckinDays: function(startDate, endDate, checkinEvents){
        var checkinDays = 0;
        var lastCheckinDay = 0;

        for(var i = 0; i < checkinEvents.length; i++){
            var checkinDay = Math.floor((checkinEvents[i].timestamp - startDate) / 86400) + 1;
            if(checkinDay > lastCheckinDay){
                checkinDays++;
                lastCheckinDay = checkinDay;
            }
        }

        return checkinDays;
    },    

    withdrawMyDeposit: function(activityIndex){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }

        if(activityIndex < 0 || activityIndex >= this.activities.length){
            throw new Error("Invalid index.");
        }

        var currentActivity = this.activities[activityIndex];

        if(currentActivity.creator !== Blockchain.transaction.from){
            throw new Error("Must be owner of activity.");
        }

        if(currentActivity.startDate > Blockchain.transaction.timestamp){
            throw new Error("You can only withdraw after activity start.");
        }

        currentActivity.balance = new BigNumber(currentActivity.balance);
        if(currentActivity.balance.eq(new BigNumber(0))){
            throw new Error("No balance to withdraw.");
        }
        
        if(currentActivity.state === 0){
            currentActivity = this._updateActivityState(activities[activityIndex]);
        }

        if(currentActivity.state === 0){
            throw new Error("Withdraw only allowed after activity end.");
        }

        var withdrawBalance = new BigNumber(currentActivity.balance);

        var activities = this.activities;
        activities[activityIndex] = currentActivity;
        this.activities = activities;

        Blockchain.transfer(Blockchain.transaction.from, withdrawBalance);
    },

    withdrawDeveloperBonus: function(){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }

        if(Blockchain.transaction.from !== this.owner){
            throw new Error("Only contract owner can do this.");
        }

        if(this.developerBalance.eq(new BigNumber(0))){
            throw new Error("No balance yet.");
        }

        var withdrawBalance = this.developerBalance;
        this.developerBalance = new BigNumber(0);
        Blockchain.transfer(Blockchain.transaction.from, withdrawBalance);
    },

    updateAllActivityState: function(){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }

        if(Blockchain.transaction.from !== this.owner){
            throw new Error("Only contract owner can update other activity status.");
        }

        var activities = this.activities;
        for(var i = 0; i < activities.length; i++){
            var activity = this._updateActivityState(activities[i]);
            activities[i] = activity;
        }

        this.activities = activities;
    },

    checkDeveloperBonus: function(){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }

        if(Blockchain.transaction.from !== this.owner){
            throw new Error("Only contract owner can do this.");
        }
        return this.developerBalance;
    },

    getAllActivities: function(){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }

        return this.activities;
    },

    getUserActivities: function(){
        if(Blockchain.transaction.value.gt(new BigNumber(0))){
            throw new Error("Don't send any NAS when check in.");
        }

        var userActivities = [];
        for(var i = 0; i < this.activities.length; i++){
            if(this.activities[i].creator === Blockchain.transaction.from){
                userActivities.push(this.activities[i]);
            }
        }
        return userActivities;
    }

};
module.exports = TwentyOneDaysContract;