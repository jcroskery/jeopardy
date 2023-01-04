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
