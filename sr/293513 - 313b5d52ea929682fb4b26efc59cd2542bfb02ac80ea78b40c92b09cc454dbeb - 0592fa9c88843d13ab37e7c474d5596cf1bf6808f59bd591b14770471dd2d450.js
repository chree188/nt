"use strict";

class UserQuestion {
	constructor(text) {
		let obj = text ? JSON.parse(text) : {};
		this.id = obj.id || 0;
		this.date = obj.date;
		this.question = obj.question;
		this.answer = obj.answer;
	}

	toString() {
		return JSON.stringify(this);
	}
}

class ballContract {
	constructor() {
		LocalContractStorage.defineProperty(this, "questionCount");
		LocalContractStorage.defineProperty(this, "answerCount");
		LocalContractStorage.defineProperty(this, "userQuestionCount");
		LocalContractStorage.defineMapProperty(this, "questions");
		LocalContractStorage.defineMapProperty(this, "answers");
		LocalContractStorage.defineMapProperty(this, "userQuestions", {
			parse: function (text) {
				return new UserQuestion(text);
			},
			stringify: function (o) {
				return o.toString();
			}
		});
	}

	init() {
		this.questionCount = 1;
		this.answerCount = 1;
		this.userQuestionCount = 1;

		this.addAnswer("It is certain");
		this.addAnswer("It is decidedly so");
		this.addAnswer("Without a doubt");
		this.addAnswer(" Yes — definitely");
		this.addAnswer("You may rely on it");
		this.addAnswer("As I see it, yes");
		this.addAnswer("Most likely");
		this.addAnswer("Outlook good");
		this.addAnswer("Signs point to yes");
		this.addAnswer("Yes");
		this.addAnswer("Reply hazy, try again");
		this.addAnswer("Ask again later");
		this.addAnswer("Better not tell you now");
		this.addAnswer("Cannot predict now");
		this.addAnswer("Concentrate and ask again");
		this.addAnswer("Don’t count on it");
		this.addAnswer("My reply is no");
		this.addAnswer("My sources say no");
		this.addAnswer("Outlook not so good");
		this.addAnswer("Very doubtful");
	}

	totalQuestion() {
		return new BigNumber(this.questionCount).minus(1).toNumber();
	}

	totalAnswer() {
		return new BigNumber(this.answerCount).minus(1).toNumber();
	}

	ask(question) {
		let index = new BigNumber(this.questionCount).toNumber();

		let userQuestion = new UserQuestion();
		userQuestion.id = index;
		userQuestion.date = Date.now();
		userQuestion.question = question;
		userQuestion.answer = this.getRandomAnswer();

		this.questions.put(index, question);
		this.userQuestions.put(this.userQuestionCount, userQuestion);

		this.userQuestionCount = new BigNumber(this.userQuestionCount).plus(1);
		this.questionCount = new BigNumber(this.questionCount).plus(1);

		return userQuestion.answer;
	}

	getRandomAnswer() {
		let index = new BigNumber(this.answerCount).toNumber();
		let randomIndex = Math.floor(Math.random() * index + 1);

		return this.answers.get(randomIndex);
	}

	addAnswer(answer) {
		let index = new BigNumber(this.answerCount).toNumber();
		this.answers.put(index, answer);
		this.answerCount = new BigNumber(this.answerCount).plus(1);
	}

	getUserQuestions(limit, offset) {
		limit = new BigNumber(limit);
		offset = new BigNumber(offset);

		let arr = [];
		for (let i = offset; i < limit.plus(offset); i = i.plus(1)) {
			let index = i.toNumber();
			let uq = this.userQuestions.get(index);
			if (uq) {
				arr.push(uq);
			}
		}

		return arr;
	}

}

module.exports = ballContract;