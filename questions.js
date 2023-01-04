class DailyDouble {
    increment() {
        if (this.state == "selectingTeam") {
            this.incrementTeam();
        } else if (this.state == "selectingWager") {
            this.adjustWager(10);
        }
    }
    decrement() {
        if (this.state == "selectingTeam") {
            this.decrementTeam();
        } else if (this.state == "selectingWager") {
            this.adjustWager(-10);
        }
    }
    adjustWager(amount) {  
        this.wager = clamp(this.wager + amount, 5, Math.max(this.maximum, stateMachine.scores.scores[this.selectedTeam]));
        this.wagerAmount.innerText = this.wager;
    }
    incrementTeam() {
        this.selectedTeam = clamp(this.selectedTeam + 1, 0, 2);
        this.refreshSelectedTeam();
    }
    decrementTeam() {
        this.selectedTeam = clamp(this.selectedTeam - 1, 0, 2);
        this.refreshSelectedTeam();
    }
    refreshSelectedTeam() {
        for(let i = 0; i < 3; i++) {
            if (i == this.selectedTeam) {
                this.teamSpans[i].classList += " selected";
            } else {
                this.teamSpans[i].classList.remove("selected");
            }
        }
    }
    displayAnswer(success) {
        this.state = "answeredQuestion";
        stateMachine.scores.updateScore(this.selectedTeam, success ? this.wager : -this.wager);
        this.doubleDiv.classList += success ? " correct" : " incorrect";
        this.separator.classList.remove("invisible");
        this.questionSpan.classList.remove("invisible");
    }
    answerIncorrect() {
        if (this.state == "answeringQuestion") {
            this.displayAnswer(false);
        }
    }
    answerCorrect() {
        if (this.state == "answeringQuestion") {
            this.displayAnswer(true);
        }
    }
    nextScreen() {
        if (this.state == "selectingTeam") {
            this.destroyScreen();
            this.displaySelectWager();
        } else if (this.state == "selectingWager") {
            this.destroyScreen();
            this.displayQuestion();
        } else if (this.state == "answeredQuestion") {
            this.destroyScreen();
            stateMachine.gameboard.backToBoard();
        }
    }
    displayQuestion() {
        this.state = "answeringQuestion";
        this.doubleDiv = document.createElement("div");
        this.doubleDiv.classList = "doubleDiv";

        let answerSpan = document.createElement("span");
        answerSpan.innerText = this.answer;
        answerSpan.id = "answerSpan";
        this.separator = document.createElement("hr");
        this.separator.classList = "questionSeparator invisible";
        this.questionSpan = document.createElement("span");
        this.questionSpan.id = "questionSpan";
        this.questionSpan.classList += " invisible";
        this.questionSpan.innerText = this.question;

        this.doubleDiv.append(answerSpan, this.separator, this.questionSpan);
        document.getElementById("body").append(this.doubleDiv);
    }
    displaySelectWager() {
        this.state = "selectingWager";
        this.doubleDiv = document.createElement("div");
        this.doubleDiv.classList = "doubleDiv";
        this.wager = 5;
        
        let categorySpan = document.createElement("span");
        categorySpan.innerText = this.category;

        let wagerAmountDiv = document.createElement("div");
        wagerAmountDiv.classList = "wagerAmountDiv";
        let wagerTitle = document.createElement("span");
        wagerTitle.innerText = "Wager: ";
        this.wagerAmount = document.createElement("span");
        this.wagerAmount.innerText = this.wager;
        wagerAmountDiv.append(wagerTitle, this.wagerAmount);

        let positiveNegativeDiv = document.createElement("div");
        positiveNegativeDiv.classList = "positiveNegativeDiv";
        let negativeSpan = document.createElement("span");
        negativeSpan.classList = "negative";
        negativeSpan.innerText = "-";
        positiveNegativeDiv.classList += " selected";
        let positiveSpan = document.createElement("span");
        positiveSpan.classList = "positive";
        positiveSpan.innerText = "+";
        positiveNegativeDiv.append(negativeSpan, positiveSpan);

        this.doubleDiv.append(categorySpan, wagerAmountDiv, positiveNegativeDiv);
        document.getElementById("body").append(this.doubleDiv);
    }
    destroyScreen() {
        this.doubleDiv.parentNode.removeChild(this.doubleDiv);
    }
    displaySelectTeam() {
        this.selectedTeam = clamp(stateMachine.gameboard.previousTeam, 0, 2);
        this.state = "selectingTeam";
        this.doubleDiv = document.createElement("div");
        this.doubleDiv.classList = "doubleDiv";
        let dailyDoubleSpan = document.createElement("span");
        dailyDoubleSpan.innerText = "Daily Double!";

        let teamSelectionDiv = document.createElement("div");
        this.teamSpans = [];
        for (let i = 0; i < 3; i++) {
            let teamSpan = document.createElement("span");
            teamSpan.innerText = "Team " + (i + 1);
            teamSpan.classList = "teamSpan";
            teamSelectionDiv.append(teamSpan);
            this.teamSpans.push(teamSpan);
        }
        this.refreshSelectedTeam();
        this.doubleDiv.append(dailyDoubleSpan, teamSelectionDiv);
        document.getElementById("body").append(this.doubleDiv);
    }
    constructor(answer, question, maximum, category) {
        this.category = category;
        this.answer = answer;
        this.question = question;
        this.maximum = maximum;
        this.displaySelectTeam();
    }
}

class Question {
    isCorrect() {
        this.revealQuestion();
        this.questionDiv.classList += " correct";
        stateMachine.state = States.CORRECT;
        stateMachine.scores.updateScore(this.answerer, this.value);
        this.correctAnswerer = this.answerer;
        stateMachine.gameboard.previousTeam = this.correctAnswerer;
    }

    buzzer(answerer) {
        stateMachine.state = States.ANSWERING;
        this.answererSpan.innerText = "Team " + (answerer + 1) + " has buzzed in";
        this.answerer = answerer;
    }

    isIncorrect() {
        this.questionDiv.classList += " incorrect";
        stateMachine.state = States.INCORRECT;
        stateMachine.scores.updateScore(this.answerer, -this.value);
        stateMachine.controls.blockPlayer(this.answerer);
    }

    resetQuestion() {
        stateMachine.state = States.WAITING;
        this.questionDiv.classList.remove("incorrect");
        this.answererSpan.innerText = "Waiting For Buzzers";
        if (stateMachine.controls.areAllPlayersBlocked()) {
            this.giveUp();
        }
    }

    revealQuestion() {
        this.secondSeparator.classList.remove("invisible");
        this.questionSpan.classList.remove("invisible");
    }

    displayJoyconSelector() {
        this.firstSeparator.classList.remove("invisible");
        this.answererSpan.classList.remove("invisible");
        stateMachine.state = States.WAITING;
    }

    destroyQuestion() {
        this.questionDiv.parentNode.removeChild(this.questionDiv);
        stateMachine.controls.unblockPlayers();
    }

    giveUp() {
        stateMachine.state = States.GAVEUP;
        this.answererSpan.innerText = "No Team";
        this.revealQuestion();
    }

    backToBoard() {
        this.destroyQuestion();
        stateMachine.gameboard.backToBoard();
    }

    constructor(answer, question, value, category) {
        this.correctAnswerer = -1;
        this.category = category;
        this.value = value;
        this.questionDiv = document.createElement("div");
        this.questionDiv.classList = "questionDiv";

        let answerSpan = document.createElement("span");
        answerSpan.innerText = answer;
        answerSpan.id = "answerSpan";
        this.firstSeparator = document.createElement("hr");
        this.firstSeparator.classList = "questionSeparator invisible";
        this.answererSpan = document.createElement("span");
        this.answererSpan.id = "answererSpan";
        this.answererSpan.classList = "invisible";
        this.answererSpan.innerText = "Waiting For Buzzers";
        this.secondSeparator = document.createElement("hr");
        this.secondSeparator.classList = "questionSeparator invisible";
        this.questionSpan = document.createElement("span");
        this.questionSpan.id = "questionSpan";
        this.questionSpan.classList += " invisible";
        this.questionSpan.innerText = question;
        this.questionDiv.append(answerSpan, this.firstSeparator, this.answererSpan, this.secondSeparator, this.questionSpan);
        document.getElementById("body").append(this.questionDiv);
    }
}
