"use strict";

// DailyLog
var DailyLog = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.index = obj.index;
        this.author = obj.author;
        this.measuretime = obj.measuretime;
        this.weight = obj.weight;
        this.fat = obj.fat;
        this.muscle = obj.muscle;
        this.visceralFat = obj.visceralFat;
        this.protein = obj.protein;
        this.moisture = obj.moisture;
        this.boneMass = obj.boneMass;
    } else {
        this.index = "";
        this.author = "";
        this.measuretime = "";
        this.weight = "";
        this.fat = "";
        this.muscle = "";
        this.visceralFat = "";
        this.protein = "";
        this.moisture = "";
        this.boneMass = "";
    }
};

DailyLog.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// Recorder
var Recorder = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.sex = obj.sex;
        this.height = obj.height;
        this.introduction = obj.introduction;
        this.logs = obj.logs;
    } else {
        this.name = "";
        this.sex = "";
        this.height = "";
        this.introduction = "";
        this.logs = [];
    }
};

Recorder.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var HealthManager = function () {
    LocalContractStorage.defineMapProperty(this, "log", {
        parse: function (text) {
            return new DailyLog(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "recorder", {
        parse: function (text) {
            return new Recorder(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "index");
};

HealthManager.prototype = {
    init: function () {
        // init index
        this.index = 0;
    },

    readIndex: function () {
        return this.index;
    },

    setRecorder: function (_name, _sex, _height, _introduction) {

        var name = _name.trim();
        if (name === "") {
            throw new Error("name needed.");
        }

        var sex = _sex.trim();
        if (sex !== "female" && sex !== "male") {
            throw new Error("please input correct sex.");
        }

        var height = parseFloat(_height);
        if (!height || height <= 0) {
            throw new Error("please input correct height.");
        }

        var introduction = _introduction.trim();

        var from = Blockchain.transaction.from;
        var recorder = this.recorder.get(from);

        if (!recorder) {
            recorder = new Recorder();
            recorder.logs = [];
        }

        recorder.name = name;
        recorder.sex = sex;
        recorder.height = height;
        recorder.introduction = introduction;

        this.recorder.put(from, recorder);
    },

    readRecorder: function () {
        var from = Blockchain.transaction.from;
        return this.recorder.get(from);
    },

    saveLog: function (_weight, _fat, _muscle, _visceralFat, _protein, _moisture, _boneMass) {

        var weight = parseFloat(_weight);
        if (!weight || weight <= 0) {
            throw new Error("please input correct weight.");
        }
        var fat = parseFloat(_fat);
        var muscle = parseFloat(_muscle);
        var visceralFat = parseFloat(_visceralFat);
        var protein = parseFloat(_protein);
        var moisture = parseFloat(_moisture);
        var boneMass = parseFloat(_boneMass);

        var logItem = new DailyLog();
        var from = Blockchain.transaction.from;
        var time = Blockchain.transaction.timestamp;

        this.index += 1;

        logItem.index = this.index;
        logItem.author = from;
        logItem.measuretime = time;
        logItem.weight = weight;
        logItem.fat = fat;
        logItem.muscle = muscle;
        logItem.visceralFat = visceralFat;
        logItem.protein = protein;
        logItem.moisture = moisture;
        logItem.boneMass = boneMass;

        this.log.put(this.index.toString(), logItem);

        var recorder = this.recorder.get(from);

        if (!recorder) {
            recorder = new Recorder();
        }

        recorder.logs.push(this.index.toString());

        this.recorder.put(from, recorder);

    },

    readSpeLog: function (_index) {
        return this.log.get(_index);
    },

    // return all the logs of a specific recorder
    readLog: function () {
        var result = [];

        var from = Blockchain.transaction.from;
        var recorder = this.recorder.get(from);

        if (!recorder) {
            throw new Error("creat a log first.");
        }

        var temLog;
        var logs = recorder.logs;

        for (var i = 0, len = logs.length; i < len; i++) {
            temLog = this.log.get(logs[i]);
            result.push(temLog);
        }

        return result;
    }

};
module.exports = HealthManager;