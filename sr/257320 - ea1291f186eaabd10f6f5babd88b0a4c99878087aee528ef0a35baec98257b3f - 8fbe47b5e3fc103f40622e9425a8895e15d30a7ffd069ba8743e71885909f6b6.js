/**
 * Created by liangyulin on 2018/5/13.
 */


'use strict';

var VoteTask = function (id, voteDescription, candidate) {
    this.id = id;
    this.voteDescription = voteDescription
    this.candidate = candidate
}
var VoteContract = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "voteTaskMap", null);
    LocalContractStorage.defineMapProperty(this, "voteResultMap",null);
}

VoteContract.prototype = {
    init: function () {
        this.size = 0;
        //TODO:
    },

    createVote: function (voteDescription, candidates) {
        var index = this.size;
        var voteTask = new VoteTask(index, voteDescription, candidates)
        this.voteTaskMap.set(index, voteTask);
        this.voteResultMap.set(index, "")
        this.size += 1;
        return JSON.stringify(index);
    },

    performVote: function (voteTaskId, candidateId) {
        var voteTask = this.voteTaskMap.get(voteTaskId)
        if (!voteTask) {
            throw new Error("Not existed voteTaskId:" + voteTaskId);
        }
        var votes = this.voteResultMap.get(voteTaskId)
        var from = Blockchain.transaction.from;
        var serializedResult = votes + "#" + from + ":" + candidateId;
        // var candidateTemp = votes.get(from);
        // if (candidateTemp) {
        //     throw new Error("Duplicated vote！ Have you been voted ?  voteTaskId:" + voteTaskId + " from:" + from);
        // }
        // votes.put(from, candidateId);
        this.voteResultMap.set(voteTaskId, serializedResult);
    },

    staticVote: function (voteTaskId) {
        var votes = this.voteResultMap.get(voteTaskId)
        if (!votes) {
            throw new Error("Not existed voteResult voteTaskId:" + voteTaskId);
        }
        return JSON.stringify(votes);

    },
    getVoteTask: function (voteTaskId) {
        var voteTask = this.voteTaskMap.get(voteTaskId)
        if (!voteTask) {
            throw new Error("Not existed voteTaskId:" + voteTaskId);
        }
        return JSON.stringify(voteTask);
    },
    getVoteId: function(voteDescriptionArgs) {
        // return JSON.stringify(this.size-1);

        var result = -1;
        for(var index = this.size-1 ; index >= 0; index --)
        {
            var voteTask = this.voteTaskMap.get(index)
            if (!voteTask) {
                throw new Error("Something Internal Error Happened :" + index);
            }
            if (voteTask.voteDescription == voteDescriptionArgs){
                result = index;
                break;
            }
        }
        if(result == -1)
        {
            voteTask = this.voteTaskMap.get(this.size-1)
            throw  new Error("error:"+voteTask.voteDescription + " query:"+voteDescriptionArgs)
        }
        return result;


    }

};
module.exports = VoteContract;
