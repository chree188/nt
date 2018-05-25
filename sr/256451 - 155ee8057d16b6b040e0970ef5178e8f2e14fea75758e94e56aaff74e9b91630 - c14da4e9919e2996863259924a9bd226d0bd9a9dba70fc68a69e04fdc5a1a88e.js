"use strict";

var TodoList = function () {
      LocalContractStorage.defineMapProperty(this, "arrayMap");
      LocalContractStorage.defineMapProperty(this, "dataMap");
}

TodoList.prototype = {
      init : function () {
	    this.account = Blockchain.transaction.from;
      },
      getList:function () {
            return this.dataMap.get(this.account)
      },
      setTodo : function (content) {
            var list = this.getList() || {}
            var key = 0
            for(var i in list){
                  key += 1;
	    }
	    this.dataMap.set(key,content)
      }
}

module.exports = TodoList