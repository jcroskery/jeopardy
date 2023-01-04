class FinalJeopardy {
    destroyFinalJeopardyScreen() {
        this.finalJeopardyDiv.parentNode.removeChild(this.finalJeopardyDiv);
    }
    destroyWagerScreen() {
        this.wagerDiv.parentNode.removeChild(this.wagerDiv);
    }
    constructWagerScreen() {
        this.wagerDiv = document.createElement("div");
        this.wagerDiv.classList = "wagerDiv";
        let playerSpan = document.createElement("span");
        playerSpan.innerText = "Team " + (this.playerArray[this.playerWagering] + 1);
        this.realAnswer = document.createElement("span");
        this.realAnswer.innerText = this.answerDisplayed ? stateMachine.gameboard.finalJeopardy.question : "Reveal Your Answer";

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

        this.wagerDiv.append(playerSpan, this.realAnswer, wagerAmountDiv, positiveNegativeDiv);
        document.getElementById("body").append(this.wagerDiv);
    }
    incrementWager(amount) {
        this.wager = Math.min(stateMachine.scores.scores[this.playerArray[this.playerWagering]], this.wager + amount);
        this.adjustWagerValue();
    }
    decrementWager(amount) {
        this.wager = Math.max(0, this.wager - amount);
        this.adjustWagerValue();
    }
    adjustWagerValue() {
        this.wagerAmount.innerText = this.wager;
    }
    finalizeWager(success) {
        this.wagerDiv.classList += success ? " correct" : " incorrect";
        if (success || this.playerWagering == 2) {
            this.answerDisplayed = true;
            this.realAnswer.innerText = stateMachine.gameboard.finalJeopardy.question;
        }
        this.success = success;
        this.wagerFinalized = true;
    }
    nextWager() {
        if (this.wagerFinalized) {
            stateMachine.scores.updateScore(this.playerArray[this.playerWagering], this.success ? this.wager : -this.wager);
            if (this.playerWagering == 2) {
                this.displayFinalScores();
            } else {
                this.playerWagering++;
                this.wager = 0;
                this.destroyWagerScreen();
                this.constructWagerScreen();
            }
        }
        this.wagerFinalized = false;
    }
    applyWagers() {
        this.destroyFinalJeopardyScreen();
        let scoreMap = stateMachine.scores.getScoreMap();
        this.playerArray = Array.from(scoreMap.keys()).reverse();
        this.playerWagering = 0;
        this.wager = 0;
        this.wagerFinalized = false;
        this.answerDisplayed = false;
        stateMachine.state = States.WAGER;
        this.constructWagerScreen();
    }
    displayFinalScores() {
        stateMachine.scores.createScoreScreen();
        stateMachine.state = States.SCORESCREEN;
    }
    triggerTimer() {
        document.getElementById("audio").play();
        setTimeout(() => {
            this.answerSpan.innerText = "Time's Up!";
            document.getElementById("audio").pause();
        }, 34000);
        stateMachine.state = States.FINALQUESTIONTIMER;
    }
    constructor() {
        this.finalJeopardyDiv = document.createElement("div");
        this.finalJeopardyDiv.id = "finalJeopardyDiv";
        let categorySpan = document.createElement("span");
        categorySpan.innerText = stateMachine.gameboard.finalJeopardy.category;
        let firstSeparator = document.createElement("hr");
        firstSeparator.classList = "questionSeparator";
        this.answerSpan = document.createElement("span");
        this.answerSpan.innerText = stateMachine.gameboard.finalJeopardy.answer;
        this.finalJeopardyDiv.append(categorySpan, firstSeparator, this.answerSpan);
        document.getElementById("body").append(this.finalJeopardyDiv);
        stateMachine.state = States.FINALQUESTION;
    }
}