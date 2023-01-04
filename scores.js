class Scores {
    getColourClass(i) {
        if (i == 0) {
            return "gold";
        } else if (i == 1) {
            return "silver";
        } else if (i == 2) {
            return "bronze";
        }
    }
    getScoreMap() {
        let scoreMap = new Map();
        for (let i = 0; i < 3; i++) {
            scoreMap.set(i, this.scores[i]);
        }
        return new Map([...scoreMap.entries()].sort((a, b) => b[1] - a[1]));
    }
    createScoreScreen() {
        this.scoreScreenDiv = document.createElement("div");
        this.scoreScreenDiv.id = "scoreScreenDiv";
        let titleSpan = document.createElement("span");
        titleSpan.innerText = (() => {
            if (stateMachine.phase == Phases.FIRSTBOARD) {
                return "Round 1 Scores";
            } else if (stateMachine.phase == Phases.SECONDBOARD) {
                return "Round 2 Scores";
            } else if (stateMachine.phase == Phases.WAGER) {
                return "The Category is \"" + stateMachine.gameboard.finalJeopardy.category + "\".";
            } else if (stateMachine.phase == Phases.FINALJEOPARDY) {
                return "Final Scores:";
            }
        })();
        this.scoreScreenDiv.append(titleSpan);

        this.scoreScreenScores = [];
        let scoreMap = this.getScoreMap();
        let i = 0;
        let previousValue = null;
        for (let [key, value] of scoreMap.entries()) {
            if (previousValue !== null && value < previousValue) {
                i++;
            }
            let playerScoreDiv = document.createElement("span");
            playerScoreDiv.classList = "playerScoreDiv " + this.getColourClass(i);
            let playerTitleSpan = document.createElement("span");
            playerTitleSpan.classList = "playerTitleSpan";
            playerTitleSpan.innerText = "Team " + (key + 1) + ": ";
            let playerScoreSpan = document.createElement("span");
            playerScoreSpan.classList = "playerScoreSpan";
            playerScoreSpan.innerText = value;
            this.scoreScreenScores.push(playerScoreSpan);
            playerScoreDiv.append(playerTitleSpan, playerScoreSpan);
            this.scoreScreenDiv.append(playerScoreDiv);
            previousValue = value;
        }
        let extraMessageSpan = document.createElement("span");
        extraMessageSpan.innerText = (() => {
            if (stateMachine.phase == Phases.FIRSTBOARD) {
                return "Next Round is Worth Double Points!";
            } else if (stateMachine.phase == Phases.SECONDBOARD) {
                return "Get Ready for Final Jeopardy!";
            } else if (stateMachine.phase == Phases.WAGER) {
                return "Write Down Your Wagers Now!"
            } else if (stateMachine.phase == Phases.FINALJEOPARDY) {
                return "Thanks for playing!";
            }
        })();
        this.scoreScreenDiv.append(extraMessageSpan);
        document.getElementById("body").append(this.scoreScreenDiv);
    }

    destroyScoreScreen() {
        this.scoreScreenDiv.parentNode.removeChild(this.scoreScreenDiv);
    }

    moveSelectedScore(dp) {
        this.selectScore(clamp(dp + this.playerSelectedScore, 0, 2));
    }

    selectScore(player) {
        if (this.playerSelectedScore !== undefined) {
            this.controlDivs[this.playerSelectedScore].classList.remove("selected");
        }
        this.playerSelectedScore = player;
        this.controlDivs[player].classList += " selected";
    }

    updateSelectedScore(deltaScore) {
        this.updateScore(this.playerSelectedScore, deltaScore);
    }

    updateScore(player, deltaScore) {
        this.scores[player] += deltaScore;
        this.scoreNodes[player].innerText = this.scores[player];
        if (stateMachine.state == States.SCORESCREEN) {
            this.destroyScoreScreen();
            this.createScoreScreen();
        }
        return this.scores[player];
    }

    constructor() {
        this.scores = [0, 0, 0];
        this.scoreNodes = [];
        this.controls = [];
        let teamsDiv = document.getElementById("teamsDiv");
        this.scoresDiv = document.createElement("div");
        this.scoresDiv.id = "scoresDiv";
        this.controlDivs = [];
        [...Array(3).keys()].forEach((i) => {
            let scoreDiv = document.createElement("div");
            scoreDiv.classList += " scoreDiv";

            let scoreTitleNode = document.createElement("span");
            scoreTitleNode.classList += " scoreTitle";
            scoreTitleNode.innerText = "Team " + (i + 1);

            let scoreSpanNode = document.createElement("span");
            scoreSpanNode.classList += " scoreSpan";
            scoreSpanNode.innerText = this.scores[i];

            let controlsDiv = document.createElement("div");
            controlsDiv.classList += " controlsDiv";

            let positive = document.createElement("span");
            positive.classList += " positive";
            positive.innerText = "+";
            let negative = document.createElement("span");
            negative.classList += " negative";
            negative.innerText = "-";
            controlsDiv.append(positive, negative);

            scoreDiv.append(scoreTitleNode, scoreSpanNode, controlsDiv);

            this.scoresDiv.append(scoreDiv);
            this.scoreNodes.push(scoreSpanNode);
            this.controls.push([positive, negative]);
            this.controlDivs.push(controlsDiv);
        });
        teamsDiv.append(this.scoresDiv);
        this.selectScore(0);
    }
}
