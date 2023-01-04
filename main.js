const BASEVALUE = 200;

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
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
