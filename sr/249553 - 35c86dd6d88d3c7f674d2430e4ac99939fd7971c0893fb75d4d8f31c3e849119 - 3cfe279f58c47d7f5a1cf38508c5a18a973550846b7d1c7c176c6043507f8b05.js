"use strict";

var OathContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");   //HASH
    LocalContractStorage.defineMapProperty(this, "datavalueMap");   //HASH value
    LocalContractStorage.defineProperty(this, "size");
};

OathContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (keyhash,value) {
        var from = Blockchain.transaction.from;
        var index = this.size;
        this.arrayMap.set(index, keyhash);
        this.datavalueMap.set(keyhash , value )
        var tmp_hash = this.dataMap.get( from );

        if ( tmp_hash ){
            var tmp_str = tmp_hash ;
            this.dataMap.del( from );
            tmp_str = tmp_str + "_" + keyhash;
            this.dataMap.set(from , tmp_str);
        }else{
            this.dataMap.set(from , keyhash);
        }
        this.size +=1;
    },

    get: function ( ) {
		var from = Blockchain.transaction.from;
        return this.dataMap.get(from);
    },

    getv: function ( keyhash ) {
        return this.datavalueMap.get( keyhash);
    },  

    len:function(){
      return this.size;
    }
};

module.exports = OathContract;