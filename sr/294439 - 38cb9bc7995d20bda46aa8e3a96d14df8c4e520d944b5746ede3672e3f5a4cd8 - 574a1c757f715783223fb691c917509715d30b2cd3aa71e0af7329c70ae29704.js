"use strict";

var ProjItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.desc = obj.desc;
    } else {
        this.name = "";
        this.desc = "";
    }
    this.topUser = {
        1: {
            userName: "none",
            score:0,
        },
        2: {
            userName: "none",
            score: 0,
        },
        3: {
            userName: "none",
            score: 0,
        },
    }
    this.allUser = {};
};

function rnd(min, max) {
    var tmp = min;
    if (max < min) {
        min = max;
        max = tmp;
    }
    return parseInt(Math.random() * (max - min + 1) + min);
}

ProjItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    getScore: function (userName) {
        if (this.allUser.hasOwnProperty(userName)) {
            return this.allUser[userName];
        } else {
            return null;
        }
    },
    setScore: function (userName) {
        if (!this.allUser.hasOwnProperty(userName)) {
            var score = rnd(0, 100);
            this.allUser[userName] = score;
            this.setTopScore(userName, score);
        }
    },
    setTopScore: function (userName, score) {
        if (score >= this.topUser[1].score) {
            this.topUser[3] = this.topUser[2];
            this.topUser[2] = this.topUser[1];
            this.topUser[1] = {
                userName: userName,
                score: score,
            }
        } else if (score >= this.topUser[2].score) {
            this.topUser[3] = this.topUser[2];
            this.topUser[2] = {
                userName: userName,
                score: score,
            }
        } else if (score >= this.topUser[3].score) {
            this.topUser[3] = {
                userName: userName,
                score: score,
            }
        }
    }
}

var allProjItem = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
    LocalContractStorage.defineMapProperty(this, "repo2");
};

allProjItem.prototype = {
    init: function () {
        // todo
    },

    getAll: function () {
        var ret = {
            meta: {
                status: true,
                msg: "cnnn33"
            }
        };
        var obj2 = this.repo2.get("allKey");
        ret.data = [];

        for (var i = 0; i < obj2.length; ++i) {
            var name = obj2[i];
            var item = this.repo.get(name);
            if (item != null) {
                var info = {
                    name: item.name,
                    desc: item.desc,
                    topUser: item.topUser
                };
                ret.data.push(info);
            }
        }
        return ret;
    },

    create: function (key, value) {
        var ret = {
            meta: {
                status: false,
                msg: ""
            }
        };
        key = key.trim();
        value = value.trim();
        if (key === "" || value === "") {
            ret.meta.msg = "error";
            return ret;
        }
        if (value.length > 1024 || key.length > 64) {
            ret.meta.msg = "key / value exceed limit length";
            return ret;
        }

        var projItem = this.repo.get(key);
        if (projItem) {
            ret.meta.msg = "project has been created";
            return ret;
        }

        projItem = new ProjItem();
        projItem.name = key;
        projItem.desc = value;

        this.repo.put(key, projItem);
        var allName = this.repo2.get("allKey");
        if (allName === null || allName === "") {
            allName = [];
        }
        allName.push(key);
        this.repo2.put("allKey", allName);
        ret.meta.status = true;
        return ret;
    },

    getScore: function (name, userName) {
        var ret = {
            meta: {
                status: false,
                msg: ""
            }
        };
        name = name.trim();
        userName = userName.trim();
        if (name === "" || userName === "") {
            ret.meta.msg = "key / value error";
            return ret;
        }
        var project = this.repo.get(name);
        if (project === null) {
            ret.meta.msg = "no project has been :" + name;
            return ret;
        }
        var projectObj=new ProjItem();
        projectObj.name = project.name;
        projectObj.desc = project.desc;
        projectObj.topUser = project.topUser;
        projectObj.allUser = project.allUser;

        var score = projectObj.getScore(userName);
        if (score === null) {
            ret.meta.msg = "no score ,Are you want roll it?";
            return ret;
        } else {
            ret.meta.status = true;
            ret.meta.data = score;
            return ret;
        }
    },

    setScore: function (name, userName) {
        var ret = {
            meta: {
                status: false,
                msg: ""
            }
        };
        name = name.trim();
        userName = userName.trim();
        if (name === "" || userName === "") {
            ret.meta.msg = "key / value error";
            return ret;
        }
        var project = this.repo.get(name);
        if (project === null) {
            ret.meta.msg = "no project has been: "+name;
            return ret;
        }
        var projectObj=new ProjItem();
        projectObj.name = project.name;
        projectObj.desc = project.desc;
        projectObj.topUser = project.topUser;
        projectObj.allUser = project.allUser;
        var score = projectObj.getScore(userName);

        if (score !== null) {
            ret.meta.msg = "you has roll it";
            return ret;
        } else {
            projectObj.setScore(userName);
            this.repo.put(name, projectObj);
            ret.meta.status = true;
            return ret;
        }
    }
};
module.exports = allProjItem;

