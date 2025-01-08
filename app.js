const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('board');
const messageElement = document.getElementById('message');
const messageTextElement = document.getElementById('message-text');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const STORAGE_KEY = 'ticTacToeScores';


const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]             
];

const questions = [
    {
        question: "¿Cuál es la derivada de tangente?",
        answer: "sec^2",
        hint : "VAMOS TU PUEDES!!"
    },
    {
        question: "Resuelve la segunda derivada de 2x³ + X² - 16",
        answer: "12x+2",
        hint : "RECUERDA LO APRENDIDO"
    },
    {
        question: "¿Cuál es el método para resolver límites indeterminados más utilizado?",
        answer: "lhospital",
        hint : "RESPONDE Y VE POR TU REVANCHA"
    },
   
];

class GameState {
    constructor() {
        this.scores = this.loadScores();
        this.currentQuestion = null;
        this.circleTurn = false;
        this.gameActive = true;
    }

    loadScores() {
        const savedScores = localStorage.getItem(STORAGE_KEY);
        return savedScores ? JSON.parse(savedScores) : { X: 0, O: 0 };
    }

    saveScores() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        if (scoreElement) {
            scoreElement.textContent = `Puntuación - X: ${this.scores.X} | O: ${this.scores.O}`;
        }
    }

    resetGame() {
        this.gameActive = true;
        this.circleTurn = false;
        this.currentQuestion = this.getRandomQuestion();
        this.clearBoard();
        this.updateScoreDisplay();
    }

    getRandomQuestion() {
        return questions[Math.floor(Math.random() * questions.length)];
    }

    clearBoard() {
        cellElements.forEach(cell => {
            cell.classList.remove(X_CLASS, CIRCLE_CLASS);
            cell.removeEventListener('click', handleClick);
            cell.addEventListener('click', handleClick, { once: true });
        });
        setBoardHoverClass();
        messageElement.classList.add('hidden');
        messageTextElement.innerText = this.currentQuestion.question;
    }
}

const gameState = new GameState();

function handleClick(e) {
    if (!gameState.gameActive) return;

    const cell = e.target;
    const currentClass = gameState.circleTurn ? CIRCLE_CLASS : X_CLASS;

    placeMark(cell, currentClass);

    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
    }
}

async function endGame(draw) {
    gameState.gameActive = false;

    if (draw) {
        messageTextElement.innerText = '¡Empate!';
    } else {
        const winner = gameState.circleTurn ? 'O' : 'X';
        messageTextElement.innerText = `¡${winner} gana!`;
        gameState.scores[winner]++;
        gameState.saveScores();
    }
    
    messageElement.classList.remove('hidden');

    if (!draw) {
        const loser = gameState.circleTurn ? "X" : "O";
        await handleLoserPenalty(loser);
    }
}

async function handleLoserPenalty(loser) {
    return new Promise(resolve => {
        setTimeout(() => {
            const question = gameState.currentQuestion;
            let attempts = 0;
            const maxAttempts = 3;

            const tryAnswer = () => {
                attempts++;
                const problem = prompt(
                    `${loser}, ¡perdiste! Intento ${attempts}/${maxAttempts}\n` +
                    `Pregunta: ${question.question}\n` +
                    `Hint: ${question.hint}`
                );

                if (!problem) {
                    alert('¡Debes intentar responder!');
                    if (attempts < maxAttempts) tryAnswer();
                    else resolve();
                    return;
                }

                const isCorrect = problem.trim().toLowerCase() === question.answer.toLowerCase();
                
                if (isCorrect) {
                    alert(`¡Correcto! ¡Bien hecho!`);
                    resolve();
                } else if (attempts < maxAttempts) {
                    alert(`Incorrecto. Te quedan ${maxAttempts - attempts} intentos.`);
                    tryAnswer();
                } else {
                    alert(`Se acabaron los intentos. La respuesta correcta era: ${question.answer}`);
                    resolve();
                }
            };

            tryAnswer();
        }, 100);
    });
}

function isDraw() {
    return [...cellElements].every(cell => 
        cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    );
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    gameState.circleTurn = !gameState.circleTurn;
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS, CIRCLE_CLASS);
    board.classList.add(gameState.circleTurn ? CIRCLE_CLASS : X_CLASS);
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => 
        combination.every(index => 
            cellElements[index].classList.contains(currentClass)
        )
    );
}

restartButton.addEventListener('click', () => gameState.resetGame());
gameState.resetGame();
