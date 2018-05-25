"use strict";


/**
 * 币需真相 意见反馈
 * @constructor
 */
var FeedbackList = function () {
    //map address to feedback
    LocalContractStorage.defineMapProperty(this, "feedbackMap");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "addressList");
};

FeedbackList.prototype = {
    init:function () {

    },
    len:function () {
        return  this.size;
    },
    getFeedbackAddressList:function () {
        return this.addressList.split(":");
    },
    getItem:function (address) {
        return this.feedbackMap.get(address);
    },
    /**
     * 反馈
     * @param address
     * @param content
     */
    feedback:function (address, content) {
        var item = this.getItem(address);
        if(!item) {
            this.size += 1;
            this.addressList = this.addressList + ":" + address;
        }
        this.feedbackMap.put(address, content);
        return true;
    }
};

module.exports = FeedbackList;


