'use strict';

var Account = function(obj) {
    this.ids=[]
    if (typeof obj != "undefined") {
        obj = JSON.parse(obj)
        if(Object.prototype.toString.call(obj)=='[object Array]')
            this.ids=obj;
    }
}

Account.prototype = {
    toString: function () {
        return JSON.stringify(this.ids);
    },
    addCertificate:function(id){
        for(var i=0;i<this.ids.length;++i)
            if(id == this.ids[i])
                return;
        this.ids.push(id);
    },
    removeCertificate:function(id){
        for(var i=0;i<this.ids.length;++i) {
            if(id == this.ids[i]) {
                this.ids.splice(i,1);
                return;
            }
        }
    }
}

//定义的证书数据
var Certificate = function (obj) {
    if (typeof obj === "string") {
        obj = JSON.parse(obj);
    }
    if (typeof obj === "object") {
        this.image = obj.image;
        this.title = obj.title;
        this.ownerName = obj.ownerName;
        this.ownerAddr = obj.ownerAddr;
        this.text = obj.text;
        this.issuerName = obj.issuerName;
        this.issuerAddr = obj.issuerAddr;
        this.time = obj.time;
        this.award = obj.award;
    }
}

Certificate.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var Issuer = function (obj) {
    if (typeof obj === "string") {
        obj = JSON.parse(obj);
    }
    if (typeof obj === "object") {
        this.name = obj.name;
    }
    else {
        this.name = "";
    }
}

Issuer.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var CertificateLib = function () {
    LocalContractStorage.defineProperties(this, {
        _name: null,
        _creator: null
    });

    LocalContractStorage.defineMapProperties(this, {
        "certificates": {
            parse: function (value) {
                return new Certificate(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "issuers": {
            parse: function (value) {
                return new Issuer(value);
            },
            stringify: function (o) {
                return o.toString();;
            }
        },
        "ownerMap": {
            parse: function (value) {
                return new Account(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
        "issuerMap": {
            parse: function (value) {
                return new Account(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });
};

CertificateLib.prototype = {
    //智能合约初始化函数，只会在部署的时候执行一次
    init: function () {
        this._name = "Nebulas Certificate Plateform";
        this._creator = Blockchain.transaction.from;
    },

    name: function () {
        return this._name;
    },

    //添加颁布地址，只有这些地址才能颁布奖状
    addIssuerAddr:function (addr,name) {
        var from = Blockchain.transaction.from;
        if(from != this._creator) {
            throw new Error("You are not the manager!");
        }

        this.issuers.set(addr,new Issuer({name:name}));
    },

    //删除颁布地址
    removeIssuerAddr:function (addr) {
        var from = Blockchain.transaction.from;
        if(from != this._creator) {
            throw new Error("You are not the manager!");
        }

        this.issuers.del(addr);
    },

    // 查询某个账户里的所有奖状
    listByOwner: function (owner) {
        return this.ownerMap.get(owner)||[];
    },

    // 查询某个账户颁发的所有奖状
    listByIssuer: function (issuer) {
        return this.issuerMap.get(issuer)||[];
    },
    // 颁布证书，如果发送方没有注册颁布地址，将返回失败
    issue: function (image, title, ownerName, ownerAddr, text, time) {
        var from = Blockchain.transaction.from;
        var issuer = this.issuers.get(from);
        if(issuer == null)
            throw new Error("You are not a issuer, please connect manager to reigster issuser.");
        try{
            var certificate = new Certificate();
            certificate.image=image,
            certificate.title=title,
            certificate.ownerName=ownerName,
            certificate.ownerAddr=ownerAddr,
            certificate.text=text,
            certificate.issuerName=issuer.name,
            certificate.issuerAddr=from,
            certificate.time=time,
            certificate.award=Blockchain.transaction.value.toString(10);
            this.certificates.set(Blockchain.transaction.hash,certificate);

            if(ownerAddr&&ownerAddr!="") {
                var ownerAccount = this.ownerMap.get(ownerAddr) || new Account();
                ownerAccount.addCertificate(Blockchain.transaction.hash);
                this.ownerMap.set(ownerAddr,ownerAccount);
            }

            var issuerAccount = this.issuerMap.get(from) || new Account();
            issuerAccount.addCertificate(Blockchain.transaction.hash);
            this.issuerMap.set(from,issuerAccount);
        }
        catch(e) {
            var stack = e.error.stack;
            var message = e.error.toString();
            if (stack) {
                message += '\n' + stack;
            }
            return message;
        }
    },

    // 注销证书，如果证书不是自己颁布的，将返回失败
    deleteCertificate: function (hash) {
        var certificate = this.certificates.get(hash);
        if(!certificate)
            throw new Error("Can't find the certificate!");

        var from = Blockchain.transaction.from;
        if(certificate.issuerAddr != from || this._creator != from)
            throw new Error("You have not permission to delete this certificate!");

        var issuerAccount = this.issuerMap.get(from);
        if (issuerAccount) {
            issuerAccount.removeCertificate(hash);
            this.issuerMap.set(from,issuerAccount);
        }

        var ownerAccount = this.ownerMap.get(certificate.ownerAddr);
        if (ownerAccount) {
            ownerAccount.removeCertificate(hash);
            this.ownerMap.set(from,ownerAccount);
        }

        this.certificates.del(hash);
    },

    // 查看证书信息
    getInfo: function (hash) {
        var certificate = this.certificates.get(hash);
        if(!certificate)
            throw new Error("Can't find the certificate!");

        return certificate;
    },
    takeAward: function(hash) {
        var from = Blockchain.transaction.from;
        var certificate = this.certificates.get(hash);
        
        if(certificate.ownerAddr !== from)
            throw new Error("This award is not belong to you.");

        if(certificate.took)
            throw new Error("The award has be took.");

        var award = new BigNumber(certificate.award);
        var result = Blockchain.transfer(from, award);
        if(result===0) {
            certificate.took = true;
        }

        console.log("transfer result:", result);
        Event.Trigger("transfer", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: address,
                value: value
            }
        });
    }
};

module.exports = CertificateLib;