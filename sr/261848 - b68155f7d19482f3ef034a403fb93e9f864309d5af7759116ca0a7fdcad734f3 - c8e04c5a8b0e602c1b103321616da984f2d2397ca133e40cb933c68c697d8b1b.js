'use strict';

// 课后家庭作业合约

// 老师
var Teacher = function (info) {
  if(info) {
    var obj = JSON.parse(info);
    this.address = obj.address; // 用户地址
    this.name = obj.name; // 老师名字
    this.school = obj.school; // 老师学校，手填写的
    this.course = obj.course; // 老师主授课程
  } else {
    this.address = "";
    this.name = "";
    this.school = "";
    this.course = "";
  }
};

Teacher.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

// 学生
var Student = function (info) {
  if(info) {
    var obj = JSON.parse(info);
    this.address = obj.address;
    this.name = obj.name;
    this.school = obj.school;
    this.nianji= obj.nianji; // 年级
    this.banji= obj.banji; // 班级
  } else {
    this.address = "";
    this.name = "";
    this.school = "";
    this.nianji= "";
    this.banji= "";
  }
};

Student.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

// 作业
var Homework = function (info) {
  if(info) {
    var obj = JSON.parse(info);
    this.hwid = obj.hwid; // 作业 id
    this.title = obj.title; // 作业标题
    this.content = obj.content; // 作业详情
    this.course = obj.course; // 作业是哪个课程的
    this.teacher = obj.teacher; // 作业是哪个老师发布的
    this.endtime = obj.endtime; // 作业截止日期
    this.answer = obj.answer; // 标准答案
  } else {
    this.hwid = "";
    this.title = "";
    this.content = "";
    this.course = "";
    this.teacher = "";
    this.endtime = "";
    this.answer = "";
  }
};

Homework.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

// 学生，作业关系
var StudentHomework = function (info) {
  if(info) {
    var obj = JSON.parse(info);
    this.hwid = obj.hwid;
    this.status = obj.status; // 作业状态 0-初始化 1-已提交作业； 2-已打分
    this.solution = obj.solution; // 作业答案
    this.score = obj.score; // 老师评分  A B C D F
  } else {
    this.hwid = "";
    this.status = "";
    this.solution = "";
    this.score = "";
  }
};

var HomeworkAPI = function () {
  // 老师映射，键是 address，值是 teacher 结构
  LocalContractStorage.defineMapProperty(this, "teacher", {
    parse: function (data) {
      return new Teacher(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 学生映射，键是 address，值是 student 结构
  LocalContractStorage.defineMapProperty(this, "student", {
    parse: function (data) {
      return new Student(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 所有的用户 key 有 teacher/student
  LocalContractStorage.defineMapProperty(this, "allusers", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 老师的发布作业列表，键是 address，值是 作业 id 列表
  LocalContractStorage.defineMapProperty(this, "teacherHWList", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 学生收到的 作业列表，键是 address，值是 作业 id 列表
  LocalContractStorage.defineMapProperty(this, "studentHWList", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 学生收到的作业映射，键是 address+id,值是学生的 StudentHomework
  LocalContractStorage.defineMapProperty(this, "studentHW", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 作业的映射，键是作业的 id，值是 homework 结构
  LocalContractStorage.defineMapProperty(this, "homework", {
    pasre: function (data) {
      return new Homework(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }

  });

  // 所有的作业 id
  LocalContractStorage.defineMapProperty(this, "allhomeworks", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // 指定 id 的作业被分发给了哪些学生，键是作业 id，值是学生 address
  LocalContractStorage.defineMapProperty(this, "homeworksentList", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }
  });

  // homework id 值
  LocalContractStorage.defineMapProperty(this, "hwid", {
    pasre: function (data) {
      return JSON.parse(data);
    },
    stringify: function (o) {
      return JSON.stringify(o);
    }

  });
};

HomeworkAPI.prototype = {
  init: function () {

  },

  getUserAddress: function() {
    return Blockchain.transaction.from;
  },

  getCurId: function() {
    return this.hwid.get('HWID');
  },

  // 注册老师
  createTeacher: function (name, school, course) {
    var from = Blockchain.transaction.from;
    var t = this.teacher.get(from);
    if(t) {
      throw new Error("老师已存在");
    }

    t = new Teacher();
    t.address = from;
    t.name = name;
    t.school = school;
    t.course = course;
    this.teacher.set(from, t);

    // 存放到 allusers
    var allusers = this.allusers.get('teacher') || [];
    allusers.push(from);
    this.allusers.set('teacher', allusers);

    return true;
  },

  // 注册学生
  createStudent: function (name, school, nianji, banji) {
    var from = Blockchain.transaction.from;
    var s = this.student.get(from);
    if(s) {
      throw new Error("学生已存在");
    }

    s = new Student();
    s.address = from;
    s.name = name;
    s.school = school;
    s.nianji = nianji;
    s.banji = banji;
    this.student.set(from, s);

    // 存放到 allusers
    var allusers = this.allusers.get('student') || [];
    allusers.push(from);
    this.allusers.set('student', allusers);

    return true;
  },

  // 获取用户信息，返回的指示中会返回用户 address，学生还是老师，还有额外信息
  getUserInfo: function () {
    var from = Blockchain.transaction.from;
    var u = this.teacher.get(from);

    if(u) {
      // 是老师
      u.utype = 'TEACHER';
    } else {
      u = this.student.get(from);
      if(u) {
        // 是学生
        u.utype = 'STUDENT';
      }
    }

    return u;
  },

  getAllTeacher: function() {
    var tids = this.allusers.get('teacher') || [];
    var teachers = [];
    for (var i=0; i <tids.length; i++) {
      var tid = tids[i];
      var tinfo = this.teacher.get(tid);
      teachers.push(tinfo);
    }

    return teachers;
  },

  getAllStudent: function() {
    var sids = this.allusers.get('student') || [];
    var students = [];
    for(var i=0; i<sids.length; i++) {
      var sid = sids[i];
      var sinfo = this.student.get(sid);
      students.push(sinfo);
    }

    return students;
  },

  // 新建作业 studentIds 是 address 列表
  createHomework: function (course, title, endtime, content, studentIds) {
    var from = Blockchain.transaction.from;
    var u = this.teacher.get(from);

    if(u == null)  {
      throw new Error("不是老师，不能创建作业");
    }

    var hw = new Homework();

    var curId = this.hwid.get('HWID');
    if(curId) {
      curId = parseInt(curId);
    } else {
      curId = 1;
    }

    var curIdStr = curId.toString();

    hw.hwid = curIdStr;
    hw.title = title;
    hw.content = content;
    hw.course = course;
    hw.teacher = from;
    hw.endtime = endtime;
    hw.answer = "";
    // 存储到 homework
    this.homework.set(curIdStr, hw);

    // 存储到所有的作业中
    var allhw = this.allhomeworks.get('ALLHW') || [];
    allhw.push(curIdStr);
    this.allhomeworks.set('ALLHW', allhw);

    // 存储到老师的个人作业列表下
    var thwlist = this.teacherHWList.get(from) || [];
    thwlist.push(curIdStr);
    this.teacherHWList.set(from, thwlist);

    // 存储作业被分到哪些学生列表
    this.homeworksentList.set(curIdStr, studentIds);

    // 存储每个学生收到的作业信息
    for(var i=0; i<studentIds.length; i++) {
      var s = studentIds[i];

      // 存储学生收到的作业列表
      var shw = this.studentHWList.get(s) || [];
      shw.push(curIdStr);
      this.studentHWList.set(s, shw);

      // 存储学生与作业的映射关系
      var tmphw = new StudentHomework();
      tmphw.hwid = curIdStr;
      tmphw.status = 0; // 0 - 未提交， 1- 已提交 2-已打分
      tmphw.solution = "";
      tmphw.score = "";
      var key = s + curIdStr;
      this.studentHW.set(key, tmphw);
    }

    curId += 1;
    this.hwid.set('HWID', curId);

    return curId - 1;
  },

  // 根据作业 id 查询单个作业
  // 返回作业信息，返回老师信息，返回学生信息
  getHomeworkById: function (hwId, more) {
    hwId = hwId.toString();
    var hw = this.homework.get(hwId);
    if(hw == null) {
      return hw;
    }

    if (more == "Y") {
      // 读取发布课程的老师信息
      var taddr = hw.teacher;
      var teacher = this.teacher.get(taddr);
      hw.teacherInfo = teacher;

      // 读取哪些学生收到了这个课程
      var sids = this.homeworksentList.get(hwId) || [];
      var students = [];
      for (var i=0; i<sids.length; i++) {
        var sid = sids[i];
        var student = this.student.get(sid);
        if(student) {
          // 读取这个学生的作业处理情况
          var key = sid + hwId;
          var tmphw = this.studentHW.get(key);
          student.homework = tmphw;
          students.push(student);
        } else {
          hw.sterror = "读取学生信息失败"
        }
      }

      hw.students = students;
    }

    return hw;
  },

  // 获取所有的作业
  getAllHomework: function () {
    var allhws = this.allhomeworks.get('ALLHW') || [];
    var hws = []
    for(var i=0; i<allhws.length; i++) {
      var hwid = allhws[i];
      var hw =this.getHomeworkById(hwid, "Y");
      hws.push(hw);
    }

    return hws;
  },

  // 查看自己发布的作业，程序判断是学生，还是老师，然后返回不同的结构
  getMyHWList: function() {
    var from = Blockchain.transaction.from;
    var u = this.teacher.get(from);
    var utype = "";
    if(u != null) {
      utype = "TEACHER";
    } else {
      u = this.student.get(from);
      if(u != null) {
        utype = "STUDENT";
      }
    }

    var ret = Object()
    ret.utype = utype;

    if(utype == "TEACHER") {
      ret.data = this.getTeacherHWList();
      return ret;
    } else if (utype == "STUDENT") {
      ret.data = this.getStudentHWList();
      return ret;
    } else {
      return null;
    }
  },

  // 老师查看自己发布的作业
  getTeacherHWList: function() {
    var from = Blockchain.transaction.from;
    var u = this.teacher.get(from);
    if(u == null) {
      throw new Error("账户不是老师");
    }

    var ahwlist = this.teacherHWList.get(from) || [];
    var retHWs = [];
    for(var i=0; i<ahwlist.length; i++) {
      var hwid = ahwlist[i];
      var hwinfo = this.getHomeworkById(hwid, "Y");
      retHWs.push(hwinfo);
    }

    return retHWs;
  },

  // 学生查看自己的作业列表
  getStudentHWList: function () {
    var from = Blockchain.transaction.from;
    var u = this.student.get(from);
    if(u == null) {
      throw new Error("账户不是学生");
    }

    var hwlist = this.studentHWList.get(from) || [];
    var hws = [];
    for(var i=0; i < hwlist.length; i++) {
      var hwid = hwlist[i];
      var hw = this.homework.get(hwid);
      if(hw) {
        // 读取老师信息
        var tid = hw.teacher;
        var tinfo = this.teacher.get(tid);
        hw.teacherInfo = tinfo;
        // 读取学生处理状态
        var key = from + hwid;
        var phw = this.studentHW.get(key);
        hw.process = phw;
        hws.push(hw);
      }
    }

    return hws;
  },

  // 学生查看指定的id 的作业信息
  studentHWInfo: function (hwid) {
    var from = Blockchain.transaction.from;
    var u = this.student.get(from);
    if(u == null) {
      throw new Error("账户不是学生");
    }

    var hw = this.homework.get(hwid);
    if(hw) {
      // 读取老师信息
      var tid = hw.teacher;
      var tinfo = this.teacher.get(tid);
      hw.teacherInfo = tinfo;

      // 读取学生处理状态
      var key = from + hwid;
      var phw = this.studentHW.get(key);
      hw.process = phw;
    }

    return hw;
  },

  // 学生提交作业
  studentPostHW: function (hwid, solution) {
    var from = Blockchain.transaction.from;
    var u = this.student.get(from);
    if(u == null) {
      throw new Error("账户不是学生");
    }

    var key = from + hwid;
    var phw = this.studentHW.get(key);
    if(phw) {
      if (phw.status == 2) {
        throw  new Error("老师已评分，不可修改");
      }

      phw.status = 1;
      phw.solution = solution;
      this.studentHW.set(key, phw);
    }

    return true;
  },

  // 老师提交答案
  teacherPostAnswer: function (hwid, answer) {
    var from = Blockchain.transaction.from;
    var u = this.teacher.get(from);
    if(u == null) {
      throw new Error("账户不是老师");
    }

    var hw = this.homework.get(hwid);
    if(hw == null) {
      throw new Error("作业不存在");
    }

    if(hw.teacher != from) {
      throw new Error("不是自己发布的作业，不能提交答案");
    }

    hw.answer = answer;
    this.homework.set(hwid, hw);

    return true;
  },

  // 老师对学生作业打分
  judgeHomework: function (hwid, stuAddr, score) {
    var from = Blockchain.transaction.from;
    var u = this.teacher.get(from);
    if(u == null) {
      throw new Error("账户不是老师");
    }

    var hw = this.homework.get(hwid);
    if(hw == null) {
      throw new Error("作业不存在");
    }

    if(hw.teacher != from) {
      throw new Error("不是自己发布的作业，不能评判答案");
    }

    // 读取学生的答案
    var key = stuAddr + hwid;
    var stuhw = this.studentHW.get(key);
    if(stuhw == null) {
      throw new Error("学生作业不存在");
    }

    if(stuhw.status != 1) {
      throw new Error("作业未提交或已评价");
    }

    stuhw.score = score;
    stuhw.status = 2;
    this.studentHW.set(key, stuhw);
    return true;
  }
};

module.exports = HomeworkAPI;
