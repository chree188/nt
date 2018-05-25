'use strict';
 // 定义一个合约
var SimpleStorage = function () {
    // 题号id
    LocalContractStorage.defineProperty(this, "num");
     //题目
     LocalContractStorage.defineMapProperty(this, "question_content");
    //  选项
    LocalContractStorage.defineMapProperty(this, "select_question");
     //答案
     //1,2,3,4 分别代表 A,B,C,D
     LocalContractStorage.defineMapProperty(this, "result");
      //答题人作答
    LocalContractStorage.defineMapProperty(this, "answer");
    //答题人分数
    LocalContractStorage.defineMapProperty(this, "grade");


 };
 
 SimpleStorage.prototype = {
       //  初始化
     init: function () {
         this.num = 0;

         this.num ++;
         this.question_content.set(this.num,"如果昨天是昨天的话就好了。这样今天就周五了。Q：句子中的今天是周几？");
         this.select_question.set(this.num,"A. 周三, B. 周四, C. 周五, D. 周六");
         this.result.set(this.num,"A");

     }, 
    //  获取题目 
    getQuestionContent: function(){
        var result  = "";
        for(var i=1;i<this.num + 1;i++){
            var object = this.question_content.get(i);
            result += object + "  ";
          }
          return result;
     },
     //获取题目选项
     getSelectQuestion: function(){
        var result  = "";
        for(var i=1;i<this.num + 1;i++){
            var object = this.select_question.get(i);
            result += object + "  ";
          }
          return result;
     },
     //回答题目
     answerQuestion: function(answer_id){
        if(this.result.get(1) == answer_id){
            this.grade.set(Blockchain.transaction.from,this.grade.get(Blockchain.transaction.from) + 100);
        }
     },
     //查询分数
     getGrade: function(){
         return this.grade.get(Blockchain.transaction.from);
     }
     
 };
 module.exports = SimpleStorage;