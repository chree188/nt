"use strict";

var TodoList = function () {
      LocalContractStorage.defineMapProperty(this, "dataMap");
}

TodoList.prototype = {
      init : function () {
      },
      getList:function () {
	    this.account = Blockchain.transaction.from;
	    return this.dataMap.get(this.account)
      },
      setTodo : function (content) {
            var list = JSON.parse(this.getList() || '[]')
            list.push({content:content , isDone:false,idx:list.length+1})
	    console.log('list',list)
	    this.dataMap.set(this.account,JSON.stringify(list))
      },
      todoDone : function (idx) {
		var list = JSON.parse(this.getList())
	    list[idx].isDone = true
	    this.dataMap.set(this.account,JSON.stringify(list))
      }
}

module.exports = TodoList