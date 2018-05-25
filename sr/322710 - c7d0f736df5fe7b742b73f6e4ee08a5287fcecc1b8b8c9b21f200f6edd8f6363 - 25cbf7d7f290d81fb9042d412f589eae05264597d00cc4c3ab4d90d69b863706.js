"use strict";

var Util = {
    extend: function extend (object) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, source; source = args[i]; i++) {
            if (!source) continue;
            for (var property in source) {
                object[property] = source[property];
            }
        }
        return object;
    },
    now: function () {
        return Blockchain.transaction.timestamp * 1000;
    },
    isString: function (text){
        return typeof text === 'string';
    }
};

var Resume = function(text) {
    var defaultData = {
        id:'',
        name: '',
        job: '',
        slogon: '',
        email:'',
        skills: [],
        projects:[],
        education:[],
        awards :[]
    };
    Util.extend(this, text ? ( Util.isString(text) ? JSON.parse(text): text ) : defaultData);
};

Resume.prototype.toString = function () {
    return JSON.stringify(this);
};

function Generator() {

    LocalContractStorage.defineMapProperty(this, "resumes", {
        parse: function (text) {
            return new Resume(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

Generator.prototype.init = function () {
    this.size = 0;
};

Generator.prototype.resume = function (id) {
    return this.resumes.get(id);
};

Generator.prototype.create = function (text) {
    var index = this.size;
    var resume = new Resume(text);
    var from = Blockchain.transaction.from;
    // resume.id = from+'_'+index;
    resume.id = from;
    this.resumes.put(resume.id, resume);
    this.size = this.size + 1;
    return resume;
};

module.exports = Generator;
