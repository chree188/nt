"use strict";

// 这是本人开发的第一个智能合约，以前从事web开发，第一次接触感觉还是比较难以上手
// 主要是一些概念和系统的东西，wiki里面基本上来说还是针对已经有智能合约开发经验的，目前还比较杂乱
// 希望能够从web开发的思想，转变到智能合约开发的思想，其中的思想和经验可以相互融合促进
// 希望从web转到智能合约开发的web_to_smart_contract新手能更快上手

// ************************************************************

// 以下注释均是自己从web思维写的，可能理解有误，希望以后得到纠正
// 也许要放弃web思维，但是先走一步算一步吧，毕竟从零开始 by Jacob Zhou

/*
    ****************需求特点********************
    * 隐藏链接地址，通过初始化参数保存
    * 每点下一章节都需要进行钱包交互
 */

var Nas101 = function () {

}

Nas101.prototype = {
  init: function (links) {
    var links = links;
    // a.html,b.html,c,html
    var link_ary = links.split(",");
    for(var i=0;i<link_ary.length;i++){
      LocalContractStorage.set("ep_" + (i+1), link_ary[i])
    }

    LocalContractStorage.set("total", link_ary.length);
  },

  get_links: function(){
    var rs = [];
    for(var i=0;i<LocalContractStorage.get("total");i++){
      rs[i] = LocalContractStorage.get("ep_" + (i+1));
    }
    return rs;
  },

  get: function(str){
    var id = "ep_" + str.split("_")[1];
    // {"result":"null","execute_err":"","estimate_gas":"20142"}
    return LocalContractStorage.get(id);
  },

  test: function(){
    return "love";
  }

};

// 核心
module.exports = Nas101;