'use strict';

function NumeralDiagrams() {
  LocalContractStorage.defineProperties(this, {
    "diagramsTotal": 0,
    "commentsTotal": 0
  }, {
    stringify: function(num) {
      return String(num);
    },
    parse: function(str) {
      return new BigNumber(str);
    }
  });

  LocalContractStorage.defineMapProperty(this, "diagrams");
  LocalContractStorage.defineMapProperty(this, "diagramsIndex");

  LocalContractStorage.defineMapProperty(this, "comments");
  LocalContractStorage.defineMapProperty(this, "commentsIndex");

  LocalContractStorage.defineMapProperty(this, "diagramIdByCommentIds");
}

NumeralDiagrams.prototype = {
  constructor: NumeralDiagrams,
  init: function() {
    this.diagramsTotal = 0;
    this.commentsTotal = 0;
    this.pageNumber = 1;
    this.pageSize = 10;
  },
  saveDiagram: function(firstNum, secondNum, thirdNum, diagramName, lineName, type, content) {
    var validateResult = this._validate(firstNum, secondNum, thirdNum, diagramName, lineName, type, content);
    if (validateResult !== true) {
      return {
        success: 0,
        msg: validateResult,
        code: 41
      };
    }

    var id = this._guid();
    var obj = {
      firstNum: firstNum,
      secondNum: secondNum,
      thirdNum: thirdNum,
      diagramName: diagramName,
      lineName: lineName,
      type: type,
      content: content,
      id: id,
      auther: Blockchain.transaction.from,
      createtime: new Date().getTime()
    };

    this.diagrams.set(id, obj);
    this.diagramsIndex.set(this.diagramsTotal, id);
    this.diagramsTotal++;

    return {
      success: 1,
      msg: 'ok',
      code: 0
    };
  },
  getDiagramById: function(id) {
    if (!id) {
      return {
        success: 0,
        msg: 'The query id is required',
        code: 42
      };
    }
    var obj = this.diagrams.get(id);
    if (!obj) {
      return {
        success: 0,
        msg: 'Your queries does not exist',
        code: 43
      };
    }
    return {
      success: 1,
      msg: 'ok',
      data: obj,
      code: 0
    };
  },
  getDiagrams: function(pageNumber, pageSize) {
    pageNumber = this._transformPageNumber(pageNumber);
    pageSize = this._transformPageSize(pageSize);

    var start = (pageNumber - 1) * pageSize;
    var end = pageNumber * pageSize;
    var total = this.diagramsTotal;
    var rows = [];

    if (end >= total) {
      end = total;
    }

    if (start > total) {
      return {
        success: 1,
        msg: 'ok',
        data: {
          total: total,
          rows: rows
        },
        code: 0
      };
    }

    for (var i = start; i < end; i++) {
      rows.push(this.diagrams.get(this.diagramsIndex.get(i)));
    }

    return {
      success: 1,
      msg: 'ok',
      data: {
        total: total,
        rows: rows
      },
      code: 0
    };
  },

  saveComment: function(diagramId, content) {
    if (!diagramId) {
      return {
        success: 0,
        msg: 'The query id is required',
        code: 41
      };
    };

    if (content === '') {
      return {
        success: 0,
        msg: 'The content is required',
        code: 41
      };
    }

    if (content.length > 500) {
      return {
        success: 0,
        msg: 'The number of remarks exceeds the 500 limit',
        code: 41
      };
    }

    var id = this._guid();
    var obj = {
      content: content,
      id: id,
      auther: Blockchain.transaction.from,
      createtime: new Date().getTime()
    };
    var ids = this.diagramIdByCommentIds.get(diagramId) ? this.diagramIdByCommentIds.get(diagramId).ids : [];

    this.comments.set(id, obj);
    this.commentsIndex.set(this.commentsTotal, id);
    this.diagramIdByCommentIds.set(diagramId, {
      ids: ids.push(id)
    });
    this.commentsTotal++;

    return {
      success: 1,
      msg: 'ok',
      code: 0
    };
  },
  getComments: function(diagramId, pageNumber, pageSize) {
    if (!diagramId) {
      return {
        success: 0,
        msg: 'The query id is required',
        code: 42
      };
    };

    pageNumber = this._transformPageNumber(pageNumber);
    pageSize = this._transformPageSize(pageSize);

    var start = (pageNumber - 1) * pageSize;
    var end = pageNumber * pageSize;
    var ids = this.diagramIdByCommentIds.get(diagramId) ? this.diagramIdByCommentIds.get(diagramId).ids : [];
    var total = ids.length || this.commentsTotal;
    var rows = [];

    if (end >= total) {
      end = total;
    }

    if (start > total) {
      return {
        success: 1,
        msg: 'ok',
        data: {
          total: total,
          rows: rows
        },
        code: 0
      };
    }

    for (var i = start; i < end; i++) {
      rows.push(this.comments.get(ids.length > 0 ? ids[i] : this.commentsIndex.get(i)));
    }

    return {
      success: 1,
      msg: 'ok',
      data: {
        total: total,
        rows: rows
      },
      code: 0
    };
  },
  getCommentById: function(id) {
    if (!id) {
      return {
        success: 0,
        msg: 'The query id is required',
        code: 42
      };
    }
    var obj = this.comments.get(id);
    if (!obj) {
      return {
        success: 0,
        msg: 'The queries does not exist',
        code: 43
      };
    }
    return {
      success: 1,
      msg: 'ok',
      data: obj,
      code: 0
    };
  },

  _validate(firstNum, secondNum, thirdNum, diagramName, lineName, type, content) {
    if (Number(firstNum) === NaN || String(firstNum).length !== 3) {
      return 'The first number is illegal';
    }
    if (Number(secondNum) === NaN || String(secondNum).length !== 3) {
      return 'The second number is illegal';
    }
    if (Number(thirdNum) === NaN || String(thirdNum).length !== 3) {
      return 'The third number is illegal';
    }
    if (diagramName === '') {
      return 'The diagrams name cannot be empty';
    }
    if (lineName === '') {
      return 'The diagrams line cannot be empty';
    }
    if (type === '') {
      return 'TThe type cannot be empty';
    }
    if (content && content.length > 500) {
      return 'The number of remarks exceeds the 500 limit'
    }
    return true;
  },
  _transformPageNumber: function(str) {
    var num = Number(str);
    return (num === NaN ? 0 : num) || this.pageNumber;
  },
  _transformPageSize: function(str) {
    var num = Number(str);
    return (num === NaN ? 0 : num) || this.pageSize;
  },
  _guid: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

module.exports = NumeralDiagrams;