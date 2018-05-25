"use strict";

var SurveyAnswer = function(answer){
    if(answer)
    {
        var obj = JSON.parse(answer);

        this.id = obj.id;
        this.surveyId = obj.surveyId;
        this.author = obj.author;
        this.value = obj.value;
    }
    else
    {
        this.id = "";
        this.surveyId = "";
        this.author = "";
        this.value = "";
    }
}

SurveyAnswer.prototype = {
    toString: function () {
		return JSON.stringify(this);
	}
}

var Survey = function(survey){

    if(survey)
    {
        var obj = JSON.parse(survey);

        this.id = obj.id;
        this.question = obj.question;
        this.answers = obj.answers;
        this.surveyAnswers = obj.surveyAnswers;
        this.currentAuthor = obj.currentAuthor;
    }
    else
    {
        this.id = "";
        this.question = "";
        this.answers = [];
        this.surveyAnswers = [];
        this.currentAuthor = "";
    }
}

Survey.prototype = {
    toString: function () {
		return JSON.stringify(this);
	}
}


var NSurveyContract = function () {

    LocalContractStorage.defineProperty(this, "totalSurveys");

    LocalContractStorage.defineMapProperty(this, "surveys", {
        parse: function (survey) {
            return new Survey(survey);
        },
        stringify: function (o) {
            return o.toString();
        }
    })

    LocalContractStorage.defineProperty(this, "totalSurveyAnswers");
    LocalContractStorage.defineMapProperty(this, "surveyAnswers", {
        parse: function (answer) {
            return new SurveyAnswer(answer);
        },
        stringify: function (o) {
            return o.toString();
        }
    })
};

NSurveyContract.prototype = {
    init: function() {
        this.totalSurveys= 0;
        this.totalSurveyAnswers = 0;
    },
    accept: function(){ },

    get:function(id){

        if(id === "") {
            throw new Error("Invalid Id");
        }

        var survey = this.surveys.get(id);

        if(!survey) {
            throw new Error("Survey not found");
        }

        return survey;
    },

    save: function(question, answers){

        if(question ===""){
            throw new Error("Invalid Question");
        }

        if(answers === undefined || answers.length < 2){
            throw new Error("Invalid Answers");
        }

        var survey = new Survey();

        survey.id = this.totalSurveys;
        survey.question = question;
        survey.answers = answers;

        this.surveys.put(survey.id, survey);

        this.totalSurveys = this.totalSurveys + 1;

        return survey;
    },

    list: function(){

        var surveys = [];
        var author = Blockchain.transaction.from;

        for (var i=0; i< this.totalSurveys; i++){

            var survey = this.surveys.get(i);

            if(survey){
                survey.currentAuthor = Blockchain.transaction.from;
                survey.surveyAnswers = this.listAnswers(survey.id);
                surveys.push(survey);
            }
        }

        return surveys;
    },

    listAnswers:function(surveyId){
        var answers = [];
        var author = Blockchain.transaction.from;

        for (var i=0; i< this.totalSurveyAnswers; i++){

            var answer = this.surveyAnswers.get(i);

            if(answer && answer.surveyId == surveyId){
                answers.push(answer);
            }
        }

        return answers;
    },
    
    getAnswer:function(id){
        if(id ==="") {
            throw new Error("Invalid Id");
        }

        var answer = this.surveyAnswers.get(id);

        if(answer ==="") {
            throw new Error("Answer not found");
        }


        return answer;
    },

    saveAnswer:function(surveyId, value){

        if(surveyId ===""){
            throw new Error("Invalid SurveyId");
        }

        if(value ===""){
            throw new Error("Invalid Value");
        }

        var author = Blockchain.transaction.from;

        var answer = new SurveyAnswer();

        answer.id = this.totalSurveyAnswers;
        answer.surveyId = surveyId;
        answer.author = author;
        answer.value = value;

        this.surveyAnswers.put(answer.id, answer);
        this.totalSurveyAnswers = this.totalSurveyAnswers + 1;

        return answer;
    }
};

module.exports = NSurveyContract;