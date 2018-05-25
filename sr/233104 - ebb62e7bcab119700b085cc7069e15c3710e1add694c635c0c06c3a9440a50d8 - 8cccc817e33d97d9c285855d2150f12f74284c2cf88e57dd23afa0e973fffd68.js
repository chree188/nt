'use strict';

var DiaryContract = function () {
  LocalContractStorage.defineProperty(this, "size")
  LocalContractStorage.defineMapProperty(this, "userDiaryTitleList")
  LocalContractStorage.defineMapProperty(this, "userDiary")
};

DiaryContract.prototype = {
    init: function () {
      this.size = 0;
    },
    setDiary: function (value) {
      if (typeof value === 'string') {
        value = JSON.parse(value)
      }
      this._ArrayPush(this.userDiaryTitleList, value.title)
      this.userDiary.set(value.title, value)
    },
    getDiary: function (title) {
      return this.userDiary.get(title)
    },
    delDiary: function (index) {
      let title = this.userDiaryTitleList.get(index)
      this._ArraySplice(this.userDiaryTitleList, index, 1)
      this.userDiary.del(title)
    },
    length: function () {
      return this.size
    },
    getDiaryList: function (limit, offset) {
      limit = parseInt(limit)
      offset = parseInt(offset)
      if (offset > this.size) {
        throw new Error("offset is not valid")
      }
      var number = offset + limit
      if (number > this.size) {
        number = this.size
      }
      var result  = [];
      for (var i = offset; i < number; i++) {
          var title = this.userDiaryTitleList.get(i)
          result.push({
            index: i,
            title: title
          })
      }
      return result
    },
    _ArrayPush: function (array, data) {
      array.set(this.size, data)
      this.size += 1
    },
    _ArraySplice: function (array, offset, count) {
      offset = parseInt(offset)
      count = parseInt(count)
      var number = offset + count
      for (var i = offset; i < number; i++) {
        array.del(i)
      }
      var temp = ''
      for (var j = offset + count; j < this.size; j++) {
        temp = array.get(j)
        array.del(j)
        array.set(j - count, temp)
      }
      this.size -= count
    }
};

module.exports = DiaryContract