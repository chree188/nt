'use strict';

// 定义信息类
//TX Hash	0adce2f2e3ba0ada2a1e6344de6aeb2456be4c1c95b9ea680e51722c36b5ead3
// Contract address	n1zN8pkYBwMd9daQi77UqyZziDghGJYBwsN



var Info = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.version = obj.version;
        this.title = obj.title; // 地图 mapid
        this.content = obj.content; // 内容
        this.author = obj.author; // 来源
        this.timestamp = obj.timestamp; // 时间戳
        this.deposit = new BigNumber(obj.deposit); //价钱

        this.preowner = obj.preowner; //之前的拥有
        this.preprice = new BigNumber(obj.preprice); //之前的价格



        this.blockheight = new BigNumber(obj.blockheight);
        this.paid = obj.paid;


        // this.contractbank =new BigNumber(obj.contractbank);

    } else {
        this.version = "1.0.0";
        this.title = "";
        this.content = "";
        this.author = "";
        this.timestamp = 0;
        this.deposit = new BigNumber(0.00001);

        this.preowner = "";
        this.preprice = new BigNumber(0.0);


        this.blockheight = new BigNumber(0);
        this.paid = false;

        // this.contractbank =new BigNumber(0);

    }
};

// 将信息类对象转成字符串
Info.prototype.toString = function () {
    return JSON.stringify(this)
};

// 定义智能合约
var InfoContract = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为infoMap
    // 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的
    LocalContractStorage.defineMapProperty(this, "infoMap", {
        // 从infoMap中读取，反序列化
        parse: function (text) {
            return new Info(text);
        },
        // 存入infoMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });





};

// 定义合约的原型对象
InfoContract.prototype = {
    // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init: function () {

    },
    // 提交信息到星云链保存，传入标题和内容
    save: function (title, content) {
        title = title.trim();
        content = content.trim();

        if (title === "" || content === "") {
            throw new Error("标题或内容为空！");
        }

        if (title.length > 64) {
            throw new Error("标题长度超过64个字符！");
        }

        if (content.length > 256) {
            throw new Error("内容长度超过256个字符！");
        }
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        var deposit = Blockchain.transaction.value;
        // throw new Error("deposit:"+deposit);


        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
        var info = this.infoMap.get(title); //title= map的编号
        // var preowner;
        // var preprice;
        if (info) {
            // throw new Error("您已经发布过内容！");


        } else {

            info = new Info();


            // 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
        }
        var double = new BigNumber("1.99")
        if (deposit.greaterThan(info.deposit.mul(double))) {
            //TODO transfer the fund to orignal author first
            info.preowner = info.author;
            info.preprice = info.deposit;


            info.title = title;
            info.content = content;
            info.timestamp = new Date().getTime();
            info.author = from;
            info.deposit = deposit;

            info.blockheight = Blockchain.block.height;
            info.paid = false;




            var x = new BigNumber("0.999")
            var y = new BigNumber("0.001")
            var paid = Blockchain.transfer(info.preowner, info.deposit.mul(x));
            Blockchain.transfer("n1FDhS74uHvDKmMvbAH69JcEyG1McXZqyB2", info.deposit.mul(y));
            info.paid = paid;
    








            this.infoMap.put(title, info);








        } else if (deposit.greaterThan(0)) {
            //TO Transfer back to from refund, not enough fund for deposit
            // transfer NAS from contract to address
            Blockchain.transfer(from, deposit);
            throw new Error("你的金额只有" + deposit + ",不足购买，已自动退回。");
        } else {
            throw new Error("你的金额为0, 不足购买。");
        }



    },
    // 根据作者的钱包地址从存储区读取内容，返回Info对象
    read: function (author) { //author is title , as mapid
        author = author.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // // 验证地址
        // if (!this.verifyAddress(author)) {
        //     throw new Error("输入的地址不存在！");
        // }
        var existInfo = this.infoMap.get(author);

        //         if (existInfo && existInfo.preowner.length !== 0 && !existInfo.paid) {
        //             // existInfo.paid = true
        //             var height = new BigNumber(Blockchain.block.height);
        // //n1FDhS74uHvDKmMvbAH69JcEyG1McXZqyB2
        //             Blockchain.transfer("n1FDhS74uHvDKmMvbAH69JcEyG1McXZqyB2", new BigNumber("0.000001"));
        //             if (height.greaterThan(existInfo.blockheight)) {
        //                 // existInfo.paid = true
        //                 //     // throw new Error("existinfo:" + existInfo);
        //                 var x = new BigNumber("0.999")
        //                 var y = new BigNumber("0.001")
        //                 Blockchain.transfer(existInfo.preowner, existInfo.deposit.mul(x));
        //                 Blockchain.transfer("n1FDhS74uHvDKmMvbAH69JcEyG1McXZqyB2", existInfo.deposit.mul(y));
        //                 existInfo.paid = true;
        //                 this.infoMap.put(existInfo.title, existInfo);

        //             }
        //         }





        return existInfo;
    },
    // 验证地址是否合法
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
// 导出代码，标示智能合约入口
module.exports = InfoContract;