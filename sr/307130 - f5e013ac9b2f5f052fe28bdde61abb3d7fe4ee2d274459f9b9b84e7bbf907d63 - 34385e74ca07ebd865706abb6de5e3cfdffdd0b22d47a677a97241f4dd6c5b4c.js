// 构建一个SuperDictionary 类 ES5的写法 可以用ES6 class的写法也行
var SuperDictionary = function () {
  LocalContractStorage.defineMapProperty(this, "repo");
};

SuperDictionary.prototype = {
  // 这个方法比较有，初始化合约的时候 做相应的处理， 比如说 初始化的时候 绑定直接是用户
  init: function () {
    // todo
  },
  /**
   * 保存内容 
   * key: 关键字
   * vlaue: 关键字所对应的定义
   */
  save: function (key, value) {
    key = key.trim();
    value = value.trim();
    if (key === "" || value === ""){
        throw new Error("empty key / value");
    }
    if (value.length > 64 || key.length > 64){
        throw new Error("key / value exceed limit length")
    }
    /**
     * Blockchain.transaction.from 即本次请求的区块链地址
     */
    var from = Blockchain.transaction.from;
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
    dictItem.value = value;
    // 保存
    this.repo.put(key, dictItem);
  },
  // 获取相关保存的词
  get: function (key) {
    key = key.trim();
    if ( key === "" ) {
      throw new Error("empty key")
    }
    return this.repo.get(key);
  }
};
module.exports = SuperDictionary;

