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
