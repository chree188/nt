"use strict";

var PixelPaint = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.point = obj.point;
		this.author = obj.author;
	} else {
	    this.name = "";
	    this.point = "";
	    this.author = "";
	}
};

PixelPaint.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PixelPaintDB = function () {
    LocalContractStorage.defineProperties(this,{
                                          isOpen: null,
                                          admAdd: null,
                                          totalPaint:null
                                          
                                          });
    
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new PixelPaint(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

PixelPaintDB.prototype = {
    init: function () {
        this.admAdd="n1NJaHRXpe49fc98GtuxxYVFyq1xsYCHx9d";
        this.isOpen = true;
        this.totalPaint = 0;
        
        // todo
    },
    //view 拿信息
    gettotalPaint: function() {
        return this.totalPaint;
    },
    
    getIsOpen: function() {
        return this.isOpen;
    },
    
    getAdminAddress: function() {
        return this.admAdd;
    },
    //设置开始
    setIsOpen: function(isopen) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.isOpen = isopen;
        } else {
            throw new Error("Admin only");
        }
    },
    //提钱
    transfer: function(amount) {
        if (Blockchain.transaction.from === this.adminAddress) {
            Blockchain.transfer(this.adminAddress, amount);
            Event.Trigger('transfer', {
                          to: this.adminAddress,
                          value: amount
                          });
        } else {
            throw new Error("Admin only");
        }
    },
    



    save: function (name, point) {
        //鉴定开始
        if (!this.isOpen) {
            throw new Error("Game is currently closed");
        }
        
        name = name.trim();
        point = point.trim();
        if (name === "" || point === ""){
            throw new Error("empty name / point");
        }
        if (point.length > 3000 || name.length > 64){
            throw new Error("name / point exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var pixelArt = this.repo.get(name);
        if (pixelArt){
            throw new Error("same name has been occupied");
        }
        this.totalPaint = this.totalPaint +1;
        pixelArt = new PixelPaint();
        pixelArt.author = from;
        pixelArt.name = name;
        pixelArt.point = point;

        this.repo.put(name, pixelArt);
    },

    get: function (name) {
        name = name.trim();
        if ( name === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(name);
    }
};
module.exports = PixelPaintDB;
