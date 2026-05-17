(function () {
  "use strict";

  var boardSize = 5;
  var targetScore = 5;
  var multiplierMax = 10;
  var confettiDuration = 3000;
  var games = [
    { id: "maze", name: "maaltafeldoolhof", enabled: false },
    { id: "bros", name: "maaltafel bros", enabled: false },
    { id: "four-row", name: "4 maaltafels op een rij", enabled: true }
  ];

  var screens = {
    games: document.getElementById("screen-games"),
    tables: document.getElementById("screen-tables"),
    play: document.getElementById("screen-play"),
    finish: document.getElementById("screen-finish")
  };

  var gameGrid = document.getElementById("game-grid");
  var tablesGrid = document.getElementById("tables-grid");
  var readyButton = document.getElementById("tables-ready");
  var boardElement = document.getElementById("board");
  var scoreBox = document.getElementById("score-box");
  var answerForm = document.getElementById("answer-form");
  var answerInput = document.getElementById("answer-input");
  var answerButton = document.getElementById("answer-button");
  var backButton = document.getElementById("back-button");
  var winLine = document.getElementById("win-line");
  var confettiLayer = document.getElementById("confetti-layer");
  var homeButton = document.getElementById("home-button");
  var retryButton = document.getElementById("retry-button");

  var selectedTables = [];
  var board = [];
  var score = 0;
  var activeCell = null;
  var isResetting = false;
  var recentProblemKeys = [];
  var confettiTimer = null;

  function showScreen(name) {
    Object.keys(screens).forEach(function (screenName) {
      screens[screenName].classList.toggle("is-active", screenName === name);
    });

    if (name === "play") {
      answerInput.focus();
    }
  }

  function renderGames() {
    gameGrid.innerHTML = "";

    games.forEach(function (game) {
      var button = document.createElement("button");
      button.className = "game-card";
      button.type = "button";
      button.textContent = game.name;
      button.disabled = !game.enabled;
      button.setAttribute("aria-disabled", String(!game.enabled));

      if (game.enabled) {
        button.addEventListener("click", function () {
          showScreen("tables");
        });
      }

      gameGrid.appendChild(button);
    });
  }

  function renderTables() {
    tablesGrid.innerHTML = "";

    for (var table = 1; table <= 12; table += 1) {
      var button = document.createElement("button");
      button.className = "table-option";
      button.type = "button";
      button.textContent = String(table);
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", function () {
        var value = Number(this.textContent);
        var selectedIndex = selectedTables.indexOf(value);

        if (selectedIndex === -1) {
          selectedTables.push(value);
        } else {
          selectedTables.splice(selectedIndex, 1);
        }

        selectedTables.sort(function (a, b) {
          return a - b;
        });
        this.classList.toggle("is-selected", selectedIndex === -1);
        this.setAttribute("aria-pressed", String(selectedIndex === -1));
        readyButton.disabled = selectedTables.length === 0;
      });

      tablesGrid.appendChild(button);
    }
  }

  function makeEmptyCell() {
    return {
      problem: "",
      answer: null,
      key: "",
      state: "empty",
      showAnswer: false
    };
  }

  function startGame() {
    score = 0;
    recentProblemKeys = [];
    stopConfetti();
    resetBoard();
    updateScore();
    showScreen("play");
  }

  function resetBoard() {
    board = [];
    activeCell = null;
    isResetting = false;
    hideWinLine();

    for (var index = 0; index < boardSize * boardSize; index += 1) {
      board.push(makeEmptyCell());
    }

    answerInput.value = "";
    renderBoard();
  }

  function renderBoard() {
    boardElement.innerHTML = "";

    board.forEach(function (cell, index) {
      var button = document.createElement("button");
      button.className = "cell";
      button.type = "button";
      button.dataset.index = String(index);
      renderCellContent(button, cell);

      if (index === activeCell) {
        button.classList.add("is-active");
      }

      if (cell.state === "correct") {
        button.classList.add("is-correct", "is-locked");
      }

      if (cell.state === "wrong") {
        button.classList.add("is-wrong");
      }

      if (cell.state === "correct" || cell.state === "wrong" || isResetting) {
        button.disabled = true;
      }

      button.addEventListener("click", function () {
        chooseCell(index);
      });

      boardElement.appendChild(button);
    });
  }

  function renderCellContent(button, cell) {
    button.textContent = "";

    if (!cell.problem) {
      return;
    }

    var problemText = document.createElement("span");
    problemText.textContent = cell.problem;
    button.appendChild(problemText);

    if (cell.state === "wrong" && cell.showAnswer) {
      var answerText = document.createElement("span");
      answerText.className = "cell-answer";
      answerText.textContent = "= " + cell.answer;
      button.appendChild(answerText);
    }
  }

  function chooseCell(index) {
    if (isResetting || board[index].state === "correct" || board[index].state === "wrong") {
      return;
    }

    hideWrongAnswers();

    if (!board[index].problem) {
      board[index] = createProblemCell();
    }

    activeCell = index;
    answerInput.value = "";
    renderBoard();
    answerInput.focus();
  }

  function createProblemCell() {
    var problem = pickProblem();

    return {
      problem: problem.table + " x " + problem.multiplier,
      answer: problem.table * problem.multiplier,
      key: problem.key,
      state: "open",
      showAnswer: false
    };
  }

  function pickProblem() {
    var table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    var multiplier = Math.floor(Math.random() * multiplierMax) + 1;
    var problem = {
      table: table,
      multiplier: multiplier,
      key: table + "x" + multiplier
    };

    if (wouldBeThirdRepeat(problem.key)) {
      problem = pickDifferentProblem(problem.key);
    }

    rememberProblem(problem.key);
    return problem;
  }

  function pickDifferentProblem(blockedKey) {
    var options = [];

    selectedTables.forEach(function (table) {
      for (var multiplier = 1; multiplier <= multiplierMax; multiplier += 1) {
        var key = table + "x" + multiplier;

        if (key !== blockedKey) {
          options.push({
            table: table,
            multiplier: multiplier,
            key: key
          });
        }
      }
    });

    return options[Math.floor(Math.random() * options.length)];
  }

  function wouldBeThirdRepeat(key) {
    return recentProblemKeys.length >= 2 &&
      recentProblemKeys[recentProblemKeys.length - 1] === key &&
      recentProblemKeys[recentProblemKeys.length - 2] === key;
  }

  function rememberProblem(key) {
    recentProblemKeys.push(key);

    if (recentProblemKeys.length > 2) {
      recentProblemKeys.shift();
    }
  }

  function hideWrongAnswers() {
    board.forEach(function (cell) {
      if (cell.state === "wrong") {
        cell.showAnswer = false;
      }
    });
  }

  function submitAnswer(event) {
    event.preventDefault();

    if (activeCell === null || isResetting) {
      return;
    }

    var userAnswer = Number(answerInput.value);

    if (answerInput.value.trim() === "") {
      return;
    }

    if (userAnswer === board[activeCell].answer) {
      board[activeCell].state = "correct";
      activeCell = null;
      answerInput.value = "";
      renderBoard();
      checkWin();
    } else {
      board[activeCell].state = "wrong";
      board[activeCell].showAnswer = true;
      activeCell = null;
      answerInput.value = "";
      renderBoard();
      answerInput.focus();
    }
  }

  function checkWin() {
    var winningLine = findWinningLine();

    if (!winningLine) {
      return;
    }

    score += 1;
    updateScore();
    showWinLine(winningLine);
    startConfetti();

    isResetting = true;
    renderBoard();

    window.setTimeout(function () {
      if (score >= targetScore) {
        showScreen("finish");
      } else {
        resetBoard();
      }
    }, confettiDuration);
  }

  function updateScore() {
    scoreBox.textContent = score + "/" + targetScore;
  }

  function findWinningLine() {
    var directions = [
      { row: 0, col: 1, angle: 0 },
      { row: 1, col: 0, angle: 90 },
      { row: 1, col: 1, angle: 45 },
      { row: 1, col: -1, angle: -45 }
    ];

    for (var row = 0; row < boardSize; row += 1) {
      for (var col = 0; col < boardSize; col += 1) {
        for (var directionIndex = 0; directionIndex < directions.length; directionIndex += 1) {
          var direction = directions[directionIndex];
          var cells = collectLine(row, col, direction.row, direction.col);

          if (cells && cells.every(isCorrectCell)) {
            return {
              start: cells[0],
              end: cells[cells.length - 1],
              angle: direction.angle
            };
          }
        }
      }
    }

    return null;
  }

  function collectLine(row, col, rowStep, colStep) {
    var cells = [];

    for (var offset = 0; offset < 4; offset += 1) {
      var nextRow = row + rowStep * offset;
      var nextCol = col + colStep * offset;

      if (nextRow < 0 || nextRow >= boardSize || nextCol < 0 || nextCol >= boardSize) {
        return null;
      }

      cells.push(nextRow * boardSize + nextCol);
    }

    return cells;
  }

  function isCorrectCell(index) {
    return board[index].state === "correct";
  }

  function showWinLine(line) {
    var start = indexToCenter(line.start);
    var end = indexToCenter(line.end);
    var deltaX = end.x - start.x;
    var deltaY = end.y - start.y;
    var length = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + 16;

    winLine.style.setProperty("--line-x", (start.x + deltaX / 2) + "%");
    winLine.style.setProperty("--line-y", (start.y + deltaY / 2) + "%");
    winLine.style.setProperty("--line-length", length + "%");
    winLine.style.setProperty("--line-angle", line.angle + "deg");
    winLine.classList.add("is-visible");
  }

  function hideWinLine() {
    winLine.classList.remove("is-visible");
  }

  function startConfetti() {
    var colors = ["#f7c948", "#6ee7b7", "#3b82f6", "#fb7185", "#32c66b", "#ffffff"];

    stopConfetti();

    for (var index = 0; index < 90; index += 1) {
      var piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--confetti-x", Math.floor(Math.random() * 100) + "%");
      piece.style.setProperty("--confetti-rotate", Math.floor(Math.random() * 360) + "deg");
      piece.style.setProperty("--confetti-color", colors[index % colors.length]);
      piece.style.animationDelay = Math.floor(Math.random() * 550) + "ms";
      piece.style.width = (8 + Math.floor(Math.random() * 8)) + "px";
      piece.style.height = (10 + Math.floor(Math.random() * 12)) + "px";
      confettiLayer.appendChild(piece);
    }

    confettiTimer = window.setTimeout(stopConfetti, confettiDuration);
  }

  function stopConfetti() {
    if (confettiTimer) {
      window.clearTimeout(confettiTimer);
      confettiTimer = null;
    }

    confettiLayer.innerHTML = "";
  }

  function indexToCenter(index) {
    var row = Math.floor(index / boardSize);
    var col = index % boardSize;

    return {
      x: (col + 0.5) * (100 / boardSize),
      y: (row + 0.5) * (100 / boardSize)
    };
  }

  function goHome() {
    stopConfetti();
    selectedTables = [];
    score = 0;
    activeCell = null;
    isResetting = false;
    readyButton.disabled = true;
    Array.prototype.forEach.call(tablesGrid.children, function (button) {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
    });
    showScreen("games");
  }

  function retry() {
    score = 0;
    stopConfetti();
    resetBoard();
    showScreen("tables");
  }

  readyButton.addEventListener("click", startGame);
  answerForm.addEventListener("submit", submitAnswer);
  answerButton.addEventListener("click", submitAnswer);
  backButton.addEventListener("click", goHome);
  homeButton.addEventListener("click", goHome);
  retryButton.addEventListener("click", retry);

  renderGames();
  renderTables();
}());
