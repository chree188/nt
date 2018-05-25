var Voting = function () {
    LocalContractStorage.defineMapProperty(this, "votesReceived");
    LocalContractStorage.defineMapProperty(this, "candidateList");
    LocalContractStorage.defineProperty(this, "size");

 };
 
 Voting.prototype = {
       //  初始化候选人名单
     init: function () {
      this.size = 0;
     },
     //设置候选人
     setCandidate: function (value) {
      var index = this.size;
      this.candidateList.set(index, value);
      this.size +=1;
    },
       // 检索投票的姓名是不是候选人的名字
     validCandidate: function(candidate){
        for(var i = 0; i < this.size; i++) {
            if (this.candidateList.get(i) == candidate) {
              return true;
            }
          }
          return false;
     },
       // 为某个候选人投票
       voteForCandidate: function(candidate){
        if(this.validCandidate(candidate)){
            this.votesReceived.set(candidate, this.votesReceived.get(candidate) + 1);
        }
       },
         // 查询某个候选人的总票数
         totalVotesFor:function(candidate){
            if(this.validCandidate(candidate)){
                return this.votesReceived.get(candidate);
            }
         },
         //全部候选人及其票数
         allCandidate: function(){
           var result  = "";
          for(var i=0;i<this.size;i++){
            var key = this.candidateList.get(i);
            var object = this.votesReceived.get(key);
            result += "index:"+i+" 候选人:"+ key + " 票数:" +object+"， ";
          }
          return result;
        }
 };
 
 module.exports = Voting;