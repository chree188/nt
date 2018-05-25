'use strict';

//
var File = function(jsonStr) {
    if (jsonStr) {
        var obj = JSON.parse(jsonStr);
        
        this.name = obj.name;//文件名，包含后缀
        this.fid = obj.fid;//链中存储的index号
        this.size = obj.size;//单位字节
        this.type = obj.type;//文件类型, txt,bin
        this.format = obj.format;//文件格式, .txt,.doc,.doc,.docx
        this.timeset = obj.timeset;//存储时间
        this.price = obj.price;//文件阅读费用
        this.userid = obj.userid;//对应user的id
        this.address = obj.address;
        this.encrypt = obj.encrypt;//高级功能，加密算法，对应的解密秘钥在用户手里，遇到这个数据则需要key来解密
        this.compress=obj.compress;//是否压缩，解压算法固定
        this.data=obj.data;//实际数据，可能加密或压缩
        this.keyword=obj.keyword;//使用数组存储，用于检索
    } else {
        
        this.name = ""
        this.fid = "";
        this.size = 0;
        this.type ="";
        this.format="";
        this.timeset="";
        this.price=0;
        //this.userid=0;
        this.address="";
        this.encrypt="";
        this.compress=false;
        this.data="";
        this.keywork=[];
    }
};
var User = function(jsonStr){
    if (jsonStr){
        var obj=JSON.parse(jsonStr);
        this.uid= obj.uid;//链中存储的人员id
        this.name=obj.name;//不验证真实性
        this.address=this.address;
        this.password=this.password;
        this.earned=this.earned;
    } else {
        this.uid= 0;
        this.name="";
        this.address="";
        this.password="";
        this.earned=0;
    }
}

File.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
User.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Address = function(jsonStr){
    if (jsonStr){
        var obj=JSON.parse(jsonStr);
        this.address=obj.address;
        this.fileidlist=obj.fileidlist;//list 或 数组
    } else {
        this.address="";
        this.fileidlist=[];
    }
}
Address.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var FileContract = function() {
    LocalContractStorage.defineProperty(this, "currentid"); //当前文件数
    LocalContractStorage.defineProperty(this, "commision"); //手续费，按文件计算，每个存储一个文件0.0001 NAS。当前不收费。设置为0
    LocalContractStorage.defineProperty(this, "commisiondownload"); //手续费，按文件计算，每下载一个文件的手续费，按照比率来。0.1%

    LocalContractStorage.defineProperty(this, "adminAddress"); //管理员账户地址
    LocalContractStorage.defineProperty(this, "commisionAddress"); //手续费收款地址
    LocalContractStorage.defineMapProperty(this, "userRepository", { //
        parse: function(jsonText) {
            return new User(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "fileRepository", { //文件仓库
        parse: function(jsonText) {
            return new File(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "addressRepository", { //地址仓库，key，address，value是数组
        parse: function(jsonText) {
            return new Address(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

FileContract.prototype = {

    init: function() {
        this.currentid = 0;
        this.commision = 0; //存文件不收费
        this.commisiondownload=0.001;//比率

        this.adminAddress = "n1bx686sbr7MitfkuzVDmBeRQfbPuLLVR8T";
        this.commisionAddress = "n1bx686sbr7MitfkuzVDmBeRQfbPuLLVR8T";
    },

    //当前文件数
    getFileAmount: function() {
        return this.currentid;
    },

    _getFile: function(fileid){
        if(this._isEmptyZero(fileid)){
            return null;
        }
        var object = this.fileRepository.get(fileid);
        return object;
    },

    //save file
    savejson: function(jsonstr){
        //检查内容完整性

        //文件是否未空
        if(this._isEmpty(jsonstr)){
            throw new Error("Sorry, argument is empty.");
        }
        var obj = JSON.parse(jsonstr);
        
        //address不能为空
        var from = Blockchain.transaction.from;

        this.currentid=this.currentid+1;
        var f=new File();

        f.fid=this.currentid;
        f.name=obj.name;
        f.size=obj.size;
        f.type=obj.type;
        f.format=obj.format;
        f.price=obj.price;
        f.userid=obj.userid;
        f.address=from;
        //f.timeset= obj.timeset;
        f.timeset= new Date();
        f.encrypt=obj.encrypt;
        f.compress=obj.compress;
        f.data=obj.data;

        //name,size,type是否未空
        if(this._isEmpty(f.name)||this._isEmptyZero(f.size)){
            throw new Error("Sorry, arguments is error.");
        }
        //检查price
        if(this._isEmptyZero(f.price)){
           f.price=0;
        }

        
        //来到这里说明已经支付了合约需要的金额
        //将手续费 从合约账号转账到手续费接收账号
        if(this.commision>0){
            var resule=Blockchain.transfer(this.commisionAddress,this.commision * 1000000000000000000);
            if(!result){
                Event.Trigger("CommisionTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: this.commisionAddress,
                        value: this.commision
                    }
                });

                throw new Error("Commision transfer failed. Commision Address:" + this.commisionAddress.address + ", NAS:" + this.commision);
            }
            Event.Trigger("CommisionTransfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.commisionAddress,
                    value: this.commision
                }
            });
        }
        this.fileRepository.put(this.currentid,f);

        var addressObject=this.addressRepository.get(from);
        var proc='a';
        var addvalue;
        if(addressObject){
            addvalue=addressObject.fileidlist;
            
            if(addvalue){
                proc=proc+' b';
                addvalue.push(this.currentid);
                addvalue=this._unique(addvalue);
                proc=proc+' b1';
                addressObject.fileidlist=addvalue;
                this.addressRepository.put(from,addressObject);
                proc=proc+' c';
            }else{
                addvalue=[];
                addvalue.push(this.currentid);
                proc=proc+' d';
                addressObject.fileidlist=addvalue;
                this.addressRepository.put(from,addressObject);
                proc=proc+' e';
            }
            
        }else{
            proc=proc+' f';
            addvalue=[];
            addvalue.push(this.currentid);
            
            addressObject=new Address(); 
            addressObject.address=from;
            addressObject.fileidlist=addvalue;
            
            this.addressRepository.put(from,addressObject);
        }
        
        //return proc;
        //return addvalue;
        //return addressObject;
        return {"a":addressObject,"r":this.addressRepository,"p":proc,"f":f}; //貌似这里不管如何，都不会将this.的数据返回到客户端。至少这里的this.fileRepository和this.addressRepository不可以
        //这里返回有数据长度限制 252字节
    },
    //userid可以为空，type可能为空.无后缀文件可以为空,price可以为空(即0),其他的都必须
    //弃用
    save: function(file,name,size,type,format,price,userid){
        //检查内容完整性
        //文件是否未空
        if(this._isEmpty(file)){
            throw new Error("Sorry, file is empty.");
        }
        //name,size,type是否未空
        if(this._isEmpty(name)||this._isEmptyZero(size)){
            throw new Error("Sorry, arguments is error.");
        }
        //检查price
        if(this._isEmptyZero(price)){
           price=0;
        }
        //address不能为空
        var from = Blockchain.transaction.from;

        this.currentid=this.currentid+1;
        var f=new File();
        f.fid=this.currentid;
        f.name=name;
        f.size=size;
        f.type=type;
        f.format=format;
        f.price=price;
        f.userid=userid;
        f.address=from;
        f.timeset= new Date();
        f.encrypt="";
        f.compress=false;
        f.data=file;

        
        //来到这里说明已经支付了合约需要的金额
        //将手续费 从合约账号转账到手续费接收账号
        if(this.commision>0){
            var resule=Blockchain.transfer(this.commisionAddress,this.commision * 1000000000000000000);
            if(!result){
                Event.Trigger("CommisionTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: this.commisionAddress,
                        value: this.commision
                    }
                });

                throw new Error("Commision transfer failed. Commision Address:" + this.commisionAddress.address + ", NAS:" + this.commision);
            }
            Event.Trigger("CommisionTransfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.commisionAddress,
                    value: this.commision
                }
            });
        }
        this.fileRepository.put(this.currentid,f);

        var addvalue=this.addressRepository.get(from);
        if(addvalue){
            addvalue.push(this.currentid);
            addvalue=this._unique(addvalue);
            this.addressRepository.put(from,addvalue);
        }else{
            addvalue=[];
            addvalue.push(this.currentid);
            this.addressRepository.put(from,addvalue);
        }
        
        return {"act":true,"add":addvalue};
        //return ["success saved"];
    },

    //根据地址查询文件，可能需要加入key
    //from, 分页查询，开始
    //size, 查询多少，大于50将被强制为50
    queryByAddress: function(address,from,size){
        if(this._isEmpty(address)){
            throw new Error("Sorry, address is error.");
        }
        var addressObject=this.addressRepository.get(address);
        //if(true){return addressObject;}

        if(addressObject){
            var list=[];
            var j,len;
            if(from<1){
                from=1;
            }
            if(size>50){
                size=50;
            }
            if(size<=0){
                size=10;
            }
            j=from-1;
            var fileidlist=addressObject.fileidlist;
            len=fileidlist.length;
            //return {"j":j,"len":len};
            for(; j < len; j++) {
                //console.log(addvalue[j]);
                var f=this._getFile(fileidlist[j]);
                //return f;
                if(f){
                    f.data="";
                    f.encrypt="";
                    list.push(f);
                }
                size--;
                if(size<=0){
                    break;
                }
            }
            return {"count":len,"record":list};
        }else{
            return {"count":0,"record":null};
        }

    },

    //根据关键词查询,赞不开放
    queryByKeyword: function(keyword){

    },

    download: function(fileid){
        //检查内容完整性
        if(this._isEmptyZero(fileid)){
            throw new Error("Sorry, arguments is error.");
        }
        //address不能为空
        var from = Blockchain.transaction.from;
        var paid= Blockchain.transaction.value; //单位是 wei, 转为NAS需要乘以 e+18

        var file=this._getFile(fileid);
        if(file){
            if(file==null){
                throw new Error("Sorry, file does not exist.");
            }
        }
        var unit=1000000000000000000;
        //验证支付的金额数
        var bnPaidNas=paid/unit;
        //var bnPriceWei=new BigNumber(file.price*1000000000000000000);
        if(paid<file.price*unit){
            throw new Error("Sorry, you are going to pay "+bnPaidNas+" NAS, but less than file price "+file.price+" NAS .");
        }

        //来到这里说明已经支付了合约需要的金额
        //将手续费 从合约账号转账到手续费接收账号
        var award = paid;
        var downloadCommisionWei=0;
        if(paid>1000000){ //大于1M wei
            downloadCommisionWei = this.commisiondownload*paid;
            award = paid - downloadCommisionWei
        }
        
        var awardNas=award/unit;
            var result = Blockchain.transfer(file.address, award); //奖池金额-手续费 转入文件拥有者账户
            if (!result) {
                Event.Trigger("AwardTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: file.address,
                        value: awardNas
                    }
                });

                throw new Error("Award transfer failed. File's owner Address:" + file.address + ", NAS:" + awardNas);
            }

            Event.Trigger("AwardTransfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: file.address,
                    value: awardNas
                }
            });

        //if(file.price>0){
        if(paid>1000000){ 
            //转账手续费到手续费接收账号
            var downloadCommisionNas=downloadCommisionWei/unit;
            result=Blockchain.transfer(this.commisionAddress,downloadCommisionWei);
            if(!result){
                Event.Trigger("DownloadCommisionTransferFailed", {
                    Transfer: {
                        from: Blockchain.transaction.to,
                        to: this.commisionAddress,
                        value: this.downloadCommisionNas
                    }
                });

                throw new Error("Download Commision transfer failed. Commision Address:" + this.commisionAddress.address + ", NAS:" + downloadCommisionNas);
            }
            Event.Trigger("DownloadCommisionTransfer", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.commisionAddress,
                    value: this.downloadCommisionNas
                }
            });
        }
        
        //return file; //返回对象
        return [file.type,file.name,file.data]; //返回数组，为了节约返回空间，最多只能发回252字节数据

    },
    //数组去重
    _unique: function(arr) {
        var result = [], hash = {};
        for (var i = 0, elem; (elem = arr[i]) != null; i++) {
            if (!hash[elem]) {
                result.push(elem);
                hash[elem] = true;
            }
        }
        return result;
    },

    _isEmpty: function(obj){
        if(obj){
            if(typeof obj =='string'){
                if(obj.trim().length==0){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }else{
            return true;
        }
    },
    _isEmptyZero: function(obj){
        if(this._isEmpty(obj)){
            return true;
        }else{
            try{
                if(parseFloat(obj)==0){
                    return true;
                }else{
                    return false;
                }
            }catch(e){
                return true;
            }
        }
    },


    withdraw: function(value) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        var result = Blockchain.transfer(this.commisionAddress, parseInt(value) * 1000000000000000000);
        if (!result) {

            Event.Trigger("BidToWinWithdrawFailed", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: this.commisionAddress,
                    value: value
                }
            });

            throw new Error("Withdraw failed. Address:" + this.commisionAddress + ", NAS:" + value);
        }

        Event.Trigger("BidToWinWithdraw", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: this.commisionAddress,
                value: value
            }
        });
    },

    //adjust commision parameters after deployment
    config: function(commision, commisiondownload) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        
        this.commisiondownload = parseDouble(commisiondownload);
        this.commision = parseInt(commision);
    },

    //setup commision address after deployment
    setCommisionAddress: function(newAddress) {
        if (Blockchain.transaction.from != this.adminAddress) {
            throw new Error("Permission denied.");
        }

        this.commisionAddress = newAddress;
    },
};

module.exports = FileContract;