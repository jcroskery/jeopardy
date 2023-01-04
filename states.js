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
