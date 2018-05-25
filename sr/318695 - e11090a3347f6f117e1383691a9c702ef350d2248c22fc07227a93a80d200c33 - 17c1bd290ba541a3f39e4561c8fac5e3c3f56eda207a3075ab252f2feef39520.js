// 构建一个GamePlayer 类 ES5的写法 可以用ES6 class的写法也行
var GamePlayer = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
    LocalContractStorage.defineProperty(this, "size");
  };
  
  GamePlayer.prototype = {
    // 这个方法比较有，初始化合约的时候 做相应的处理， 比如说 初始化的时候 绑定直接是用户
    init: function () {
      // todo
      this.size =0;
    },
    /**
     * 保存内容 
     * key: 关键字
     * vlaue: 关键字所对应的定义
     */
    save: function (gameName, serverName,partyName,nickName,msg) {
      gameName = gameName.trim();
      serverName = serverName.trim();
      partyName = partyName.trim();
      nickName = nickName.trim();
      msg = msg.trim();
      if (gameName === "" || nickName === ""){
          throw new Error("empty 游戏名 / 昵称");
      }
      if (gameName.length > 64 || serverName.length > 64||partyName.length > 64 || nickName.length > 64|| msg.length > 64){
          throw new Error("exceed limit length")
      }
      /**
       * Blockchain.transaction.from 即本次请求的区块链地址
       */
      var from = Blockchain.transaction.from;
      var key = gameName+"-"+serverName+"-"+partyName+"-"+nickName+"-"+msg
      var dictItem = this.repo.get(key);
      // 若已经存在 则这个词已经被抢注了 抛出异常
      if (dictItem){
          throw new Error("value has been occupied");
      }
      // 很自信的觉得 下面的写法是对的 没想到测试没通过 可怕
      // dictItem = {
      //   author: from
      //   key,
      //   value
      // }
      // 最后改成如下写法
      dictItem = {};
      dictItem.author = from;
      dictItem.key = key;
      dictItem.gameName = gameName;
      dictItem.serverName = serverName || "未知";
      dictItem.partyName = partyName || "未知";
      dictItem.nickName = nickName;
      dictItem.msg = msg || "";
      // 保存
      var index = this.size;
      this.size +=1;
      this.repo.set(index, dictItem);
    },
    // 获取相关保存的词
    get: function (key) {
      key = key.trim();
      if ( key === "" ) {
        throw new Error("empty key")
      }
      return this.repo.get(key);
    },
    getByNick:function(nick){
      result= [];
      for(var i=0;i<this.size;i++){
        var data = this.repo.get(i);
        if(data.nickName==nick){
          result[result.length] = data;
        }
      }
      return result;
    },
    getAll:function(){
      result= [];
      for(var i=0;i<this.size;i++){
        var data = this.repo.get(i);
        result[result.length] = data;
      }
      return result;
    },
  };
  module.exports = GamePlayer;