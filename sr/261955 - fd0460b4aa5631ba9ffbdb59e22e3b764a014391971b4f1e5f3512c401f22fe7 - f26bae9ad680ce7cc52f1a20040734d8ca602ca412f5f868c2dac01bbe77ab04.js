"use strict";

var JobItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.date = obj.date;
        this.company = obj.company;
        this.author = obj.author;
    } else {
        this.key = "";
        this.author = "";
        this.value = "";
        this.date = "";
        this.company = "";
    }
};

JobItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var Job = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new JobItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Job.prototype = {
    init: function () {
    },
    save: function (key, value, company, date) {
        var from = Blockchain.transaction.from;
        var jobItem = this.repo.get(key);
        if (jobItem) {
            //throw new Error("value has been occupied");
            jobItem.value = JSON.parse(jobItem).value + '|-' + value;
            jobItem.author = JSON.parse(jobItem).author + '|-' + from;
            jobItem.company = JSON.parse(jobItem).company + '|-' + company;
            jobItem.date = JSON.parse(jobItem).date + '|-' + date;
            this.repo.put(key, jobItem);

        } else {
            jobItem = new JobItem();
            jobItem.author = from;
            jobItem.key = key;
            jobItem.value = value;
            jobItem.company = company;
            jobItem.date = date;
            this.repo.put(key, jobItem);
        }
    },
    get: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Job;