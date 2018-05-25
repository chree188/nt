'use strict';

// 写信的数据结构
var EmailInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nickName = obj.nickName;
        this.day = obj.day;
        this.content = obj.content;
    } else {
        // 昵称
        this.nickName = "";
        // 日期(yyyy-MM-dd)
        this.day = "";
        // 内容
        this.content = "";
    }
}

EmailInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var EmailContract = function() {
    // 邮件数量
    LocalContractStorage.defineProperty(this, "emailCount");
    // 存放所有邮件
    LocalContractStorage.defineMapProperty(this, "emailPool", {
        parse: function(jsonText) {
            return new EmailInfo(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
}

EmailContract.prototype = {
    init: function() {
        this.emailCount = 0;
        // var emailInfo = new EmailInfo();
        // emailInfo.nickName = "admin";
        // emailInfo.day = "此条没有日期";
        // emailInfo.content = "努力，不是为了要感动谁，也不是要做给哪个人看，而是要让自己随时有能力跳出自己厌恶的圈子，并拥有选择的权利。";
        // this.emailPool.put(1, emailInfo);
        // emailInfo.content = "无论你今天要面对什么，既然走到了这一步，就坚持下去，给自己一些肯定，你比自己想象中要坚强。";
        // this.emailPool.put(2, emailInfo);
        // emailInfo.content = "在渴望被爱的同时,也能爱别人.活成自己喜欢的样子。";
        // this.emailPool.put(3, emailInfo);
    },
    writeEamil: function(nickName, day, content) {
        var emailInfo = new EmailInfo();
        emailInfo.nickName = nickName;
        emailInfo.day = day;
        emailInfo.content = content;
        var count = this.emailCount + 1
        this.emailCount++;
        this.emailPool.put(this.emailCount, emailInfo);
        return this.emailCount;
    },
    // 每次展示4页
    getEamil: function(offset) {
        var limit = 4;
        var start = offset * limit + 1;
        var end = offset * limit + limit;
        if (end > this.emailCount) {
            end = this.emailCount;
        }
        var result = "[";
        for (var i = start; i <= end; i++) {
            var object = this.emailPool.get(i);
            result += object;
            if (i != end) {
                result += ","
            }
        }
        result += "]";
        return result;
    },
    getCount: function() {
    	return this.emailCount;
    }
};
module.exports = EmailContract;