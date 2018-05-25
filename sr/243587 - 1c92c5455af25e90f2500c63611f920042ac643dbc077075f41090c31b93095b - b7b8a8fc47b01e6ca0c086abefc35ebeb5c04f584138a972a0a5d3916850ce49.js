"use strict";

var getRandomNum= function (Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}

var getRandomArrayElements = function (arr, count) {
    var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

var randArr = function (startNum, endNUm) {
    var numArr = [];
    for( startNum; startNum <= endNUm; startNum++ ){
        numArr.push(startNum);
    }
    return numArr;
}

var SubjectItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key; //题目
        this.title = obj.title; //题目
        this.opts = obj.opts; //选项{"A":"对", "B":"错"}
        this.rightOpt = obj.rightOpt; //正确答案
        this.author = obj.author; //创建题目的星云地址
    } else {
        this.key = 0;
        this.title = ""; //题目
        this.opts = ""; //选项{"A":"对", "B":"错"}
        this.rightOpt = ""; //正确答案
        this.author = ""; //创建题目的星云地址
    }
};

SubjectItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var SubjectContract = function () {
    LocalContractStorage.defineProperty(this, "subjectNum"); //题目总数量
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new SubjectItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

SubjectContract.prototype = {
    init: function () {
        this.subjectNum = 0;
    },
    //新增题目
    addSubject:function ( title, opts, rightOpt ) {
        title  = title.trim();
        rightOpt = rightOpt.trim();
        opts     = JSON.parse(opts);
        var from = Blockchain.transaction.from;

        var subject = new SubjectItem();
        subject.key = this.subjectNum;
        subject.title = title;
        subject.opts = opts;
        subject.rightOpt = rightOpt;
        subject.author = from;
        this.repo.put(this.subjectNum,subject);
        this.subjectNum += 1;
    },
    //获取num条题目
    getSubjects: function( num ){
        num = parseInt(num.trim());
        if( num <=0 || num > 100 ){
            throw new Error('题目数量必须在1-100之间');
        }
        if( num > this.subjectNum ){
            num = this.subjectNum;
        }
        var startNum = this.subjectNum - (num*getRandomNum(3,10));
        if( startNum < 0 ){
            startNum = 0;
        }
        var endNum = startNum + num*2;
        if( endNum >= this.subjectNum ){
            endNum = this.subjectNum - 1;
        }
        var rarr = randArr( startNum, endNum );
        var indexArr = getRandomArrayElements(  rarr, num );
        var length = indexArr.length;
        var rs = [];
        for( var i=0; i<length; i++ ){
            var item = this.repo.get(indexArr[i]);
            item.rightOpt = '*';
            rs.push( item );
        }
        return rs;
    },
    //批阅答卷
    checkSubjects:function (answers) {
        answers = JSON.parse(answers);
        var rs = [];
        var len = answers.length;
        var ans = {};
        for( var i=0; i<len; i++ ){
            ans = this.repo.get(answers[i].key);
            if( ans.rightOpt == answers[i].choseOpt ){
                //答对
                rs.push({
                    "key" : answers[i].key,
                    "rightOpt" : ans.rightOpt,
                    "isRight": 1 //是否答对 1=答对
                });
            }else{
                rs.push({
                    "key" : answers[i].key,
                    "rightOpt" : ans.rightOpt,
                    "isRight"  : 0
                });
            }
        }

        return rs;
    },
    //获取题库题目数量
    getSubjectNum:function () {
        return this.subjectNum;
    }
};
module.exports = SubjectContract;