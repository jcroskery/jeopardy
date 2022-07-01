const BASEVALUE = 200;

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

class InnerNode {
    setActive() {
        this.node.classList += " active";
    }
    setInactive() {
        this.node.classList.remove("active");
    }
    spawnQuestion() {
        if (this.isADailyDouble) {
            stateMachine.state = States.DAILYDOUBLE;
            stateMachine.dailyDouble = new DailyDouble(this.answer, this.question, BASEVALUE * this.doubleFactor * 5, this.category);
        } else {
            stateMachine.state = States.QUESTION;
            stateMachine.question = new Question(this.answer, this.question, this.value);
        }
    }
    greyOutQuestion() {
        this.node.classList += " fadedDiv";
        this.span.classList += " fadedSpan";
    }
    constructor(i, answer, question, doubleFactor, isADailyDouble, category) {
        this.category = category;
        this.doubleFactor = doubleFactor;
        this.value = (i + 1) * BASEVALUE * doubleFactor;
        this.question = question;
        this.answer = answer;
        this.node = document.createElement("div");
        this.node.classList = "rectangle";
        this.span = document.createElement("span");
        this.span.classList = "pointsSpan";
        this.span.innerText = this.value;
        this.node.append(this.span);
        this.completed = false;
        this.isADailyDouble = isADailyDouble;
    }
}

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

class GameBoard {
    moveFocus(dx, dy) {
        if (stateMachine.state == States.BOARD) {
            this.setFocus(clamp(dx + this.focusX, 0, 4), clamp(dy + this.focusY, 0, 4));
        }
    }
    setFocus(x, y) {
        if (this.focusX !== undefined && this.focusY !== undefined) {
            this.answerRows[this.focusX][this.focusY].setInactive();
        }
        this.answerRows[x][y].setActive();
        this.focusX = x;
        this.focusY = y;
    }
    selectQuestion() {
        this.answerRows[this.focusX][this.focusY].spawnQuestion();
    }
    greyOutActiveQuestion() {
        this.answerRows[this.focusX][this.focusY].greyOutQuestion();
        this.questionStates[this.focusX][this.focusY] = 1;
    }
    areAllQuestionsAnswered() {
        let response = true;
        this.questionStates.forEach((arr) => {
            arr.forEach((i) => {
                if (i == 0) {
                    response = false;
                }
            });
        });
        return response;
    }
    backToBoard() {
        stateMachine.state = States.BOARD;
        this.greyOutActiveQuestion();
        if (this.areAllQuestionsAnswered()) {
            stateMachine.state = States.SCORESCREEN;
            stateMachine.scores.createScoreScreen();
        }
    }
    initBoard(boardNumber) {
        this.previousTeam = -1;
        this.parentDiv = document.getElementById("gameDiv");
        this.tableNode = document.createElement("div");
        this.tableNode.id = "tableDiv";
        this.parentDiv.append(this.tableNode);
        this.rows = [];
        this.answerRows = [];
        let isADailyDouble = Array(5).fill().map(a => Array(5).fill(false));
        for(let i = 0; i <= boardNumber; i++) {
            let j = Math.floor(Math.random() * 5);
            let k = 2 + Math.floor(Math.random() * 3);
            if (isADailyDouble[j][k]) {
                i--;
            } else {
                isADailyDouble[j][k] = true;
            }
        }
        [...Array(5).keys()].forEach((i) => {
            let rowNode = document.createElement("div");
            rowNode.classList = "rowDiv";
            let row = [];

            let answerRowNode = document.createElement("div");
            answerRowNode.classList = "answerRowDiv";
            let answerRow = [];
            if (i == 0) {
                answerRowNode.classList += " left";
            } else if (i == 4) {
                answerRowNode.classList += " right";
            }

            let titleNode = document.createElement("div");
            titleNode.classList = "category";
            titleNode.innerText = this.boardDescription.boards[boardNumber].categories[i].name;
            rowNode.append(titleNode);
            row.push(titleNode);

            rowNode.append(answerRowNode);
            row.push(answerRow);

            [...Array(5).keys()].forEach((j) => {
                let innerNode = new InnerNode(j, this.boardDescription.boards[boardNumber].categories[i].content[j][0], this.boardDescription.boards[boardNumber].categories[i].content[j][1], boardNumber + 1, isADailyDouble[i][j], this.boardDescription.boards[boardNumber].categories[i].name);
                answerRowNode.append(innerNode.node);
                answerRow.push(innerNode);
            });

            this.tableNode.append(rowNode);
            this.rows.push(row);
            this.answerRows.push(answerRow);
        });
        this.setFocus(0, 0);
        this.questionStates = Array(5).fill().map(a => Array(5).fill(0));
    }
    destroyGameboard() {
        this.tableNode.parentNode.removeChild(this.tableNode);
    }
    constructor(boardDescription) {
        this.boardDescription = boardDescription;
        this.initBoard(0);
        document.getElementById("title").innerText = boardDescription.name;
        this.finalJeopardy = boardDescription.finalJeopardy;
        beginGame();
    }
}

class States {
    static NEWGAME = new States("newgame");
    static BOARD = new States("board");
    static QUESTION = new States("question");
    static WAITING = new States("waiting");
    static ANSWERING = new States("answering");
    static INCORRECT = new States("incorrect");
    static CORRECT = new States("correct");
    static GAVEUP = new States("gaveup");
    static SCORESCREEN = new States("scorescreen");
    static FINALQUESTION = new States("finalquestion");
    static FINALQUESTIONTIMER = new States("finalquestiontimer");
    static WAGER = new States("wager");
    static DAILYDOUBLE = new States("dailydouble");

    constructor(state) {
        this.state = state;
    }
}

class Phases {
    static FIRSTBOARD = new Phases("firstboard");
    static SECONDBOARD = new Phases("secondboard");
    static WAGER = new Phases("wager");
    static FINALJEOPARDY = new Phases("finaljeopardy");


    static nextPhase() {
        if (stateMachine.phase == Phases.FIRSTBOARD) {
            stateMachine.state = States.BOARD;
            stateMachine.phase = Phases.SECONDBOARD;
            stateMachine.scores.destroyScoreScreen();
            stateMachine.gameboard.destroyGameboard();
            stateMachine.gameboard.initBoard(1);
        } else if (stateMachine.phase == Phases.SECONDBOARD) {
            stateMachine.phase = Phases.WAGER;
            stateMachine.scores.destroyScoreScreen();
            stateMachine.gameboard.destroyGameboard();
            stateMachine.scores.createScoreScreen();
        } else if (stateMachine.phase == Phases.WAGER) {
            stateMachine.phase = Phases.FINALJEOPARDY;
            stateMachine.scores.destroyScoreScreen();
            stateMachine.finalJeopardy = new FinalJeopardy();
        }
    }

    constructor(phase) {
        this.phase = phase;
    }
}

class Controls {
    checkForEvents() {
        this.gamePadConnected();
        if (this.mainController !== null) {
            for (let i = 0; i < this.mainController.buttons.length; i++) {
                if (this.mainControllerStatus.length > i) {
                    if (this.mainControllerStatus[i] != this.mainController.buttons[i].pressed) {
                        this.fireProEvent(i, this.mainController.buttons[i].pressed);
                        this.mainControllerStatus[i] = this.mainController.buttons[i].pressed;
                    }
                } else {
                    this.mainControllerStatus.push(this.mainController.buttons[i].pressed);
                }
            }
        }
        for (let i = 0; i < 3; i++) {
            if (this.playerControllers.length > i && this.playerControllers[i] !== undefined) {
                for (let j = 0; j < this.playerControllers[i].buttons.length; j++) {
                    if (this.playerControllersStatus[i].length > j) {
                        if (this.playerControllersStatus[i][j] != this.playerControllers[i].buttons[j].pressed) {
                            this.fireJoyconEvent(i, j, this.playerControllers[i].buttons[j].pressed);
                            this.playerControllersStatus[i][j] = this.playerControllers[i].buttons[j].pressed;
                        }
                    } else {
                        this.playerControllersStatus[i].push(this.playerControllers[i].buttons[j].pressed);
                    }
                }
            }
        }
    }

    fireJoyconEvent(i, j, status) {
        if (status) {
            console.log("Joycon " + i + " fired button " + j);
            if (stateMachine.state != States.WAITING) {
                if (this.joyconTimeouts[i] !== null) {
                    clearTimeout(this.joyconTimeouts[i]);
                }
                this.joyconLocks[i] = 1;
                this.joyconTimeouts[i] = setTimeout(() => {
                    this.joyconLocks[i] = 0;
                }, 1000);
            } else if (this.joyconLocks[i] == 0 && this.joyconBlocks[i] == 0) {
                Controls.vibrateController(this.playerControllers[i]);
                stateMachine.question.buzzer(i);
            }
        }
    }

    areAllPlayersBlocked() {
        return JSON.stringify(this.joyconBlocks) == JSON.stringify(Array(3).fill(1));
    }

    blockPlayer(i) {
        this.joyconBlocks[i] = 1;
    }

    unblockPlayers() {
        this.joyconBlocks = [0, 0, 0];
    }

    fireProEvent(i, status) {
        if (status) {
            switch (i) {
                case 13:
                    console.log("Down");
                    stateMachine.gameboard.moveFocus(0, 1);
                    break;
                case 14:
                    console.log("Left");
                    stateMachine.gameboard.moveFocus(-1, 0);
                    break;
                case 15:
                    console.log("Right");
                    stateMachine.gameboard.moveFocus(1, 0);
                    break;
                case 12:
                    console.log("Up");
                    stateMachine.gameboard.moveFocus(0, -1);
                    break;
                case 9:
                    console.log("Increment");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.incrementWager(100);
                    } else if (stateMachine.state == States.DAILYDOUBLE && stateMachine.dailyDouble.state == "selectingWager") {
                        stateMachine.dailyDouble.adjustWager(100);
                    } else {
                        stateMachine.scores.updateSelectedScore(200);
                    }
                    break;
                case 8:
                    console.log("Decrement");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.decrementWager(100);
                    } else if (stateMachine.state == States.DAILYDOUBLE && stateMachine.dailyDouble.state == "selectingWager") {
                        stateMachine.dailyDouble.adjustWager(-100);
                    } else {
                        stateMachine.scores.updateSelectedScore(-200);
                    }
                    break;
                case 1:
                    console.log("Select");
                    if (stateMachine.state == States.BOARD) {
                        stateMachine.gameboard.selectQuestion();
                    } else if (stateMachine.state == States.QUESTION) {
                        stateMachine.question.displayJoyconSelector();
                    } else if (stateMachine.state == States.INCORRECT) {
                        stateMachine.question.resetQuestion();
                    } else if (stateMachine.state == States.GAVEUP || stateMachine.state == States.CORRECT) {
                        stateMachine.question.backToBoard();
                    } else if (stateMachine.state == States.SCORESCREEN) {
                        Phases.nextPhase();
                    } else if (stateMachine.state == States.FINALQUESTION) {
                        stateMachine.finalJeopardy.triggerTimer();
                    } else if (stateMachine.state == States.FINALQUESTIONTIMER) {
                        stateMachine.finalJeopardy.applyWagers();
                    } else if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.nextWager();
                    } else if (stateMachine.state == States.DAILYDOUBLE) {
                        stateMachine.dailyDouble.nextScreen();
                    }
                    break;
                case 0:
                    console.log("Back");
                    if (stateMachine.state == States.QUESTION || stateMachine.state == States.WAITING || stateMachine.state == States.GAVEUP || stateMachine.state == States.CORRECT || stateMachine.state == States.ANSWERING) {
                        stateMachine.question.backToBoard();
                    }
                    break;
                case 3:
                    console.log("Incorrect");
                    if (stateMachine.state == States.ANSWERING) {
                        stateMachine.question.isIncorrect();
                    } else if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.finalizeWager(false);
                    } else if (stateMachine.state == States.DAILYDOUBLE) {
                        stateMachine.dailyDouble.answerIncorrect();
                    }
                    break;
                case 2:
                    console.log("Correct")
                    if (stateMachine.state == States.ANSWERING) {
                        stateMachine.question.isCorrect();
                    } else if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.finalizeWager(true);
                    } else if (stateMachine.state == States.DAILYDOUBLE) {
                        stateMachine.dailyDouble.answerCorrect();
                    }
                    break;
                case 4:
                    console.log("Auxiliary Incrementer Left");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.decrementWager(10);
                    } else if (stateMachine.state == States.DAILYDOUBLE) {
                        stateMachine.dailyDouble.decrement();
                    }
                    break;
                case 5:
                    console.log("Auxiliary Incrementer Right");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.incrementWager(10);
                    } else if (stateMachine.state == States.DAILYDOUBLE) {
                        stateMachine.dailyDouble.increment();
                    }
                    break;
                case 6:
                    console.log("Incrementer Left");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.decrementWager(1);
                    } else if (stateMachine.state == States.DAILYDOUBLE && stateMachine.dailyDouble.state == "selectingWager") {
                        stateMachine.dailyDouble.adjustWager(-1);
                    } else {
                        stateMachine.scores.moveSelectedScore(-1);
                    }
                    break;
                case 7:
                    console.log("Incrementer Right");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.incrementWager(1);
                    } else if (stateMachine.state == States.DAILYDOUBLE && stateMachine.dailyDouble.state == "selectingWager") {
                        stateMachine.dailyDouble.adjustWager(1);
                    } else {
                        stateMachine.scores.moveSelectedScore(1);
                    }
                    break;
                case 16:
                    console.log("Give Up");
                    if (stateMachine.state == States.WAITING) {
                        stateMachine.question.giveUp();
                    } else if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.incrementWager(1000);
                    } else if (stateMachine.state == States.DAILYDOUBLE && stateMachine.dailyDouble.state == "selectingWager") {
                        stateMachine.dailyDouble.adjustWager(1000);
                    }
                    break;
                case 17:
                    console.log("Big decrement");
                    if (stateMachine.state == States.WAGER) {
                        stateMachine.finalJeopardy.decrementWager(1000);
                    } else if (stateMachine.state == States.DAILYDOUBLE && stateMachine.dailyDouble.state == "selectingWager") {
                        stateMachine.dailyDouble.adjustWager(-1000);
                    }
                    break;
                default:
                    console.log(i);
            }
        }
    }

    gamePadConnected() {
        let mainController = null;
        let playerControllers = [];
        navigator.getGamepads().forEach((gamepad) => {
            if (gamepad !== null) {
                if (gamepad.id.includes("057e") && gamepad.id.includes("2009")) { //This is a Pro Controller
                    mainController = gamepad;
                } else if (gamepad.id.includes("057e") && gamepad.id.includes("2007")) { //This is a JoyCon
                    playerControllers.push(gamepad);
                }
            }
        });
        this.mainController = mainController;
        this.playerControllers = playerControllers;
        this.updateJoyconDisplay(mainController, playerControllers);
        if (mainController !== null && playerControllers.length == 3) {
            this.ready = true;
            beginGame();
        } else {
            this.ready = false;
        }

    }
    static vibrateController(gamepad) {
        if (gamepad !== null) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: 500,
                weakMagnitude: 1.0,
                strongMagnitude: 1.0,
            });
        }
    }
    static updateElemConnection(e, connected) {
        e.classList.remove(connected ? "disconnected" : "connected");
        e.classList += connected ? " connected" : " disconnected";
    }
    updateJoyconDisplay(mainController, playerControllers) {
        if (mainController !== null) {
            Controls.updateElemConnection(this.proDiv, true);
        } else {
            Controls.updateElemConnection(this.proDiv, false);
        }
        [...Array(3).keys()].forEach((i) => {
            if (playerControllers.length > i && playerControllers[i] !== null) {
                Controls.updateElemConnection(this.joyconDivs[i], true);
            } else {
                Controls.updateElemConnection(this.joyconDivs[i], false);
            }
        });

    }
    addJoyconDisplay() {
        //Display JoyCon Connection Dialogue
        let teamsDiv = document.getElementById("teamsDiv");

        this.proDiv = document.createElement("div");
        this.proDiv.id = "proDiv";
        let proTitle = document.createElement("span");
        proTitle.innerText = "Pro Con";
        this.proDiv.append(proTitle);
        this.proDiv.addEventListener("click", () => Controls.vibrateController(this.mainController));

        let playersDiv = document.createElement("div");
        playersDiv.id = "playersDiv";
        this.joyconDivs = [];
        [...Array(3).keys()].forEach((i) => {
            let playerDiv = document.createElement("div");
            playerDiv.classList += " playerDiv";

            let joyconTitle = document.createElement("span");
            joyconTitle.innerText = "Con " + (i + 1);
            playerDiv.append(joyconTitle);
            playersDiv.append(playerDiv);
            this.joyconDivs.push(playerDiv);
            playerDiv.addEventListener("click", () => {
                if (this.playerControllers.length > i) {
                    Controls.vibrateController(this.playerControllers[i]);
                }
            });
        });

        teamsDiv.insertBefore(this.proDiv, teamsDiv.firstChild);
        teamsDiv.append(playersDiv);

        this.gamePadConnected();
    }
    constructor() {
        this.joyconLocks = [0, 0, 0];
        this.joyconBlocks = [0, 0, 0];
        this.joyconTimeouts = [null, null, null];
        this.mainController = null;
        this.playerControllers = [];
        this.addJoyconDisplay();
        this.ready = false;
        window.addEventListener("gamepadconnected", ev => this.gamePadConnected());
        this.mainControllerStatus = [];
        this.playerControllersStatus = [[], [], []];
        setInterval(() => this.checkForEvents(), 20);
    }
}

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

let stateMachine = {
    state: States.NEWGAME,
    scores: new Scores(),
    controls: new Controls(),
    gameboard: null,
    question: null,
    phase: Phases.FIRSTBOARD,
    finalJeopardy: null,
    dailyDouble: null,
}

function beginGame() {
    if (stateMachine.state == States.NEWGAME && stateMachine.controls.ready) {
        stateMachine.state = States.BOARD;
    }
}

function getGameboard(url) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let gameBoardDescription = JSON.parse(this.responseText);
            stateMachine.gameboard = new GameBoard(gameBoardDescription);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

getGameboard("jeopardy.json");
