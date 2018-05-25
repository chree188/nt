var Notes = function () {
    LocalContractStorage.defineMapProperty(this, "usersNotes", {
        parse: function (str) {
            return JSON.parse(str);
        },
        stringify: function (obj) {
            return JSON.stringify(obj);
        }
    });
}

Notes.prototype.init = function () {

}

/**
 * 添加记录
 * @param note
 */
Notes.prototype.addNote = function (note) {
    var from = Blockchain.transaction.from
    var oldNotes = this.usersNotes.get(from)
    oldNotes = oldNotes || []
    oldNotes.push({
        context: note,
        createTime: new Date().getTime()
    })
    this.usersNotes.put(from, oldNotes)
}

/**
 * 删除一条记录
 * @param createTime
 */
Notes.prototype.removeNote = function (createTime) {
    var from = Blockchain.transaction.from
    var oldNotes = this.usersNotes.get(from)
    oldNotes = oldNotes || []
    var index = -1
    for (var i = 0, _len = oldNotes.length; i < _len; ++i) {
        if(oldNotes[i].createTime == createTime) {
            index = i
            break
        }
    }
    index >= 0 && oldNotes.slice(index, 1)
    this.usersNotes.put(from, oldNotes)
}

/**
 * 删除所有记录
 * @param createTime
 */
Notes.prototype.removeAllNotes = function (createTime) {
    var from = Blockchain.transaction.from
    this.usersNotes.put(from, null)
}

/**
 * 查看所有记录
 * @returns {*}
 */
Notes.prototype.getNotes = function () {
    var from = Blockchain.transaction.from
    return this.usersNotes.get(from)
}

module.exports = Notes

//测试网络
//合约地址:n1oe33MN8jzft6zJoU6PEQ8Mu8hhjLHnM5D
//合约hash:10ec06b7405364ea3739abdec92ef0dea69b6012f2e9d2ff410a3e09baa26b6d