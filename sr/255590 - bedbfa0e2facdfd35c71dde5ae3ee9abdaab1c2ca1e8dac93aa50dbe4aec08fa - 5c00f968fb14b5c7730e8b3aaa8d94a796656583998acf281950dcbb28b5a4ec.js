"use strict";

var Project = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.title = obj.title;
        this.description = obj.description;
        this.image = obj.image;
        this.deadline = obj.deadline;
        this.total = obj.total;
        this.userId = obj.userId;
        this.supportList = obj.supportList;
    } else {
        this.id = 0;
        this.title = "";
        this.description = "";
        this.image = "";
        this.deadline = "";
        this.total = 0;
        this.userId = 0;
        this.supportList = [];
    }
};

Project.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ProjectDatabase = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Project(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ProjectDatabase.prototype = {
    init: function () {

    },
    addProject: function (project) {
        var projectInfo = JSON.parse(project);
        if (projectInfo == null) {
            throw new Error("projectInfo can not empty");
        } else if (projectInfo.id == 0) {
            throw new Error("id can not empty");
        }
        var result = this.repo.get(projectInfo.id.toString());
        if (result) {
            throw new Error("project exists");
        }
        this.repo.put(projectInfo.id.toString(), projectInfo);
    },
    getProject: function (id) {
        if (id === "") {
            throw new Error("id can not empty");
        }
        return this.repo.get(id.toString());
    },
    addSupport: function (projectId, supportInfo) {
        var support = JSON.parse(supportInfo);
        if (support == null) {
            throw new Error("support can not empty");
        } else if (support.id == "") {
            throw new Error("support id can not empty");
        }
        var project = this.repo.get(projectInfo.id);
        if (project) {
            throw new Error("project exists");
        }
        project.supportList.push(support);
        this.repo.put(project.id, project);
    }
};
module.exports = ProjectDatabase;