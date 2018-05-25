'use strict';

var _LENGTH = 30;
var _SEX  = {man:1, women:2};

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("PickSchoolmate-->")
    console.log.apply(console, args);
}

function _isInArray(arr, value) {
	if (!arr) {
		return false;
	}

	for (var i = 0; i < arr.length; i++) {
		if (value === arr[i]) {
			return true;
		}
	}
	return false;
}

var PickSchoolmate = function() {
	LocalContractStorage.defineMapProperty(this, 'studentInfoMap', null);
	LocalContractStorage.defineMapProperty(this, 'schoolStudentMap', null);
	LocalContractStorage.defineMapProperty(this, 'schoolKeysMap', null);
	LocalContractStorage.defineProperty(this, 'studentCnt');	
	LocalContractStorage.defineProperty(this, 'schoolCnt');	
}

PickSchoolmate.prototype = {
	init: function() {
		this.studentCnt = 0;
		this.schoolCnt = 0;
	},

	saveInfo: function(info) {
		var studentCnt = parseInt(this.studentCnt) + 1;
		this.studentCnt = studentCnt;

		var studentInfo = {}
		studentInfo.name = info.name;
		studentInfo.sex = parseInt(info.sex);
		studentInfo.school = info.school;
		studentInfo.department = info.department;
		studentInfo.graduationDate = info.graduationDate;
		studentInfo.profession = info.profession;
		studentInfo.city = info.city;
		studentInfo.email = info.email;

		// check the length of each field
		for (var key in studentInfo) {
			if (!studentInfo[key]) {
				throw new Error(`${key} is necessary, please set value for it`);
			}

			if (studentInfo[key].length > _LENGTH) {
				throw new Error(`${key} is too long, ${_LENGTH} is max`);
			}
		}

		// check sex
		if (!_isInArray(Object.values(_SEX), studentInfo.sex)) {
			throw new Error(`sex must between ${Object.values(_SEX)}`);
		}

		mylog('studentInfo.school', studentInfo.school);

		this.studentInfoMap.set(studentCnt, studentInfo);

		var schoolStudent = this.schoolStudentMap.get(studentInfo.school);
		mylog('schoolStudent1', schoolStudent);
		if (!schoolStudent) {
			var schoolCnt = this.schoolCnt + 1;
			this.schoolCnt = schoolCnt;
			this.schoolKeysMap.set(schoolCnt, studentInfo.school);

			schoolStudent = [studentCnt];
		} else {
			schoolStudent.push(studentCnt);
		}
		mylog('schoolStudent2', schoolStudent);
		this.schoolStudentMap.set(studentInfo.school, schoolStudent);
	},

	searchInfo: function(school) {
		if (!school) {
			throw new Error('school is necessary');
		}
		mylog('school in searchInfo', school);

		var schoolStudent = this.schoolStudentMap.get(school);
		mylog('searchInfo', 'schoolStudent', schoolStudent);
		var studentInfos = [];

		if (!schoolStudent) {
			return studentInfos;
		}
		for (var index = schoolStudent.length -1; index > -1; index--) {
			var key = schoolStudent[index];
			mylog('searchInfo', 'key', key);
			var studentInfo = this.studentInfoMap.get(key);
			mylog('searchInfo', 'studentInfo', studentInfo);
			studentInfos.push(studentInfo);
		}

		mylog('searchInfo', 'studentInfos', studentInfos);
		return studentInfos;
	},

	getSchools: function() {
		var schoolCnt = this.schoolCnt;
		var schools = [];
		for (var key = schoolCnt; key > 0; key--) {
			schools.push(this.schoolKeysMap.get(key));
		}

		return schools;
	}
}

module.exports = PickSchoolmate;