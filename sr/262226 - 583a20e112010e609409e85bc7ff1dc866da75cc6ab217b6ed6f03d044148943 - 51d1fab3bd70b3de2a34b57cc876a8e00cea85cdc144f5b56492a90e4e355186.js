"use strict";

var Prizerdoc = function () {
    LocalContractStorage.defineMapProperty(this, "doc", null)
};
Prizerdoc.prototype = {
    init: function () {
        this.doc.put('status', 1);
        this.doc.put('documentLines', []);
        this.doc.put('docName', [])
        this.doc.put('docPhone',[])
    },

    add: function (person) {
        var status = parseInt(this.doc.get('status'));
        var name = person.name
        var phone = person.phone
        if(status === 0){
            this.reset();
        }
        if(typeof lines === "string"){
            throw new Error(lines);
        }
        var lines = this.doc.get('documentLines')
        lines.push({from:Blockchain.transaction.from, name: name, phoneNum: phone});
        this.doc.put('documentNameLines',lines);
        var docName = this.doc.get('docName')
        docName.push(name)
        this.doc.put('docName', docName)
        var docPhone = this.doc.get('docPhone')
        docPhone.push(phone)
        this.doc.put('docPhone', docPhone)
        
    },

    get: function() {
        var nameArr = this.doc.get('docName')
        var phoneArr = this.doc.get('docPhone')
        var doc = {
            status: this.doc.get('status'),
            name: nameArr,
            phone: phoneArr,
        }
        return doc;
    },

    start: function() {
        var doc = this.get()
        var nameArr = doc.name
        var phoneArr = doc.phone
        var length = doc.name.length
        var targetNumber = parseInt(Math.random() * length)
        var name = nameArr[targetNumber]
        var phone = phoneArr[targetNumber]
        nameArr.splice(targetNumber, 1);
	    phoneArr.splice(targetNumber, 1);
        this.doc.put('docName', nameArr)
        this.doc.put('docPhone', phoneArr)
        return {
            name: name,
            phone: phone,
        }
    },

    restart : function(int) {
        if(int == "reset") {
            this.doc.put('status', 1);
            this.doc.put('docName', []);
            this.doc.put('docPhone', []);
            this.doc.put('lines', [{from:Blockchain.transaction.from, name: [], phone: []}]); 
        }
        return 1
    }
};
module.exports = Prizerdoc;