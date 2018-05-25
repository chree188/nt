'use strict';

var StoreNote = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.notes = obj.notes;
        this.partnerAddress = obj.partnerAddress;
        this.pendingPartner = obj.pendingPartner;
        this.incomingPartner = obj.incomingPartner;
    } else {
        this.notes = "";
        // your final partner
        this.partnerAddress = "";
        // your partner address sent out and wait for response
        this.pendingPartner = "";
        // people send partner request with you
        this.incomingPartner = "";
    }
};

StoreNote.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DiaryContract = function () {
    LocalContractStorage.defineMapProperty(this, "diary", {
        parse: function (text) {
            return new StoreNote(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DiaryContract.prototype = {
    init: function () {
    },

    save: function (content) {
        var from = Blockchain.transaction.from;
        var storeNote;
        if (content === "") {storeNote= new StoreNote(); storeNote.notes = ""; }
        else{storeNote= this.diary.get(from); if(storeNote == null){storeNote= new StoreNote(); storeNote.notes = "";}
        else{storeNote.notes = storeNote.notes + "|" + content;}} this.diary.put(from, storeNote);   return this.diary.get(from) },

        retrieve: function () {
            var from = Blockchain.transaction.from;
            return this.diary.get(from);
        },

    invite: function(partnerAddress){
        var from = Blockchain.transaction.from;
        var you = this.diary.get(from);
        if (from === partnerAddress) {
            throw new Error("不可以给自己发申请哦！");
        }
        if(partnerAddress == ""){
            throw new Error("邀请对象不能为空！");
        }
        var partner = this.diary.get(partnerAddress);
        if(partner != null) {


            if (you.partnerAddress != "") {
                throw new Error("你已经有伴啦！");
            }
            if (you.pendingPartner != "") {
                throw new Error("你已经发过一个申请啦，耐心等待哦");
            }
            if (partner.incomingPartner != "") {
                throw new Error("他/她已经收到一个申请啦，等他/她处理完再发送吧！");
            }
            else if (partner.partnerAddress != "") {
                throw new Error("他/她已经有伴啦！r");
            }
            else if (partner.pendingPartner != "" && partner.pendingPartner != from) {
                throw new Error("他/她也给别人发出申请了，可是那个人不是你TT");
            }
            else if (partner.pendingPartner != "" && partner.pendingPartner === from) {
                partner.pendingPartner = "";
                partner.incomingPartner = "";
                partner.partnerAddress = from;
                you.pendingPartner = "";
                you.incomingPartner = "";
                you.partnerAddress = partnerAddress;
            }
            else {
                partner.incomingPartner = from;
                you.pendingPartner = partnerAddress;
            }
            this.diary.put(from, you);
            this.diary.put(partnerAddress, partner);
        }
        else{
            partner = new StoreNote();
            you.pendingPartner = partnerAddress;
            partner.incomingPartner = from;
            this.diary.put(from, you);
            this.diary.put(partnerAddress, partner);
        }
    },

    reject : function(){
        var from = Blockchain.transaction.from;
        var you = this.diary.get(from);
        var chaserAddress = you.incomingPartner;
        var chaser = this.diary.get(chaserAddress);
        you.incomingPartner = "";
        chaser.pendingPartner = "";
        this.diary.put(from, you);
        this.diary.put(chaserAddress, chaser);
    },

    accept : function(){
        var from = Blockchain.transaction.from;
        var you = this.diary.get(from);
        var chaserAddress = you.incomingPartner;
        var chaser = this.diary.get(chaserAddress);

        you.pendingPartner = "";
        you.partnerAddress = chaserAddress;
        you.incomingPartner = "";

        chaser.pendingPartner = "";
        chaser.incomingPartner = "";
        chaser.partnerAddress = from;

        this.diary.put(from, you);
        this.diary.put(chaserAddress, chaser);
    }

    };
module.exports = DiaryContract;