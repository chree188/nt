'use strict';

//��Ϣ
var Msg = function (jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        this.address = obj.address;
        this.title = obj.title;
        this.msg = obj.msg;
        this.amount = new BigNumber(obj.amount);
        this.id = obj.id;
    } else {
        this.address = "";
        this.title = "";
        this.msg = "";
        this.amount = new BigNumber(0);
        this.id = 0;
    }
};

Msg.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var MSGContract = function () {
    LocalContractStorage.defineProperty(this, "adminAddress"); //����Ա�˻���ַ
    LocalContractStorage.defineProperty(this, "msgCount"); //��Ϣ������
    LocalContractStorage.defineProperty(this, "index"); //��Ϣ����
    LocalContractStorage.defineProperty(this, "commision"); //�����ѱ���
    LocalContractStorage.defineMapProperty(this, "messages", { //��ǰ�����û� �����Ծ� 
        parse: function (jsonText) {
            return new Msg(jsonText);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });
};

MSGContract.prototype = {

    init: function () {
        this.adminAddress = "n1ZyXGb1xvf3uNiFw18bKMizfavsNxQzx2X";
        this.msgCount = 0;
        this.index = 0;
        this.commision = 0.01;
    },
    //������Ϣ
    sellMsg: function (title, msg, amount) {
        var from = Blockchain.transaction.from;
        if (amount < 0) {
            throw new Error("amount can't be negative number.");
        }
        if (title == "") {
            throw new Error("title can't be null.");
        }
        if (msg == "") {
            throw new Error("msg can't be null.");
        }

        var m = new Msg();
        m.address = from;
        m.title = title;
        m.msg = msg;
        m.amount = amount;
        m.id = this.index;
        this.messages.put(this.index, m);
        this.index++;
        this.msgCount++;
        return m;
    },
    //������Ϣ
    buyMsg: function (id) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var msg = this._findMsg(id);
        if (msg == null) {
            throw new Error("no message here.");
        }
        if (value != msg.amount*1000000000000000000) {
            throw new Error("Sorry, please pay " + msg.amount + " NAS only.");
        }
        var amount = msg.amount;
        if(amount>=0.1){
            amount=amount-this.commision;
            this._transferAmount(this.adminAddress, this.commision);//������
        }
        if (amount > 0) {
            this._transferAmount(msg.address, amount);//����Ҵ�Ǯ
        }
        return msg;
    },
    //��ȡ��Ϣ�б�
    getMsgList: function () {
        var list = new Array();
        for (var i = 0; i < this.msgCount; i++) {
            var msg = this.messages.get(i);
            if(msg==null){
                continue;
            }
            var obj = new Object();
            obj.title = msg.title;
            obj.id = msg.id;
            obj.amount = msg.amount;
            obj.address=msg.address;
            list.push(obj);
        }
        return list;
    },
    //����
    _transferAmount: function (address, amount) {
        var result = Blockchain.transfer(address, amount * 1000000000000000000);
        if (!result) {
            Event.Trigger("TransferFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: address,
                    value: amount
                }
            });

            throw new Error("transfer failed. Address:" + address + ", NAS:" + amount);
        }

        Event.Trigger("Transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: amount
            }
        });
    },
    //����һ��
    _findMsg: function (id) {
        for (var i = 0; i < this.msgCount; i++) {
            var msg = this.messages.get(i);
            if (msg.id == id) {
                this.msgCount--;
                this.messages.del(i);
                return msg;
            }
        }
        return null;
    }
};

module.exports = MSGContract;