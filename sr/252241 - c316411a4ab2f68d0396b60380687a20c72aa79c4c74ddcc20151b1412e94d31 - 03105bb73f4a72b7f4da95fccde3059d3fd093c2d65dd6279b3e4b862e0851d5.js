'use strict';

//[ "{\"question\": \"OKOKOK\", \"answers\": [\"one\", \"two\", \"three\"]}" ]

//n1yDxYzqLSAL99r9dr5wqc78KLUSfuTVrfw
//

var Poll = function (data)
{
  if(data)
  {
    var o = JSON.parse(data);

    this.id = o.id || 0
    this.creator = o.creator || ""
    this.question = o.question;
    this.answers = o.answers
    this.results = o.results || o.answers.map((a) => 0)
    this.totalVotes = o.totalVotes != undefined? o.totalVotes : 0
  }
  else
  {
    this.id = 0
    this.creator = ""
    this.question = ""
    this.answers = []
    this.results = []
    this.totalVotes = 0
  }
};

Poll.prototype =
{
  toString: function ()
  {
    return JSON.stringify(this);
  }
};


var NebupollsContract = function ()
{
  LocalContractStorage.defineMapProperty(this, "polls",
  {
    parse: function (text)
    {
      return new Poll(text);
    },
    stringify: function (o)
    {
      return o.toString();
    }
  })

  LocalContractStorage.defineProperty(this, "pollCount")
  LocalContractStorage.defineProperty(this, "topPolls")
  LocalContractStorage.defineProperty(this, "recentPolls")
  LocalContractStorage.defineMapProperty(this, "pollVotes")
}

const RECENT_POLLS_COUNT = 100
const TOP_POLLS_COUNT = 100

NebupollsContract.prototype =
{
  init: function () 
  {
    this.pollCount = 0
    this.topPolls = []
    this.recentPolls = []
  },

  createPoll: function(data)
  {
    this.pollCount++

    const id = this.pollCount

    const poll = new Poll(data)

    poll.id = id
    poll.creator = Blockchain.transaction.from

    if(poll.question.length < 5 || poll.question.length > 200)
    {
      throw new Error("Poll question must be between 5 and 200 characters.")
    }

    if(poll.answers.length < 2 || poll.answers.length > 6)
    {
      throw new Error("Poll must have between 2 and 10 answers.")
    }

    for(const answer of poll.answers)
    {
      if(answer.length < 1 || answer.length > 200)
      {
        throw new Error("Poll answer must be between 1 and 200 characters.")
      }
    }

    this.polls.set(id, poll)

    let recentPolls = this.recentPolls

    recentPolls.unshift(id)

    if(recentPolls.length > RECENT_POLLS_COUNT)
    {
      recentPolls = recentPolls.slice(0, RECENT_POLLS_COUNT)
    }

    this.recentPolls = recentPolls

    Event.Trigger("nebupolls.createPoll",
    { 
      poll
    })
  },

  getPoll: function(id)
  {
    const poll = this.polls.get(id)

    if(!poll)
    {
      throw new Error("There is no poll with id " + id)
    }

    return poll
  },

  _getPollsArray: function(ids, index, count)
  {
    if(index < 0 || count < 1)
    {
      throw new Error("Invalid index and count.")
    }

    let polls = []

    for(let i = index; i < index + count; i++)
    {
      if(i >= ids.length)
      {
        break
      }

      polls.push(this.polls.get(ids[i]))
    }

    return polls
  },

  getRecentPolls: function(index, count)
  {
    return this._getPollsArray(this.recentPolls, index, count)
  },

  getTopPolls: function(index, count)
  {
    return this._getPollsArray(this.topPolls, index, count)
  },

  _getPollVoteKey: function(id, from)
  {
    return id + "_" + from
  },

  getPollVote: function(id, from)
  {
    return this.pollVotes.get(this._getPollVoteKey(id, from))
  },

  vote: function(id, vote)
  {
    const poll = this.polls.get(id)

    if(!poll)
    {
      throw new Error("There is no poll with that id.")
    }

    if(vote < 0 || vote >= poll.answers.length)
    {
      throw new Error("Your vote must be bewteen 0 and " + (poll.answers.length - 1) + ".")
    }

    const from = Blockchain.transaction.from

    const existingVote = this.getPollVote(id, from)

    if(existingVote === vote)
    {
      throw new Error("You have already voted for that.")
    }

    let ee = ""

    if(existingVote != undefined)
    {
      poll.results[existingVote]--
    }
    else
    {
      poll.totalVotes++

      const oldIndex = this.topPolls.indexOf(id)
      let index = oldIndex
      
      ee += "1_"

      if(index >= 0)
      {
        ee += "2_"

        let moveUp = 0

        while(index > 0)
        {
          ee += "3_"

          index--

          const totalVotes = this.polls.get(this.topPolls[index]).totalVotes

          if(totalVotes >= poll.totalVotes)
          {
            break
          }
          else
          {
            moveUp++
          }
        }

        const newIndex = oldIndex - moveUp

        this.topPolls.splice(oldIndex, 1)
        this.topPolls.splice(newIndex, 0, id)

        ee += "4_(" + this.topPolls.length + ")"

      }
      else
      {
        let insertLocation = this.topPolls.length

        ee += "5_(" + this.topPolls.length + ")"

        while(insertLocation > 0)
        {
          if(this.polls.get(this.topPolls[insertLocation - 1]).totalVotes >= poll.totalVotes)
          {
            break
          }
          else
          {
            insertLocation--
          }
        }

        ee += "6_(" + insertLocation + ")"

        if(insertLocation < TOP_POLLS_COUNT)
        {
          this.topPolls.splice(insertLocation, 0, id)

          if(this.topPolls.length > TOP_POLLS_COUNT)
          {
            this.topPolls = this.topPolls.slice(0, TOP_POLLS_COUNT)
          }

          ee += "7_(" + this.topPolls.length + ")"

        }
      }
    }

    poll.results[vote]++

    this.pollVotes.set(this._getPollVoteKey(id, from), vote)

    this.polls.set(id, poll)

    ee += "8_(" + this.topPolls.length + ")"

    throw new Error(ee)
    return

    Event.Trigger("nebupolls.vote",
    { 
      id,
      from: Blockchain.transaction.from,
      vote,
      oldVote: existingVote,
      poll
    })
  }
};

module.exports = NebupollsContract