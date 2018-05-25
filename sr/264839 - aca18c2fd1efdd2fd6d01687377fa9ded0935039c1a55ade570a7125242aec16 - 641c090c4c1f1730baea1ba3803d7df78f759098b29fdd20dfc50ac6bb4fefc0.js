'use strict'
var Plan = function (text) {
    if (text) {
        var o = JSON.parse(text)
        this.id = o.messageId
        this.sender = o.sender
        this.content = o.content
    } else {
        this.id = 0
        this.sender = ''
        this.content = ''
    }
}

Plan.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
}

var PlanContract = function () {
    LocalContractStorage.defineMapProperty(this, 'plans', {
        parse: function (text) {
            return new Plan(text)
        },
        stringify: function (o) {
            return o.toString()
        }
    })

    LocalContractStorage.defineProperties(this, {
        totalCount: null,
        owner: null
    })
}

PlanContract.prototype = {
    init: function (owner) {
        this.totalCount = 0
        this.owner = owner
    },
    /*
    提款到指定账户
    */
    withdraw: function (amount) {
        if (Blockchain.transaction.from == this.owner) {
            var num = new BigNumber(amount)
            var result = Blockchain.transfer(Blockchain.transaction.from, num)
            return {
                'error': null,
                'result': result
            }
        } else {
            return {
                'error': 'not owner',
                'result': null
            }
        }
    },

    getPlans: function () {
        var resultArr = []
        for (var i = 1; i <= this.totalCount; i++) {
            resultArr.push(this.plans.get(i))
        }
        return {
            'error': null,
            'plans': resultArr
        }
    },
    addPlan: function (content) {
        this.totalCount += 1
        var id = this.totalCount
        var planObj = new Plan()
        planObj.messageId = id
        planObj.sender = Blockchain.transaction.from
        planObj.content = content
        this.plans.put(id, planObj)
        return {
            'error': null,
            'total_count': this.totalCount,
            'plan': planObj
        }
    },
    /*调试*/

    debug: function () {
        var msgs = []
        for (var i = 1; i <= this.totalCount; i++) {
            msgs.push(this.plans.get(i))
        }

        return {
            'd': JSON.stringify(this),
            'msgs': JSON.stringify(msgs),
            'owner': this.owner
        }
    }
}

module.exports = PlanContract