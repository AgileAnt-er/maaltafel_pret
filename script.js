(function () {
  "use strict";

  var boardSize = 5;
  var targetScore = 5;
  var multiplierMax = 10;
  var confettiDuration = 3000;
  var defaultLegoCols = 20;
  var defaultLegoRows = 14;
  var minLegoCols = 12;
  var minLegoRows = 8;
  var maxLegoCols = 32;
  var maxLegoRows = 24;
  var legoBoardStep = 2;
  var legoCols = defaultLegoCols;
  var legoRows = defaultLegoRows;
  var legoBrickId = 0;
  var games = [
    { id: "maze", name: "maaltafeldoolhof", enabled: true },
    { id: "bros", name: "maaltafel bros", enabled: false },
    { id: "four-row", name: "4 maaltafels op een rij", enabled: true },
    { id: "lego", name: "maaltafel Lego", enabled: true }
  ];
  var mazeCols = 8;
  var mazeRows = 6;
  var mazeLayouts = [
    {
      start: { row: 5, col: 3 },
      exit: { row: 0, col: 1 },
      yellow: ["0,0", "0,2", "0,6", "1,1", "2,3", "2,5", "3,1", "3,6", "4,2", "5,6"],
      open: [
        "5,3 4,3", "4,3 4,2", "4,2 3,2", "3,2 2,2", "2,2 2,1", "2,1 1,1", "1,1 0,1",
        "5,3 5,4", "5,4 4,4", "4,4 3,4", "3,4 3,5", "3,5 2,5", "2,5 1,5", "1,5 1,6", "1,6 0,6",
        "2,2 2,3", "2,3 1,3", "1,3 0,3", "3,2 3,1", "4,2 4,1", "4,1 5,1", "5,1 5,0",
        "3,5 3,6", "3,6 4,6", "4,6 5,6", "1,6 1,7", "1,7 2,7", "2,7 3,7"
      ]
    },
    {
      start: { row: 5, col: 4 },
      exit: { row: 0, col: 6 },
      yellow: ["0,2", "0,5", "1,0", "1,6", "2,2", "2,4", "3,6", "4,1", "4,5", "5,2"],
      open: [
        "5,4 5,5", "5,5 4,5", "4,5 3,5", "3,5 3,6", "3,6 2,6", "2,6 1,6", "1,6 0,6",
        "5,4 4,4", "4,4 4,3", "4,3 3,3", "3,3 2,3", "2,3 2,2", "2,2 1,2", "1,2 0,2",
        "4,3 4,2", "4,2 5,2", "5,2 5,1", "5,1 4,1", "4,1 3,1", "3,1 2,1", "2,1 1,1", "1,1 1,0",
        "2,3 2,4", "2,4 1,4", "1,4 0,4", "0,4 0,5", "0,5 0,6", "3,6 3,7", "3,7 4,7", "4,7 5,7"
      ]
    }
  ];
  var legoBrickTypes = [
    { key: "1x1", width: 1, height: 1, label: "1x1" },
    { key: "1x2", width: 2, height: 1, label: "1x2" },
    { key: "1x3", width: 3, height: 1, label: "1x3" },
    { key: "1x4", width: 4, height: 1, label: "1x4" },
    { key: "1x5", width: 5, height: 1, label: "1x5" },
    { key: "1x6", width: 6, height: 1, label: "1x6" },
    { key: "2x2", width: 2, height: 2, label: "2x2" },
    { key: "2x3", width: 3, height: 2, label: "2x3" },
    { key: "2x4", width: 4, height: 2, label: "2x4" },
    { key: "2x5", width: 5, height: 2, label: "2x5" },
    { key: "2x6", width: 6, height: 2, label: "2x6" }
  ];
  var legoColors = [
    "#e53935", "#fb8c00", "#fdd835",
    "#43a047", "#1e88e5", "#8e24aa",
    "#6d4c41", "#ffffff", "#212121"
  ];

  var screens = {
    games: document.getElementById("screen-games"),
    tables: document.getElementById("screen-tables"),
    play: document.getElementById("screen-play"),
    maze: document.getElementById("screen-maze"),
    lego: document.getElementById("screen-lego"),
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
  var mazeBackButton = document.getElementById("maze-back-button");
  var mazeBoard = document.getElementById("maze-board");
  var mazeArrowButtons = document.querySelectorAll(".maze-arrow");
  var mazeAnswerForm = document.getElementById("maze-answer-form");
  var mazeAnswerInput = document.getElementById("maze-answer-input");
  var mazeAnswerButton = document.getElementById("maze-answer-button");
  var mazeMessage = document.getElementById("maze-message");
  var legoBackButton = document.getElementById("lego-back-button");
  var legoBoard = document.getElementById("lego-board");
  var legoPicker = document.getElementById("lego-picker");
  var legoColorsElement = document.getElementById("lego-colors");
  var legoZoomOut = document.getElementById("lego-zoom-out");
  var legoZoomIn = document.getElementById("lego-zoom-in");
  var legoRotateButton = document.getElementById("lego-rotate");
  var legoAnswerForm = document.getElementById("lego-answer-form");
  var legoAnswerInput = document.getElementById("lego-answer-input");
  var legoAnswerButton = document.getElementById("lego-answer-button");
  var legoMessage = document.getElementById("lego-message");

  var selectedGameId = "four-row";
  var selectedTables = [];
  var board = [];
  var score = 0;
  var activeCell = null;
  var isResetting = false;
  var recentProblemKeys = [];
  var confettiTimer = null;
  var mazeLayoutIndex = -1;
  var mazeLayout = null;
  var mazePosition = null;
  var mazeActiveProblem = null;
  var mazeProblemPosition = null;
  var legoSelectedTypeKey = "";
  var legoSelectedColor = legoColors[0];
  var legoOrientation = "horizontal";
  var legoCurrentProblem = null;
  var legoReadyBrick = null;
  var legoWrongBrick = null;
  var legoPlacedBricks = [];
  var legoPreview = null;
  var legoDrag = null;

  function showScreen(name) {
    Object.keys(screens).forEach(function (screenName) {
      screens[screenName].classList.toggle("is-active", screenName === name);
    });

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
          selectedGameId = game.id;
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

  function startSelectedGame() {
    if (selectedGameId === "maze") {
      startMazeGame();
      return;
    }

    if (selectedGameId === "lego") {
      startLegoGame();
      return;
    }

    startFourRowGame();
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

  function startFourRowGame() {
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
      problem: problem.label,
      answer: problem.answer,
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
      key: table + "x" + multiplier,
      label: table + " x " + multiplier,
      answer: table * multiplier
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
            key: key,
            label: table + " x " + multiplier,
            answer: table * multiplier
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
      if (!checkWin()) {
        resetFullBoardWithoutWin();
      }
    } else {
      board[activeCell].state = "wrong";
      board[activeCell].showAnswer = true;
      activeCell = null;
      answerInput.value = "";
      renderBoard();
      if (!resetFullBoardWithoutWin()) {
        answerInput.focus();
      }
    }
  }

  function checkWin() {
    var winningLine = findWinningLine();

    if (!winningLine) {
      return false;
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

    return true;
  }

  function resetFullBoardWithoutWin() {
    if (!isBoardFull() || findWinningLine()) {
      return false;
    }

    isResetting = true;
    renderBoard();

    window.setTimeout(function () {
      resetBoard();
      answerInput.focus();
    }, 1200);

    return true;
  }

  function isBoardFull() {
    return board.every(function (cell) {
      return cell.state === "correct" || cell.state === "wrong";
    });
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

  function startMazeGame() {
    recentProblemKeys = [];
    mazeLayoutIndex = (mazeLayoutIndex + 1) % mazeLayouts.length;
    mazeLayout = buildMazeLayout(mazeLayouts[mazeLayoutIndex]);
    mazePosition = {
      row: mazeLayout.start.row,
      col: mazeLayout.start.col
    };
    mazeActiveProblem = null;
    mazeProblemPosition = null;
    mazeAnswerInput.value = "";
    mazeMessage.textContent = "Zoek het paarse vakje.";
    renderMaze();
    showScreen("maze");
    readyButton.blur();
  }

  function buildMazeLayout(spec) {
    var cells = [];

    for (var row = 0; row < mazeRows; row += 1) {
      for (var col = 0; col < mazeCols; col += 1) {
        cells.push({
          row: row,
          col: col,
          walls: {
            top: true,
            right: true,
            bottom: true,
            left: true
          }
        });
      }
    }

    spec.open.forEach(function (edge) {
      var parts = edge.split(" ");
      openMazeWall(cells, parseMazePoint(parts[0]), parseMazePoint(parts[1]));
    });

    return {
      start: spec.start,
      exit: spec.exit,
      yellow: spec.yellow,
      cells: cells
    };
  }

  function parseMazePoint(value) {
    var parts = value.split(",");

    return {
      row: Number(parts[0]),
      col: Number(parts[1])
    };
  }

  function openMazeWall(cells, a, b) {
    var first = getMazeCell(cells, a.row, a.col);
    var second = getMazeCell(cells, b.row, b.col);
    var rowDiff = b.row - a.row;
    var colDiff = b.col - a.col;

    if (!first || !second) {
      return;
    }

    if (rowDiff === -1 && colDiff === 0) {
      first.walls.top = false;
      second.walls.bottom = false;
    } else if (rowDiff === 1 && colDiff === 0) {
      first.walls.bottom = false;
      second.walls.top = false;
    } else if (rowDiff === 0 && colDiff === 1) {
      first.walls.right = false;
      second.walls.left = false;
    } else if (rowDiff === 0 && colDiff === -1) {
      first.walls.left = false;
      second.walls.right = false;
    }
  }

  function getMazeCell(cells, row, col) {
    return cells[row * mazeCols + col];
  }

  function renderMaze() {
    mazeBoard.innerHTML = "";
    mazeBoard.style.setProperty("--maze-cols", String(mazeCols));
    mazeBoard.style.setProperty("--maze-rows", String(mazeRows));

    mazeLayout.cells.forEach(function (cell) {
      var element = document.createElement("div");
      var key = makeMazeKey(cell.row, cell.col);
      element.className = "maze-cell";
      element.style.borderTop = mazeBorder(cell.walls.top);
      element.style.borderRight = mazeBorder(cell.walls.right);
      element.style.borderBottom = mazeBorder(cell.walls.bottom);
      element.style.borderLeft = mazeBorder(cell.walls.left);

      if (mazeLayout.yellow.indexOf(key) !== -1) {
        element.classList.add("is-yellow");
      }

      if (isMazePosition(cell, mazeLayout.start)) {
        element.classList.add("is-start");
      }

      if (isMazePosition(cell, mazeLayout.exit)) {
        element.classList.add("is-exit");
      }

      if (mazeProblemPosition && isMazePosition(cell, mazeProblemPosition)) {
        element.classList.add("has-problem");
        element.appendChild(createMazeProblemLabel());
      }

      if (isMazePosition(cell, mazePosition)) {
        element.appendChild(createMazePawn());
      }

      mazeBoard.appendChild(element);
    });

    Array.prototype.forEach.call(mazeArrowButtons, function (button) {
      button.disabled = Boolean(mazeActiveProblem);
    });
  }

  function mazeBorder(hasWall) {
    return hasWall ? "4px solid #111111" : "1px solid #cbd5e1";
  }

  function createMazePawn() {
    var pawn = document.createElement("span");
    pawn.className = "maze-pawn";
    return pawn;
  }

  function createMazeProblemLabel() {
    var label = document.createElement("span");
    label.className = "maze-problem-label";
    label.textContent = mazeActiveProblem.label;
    return label;
  }

  function moveMaze(direction) {
    if (!mazeLayout || mazeActiveProblem) {
      return;
    }

    var current = getMazeCell(mazeLayout.cells, mazePosition.row, mazePosition.col);
    var next = getMazeNextPosition(direction);

    if (!next || current.walls[direction]) {
      mazeMessage.textContent = "Daar staat een muur.";
      return;
    }

    mazePosition = next;
    mazeMessage.textContent = "Zoek het paarse vakje.";
    renderMaze();

    if (isMazePosition(mazePosition, mazeLayout.exit)) {
      showScreen("finish");
      return;
    }

    if (mazeLayout.yellow.indexOf(makeMazeKey(mazePosition.row, mazePosition.col)) !== -1) {
      startMazeProblem();
    }
  }

  function getMazeNextPosition(direction) {
    var next = {
      row: mazePosition.row,
      col: mazePosition.col
    };

    if (direction === "top") {
      next.row -= 1;
    } else if (direction === "right") {
      next.col += 1;
    } else if (direction === "bottom") {
      next.row += 1;
    } else if (direction === "left") {
      next.col -= 1;
    }

    if (next.row < 0 || next.row >= mazeRows || next.col < 0 || next.col >= mazeCols) {
      return null;
    }

    return next;
  }

  function startMazeProblem() {
    mazeActiveProblem = pickProblem();
    mazeProblemPosition = {
      row: mazePosition.row,
      col: mazePosition.col
    };
    mazeAnswerInput.value = "";
    mazeMessage.textContent = "Los op: " + mazeActiveProblem.label;
    renderMaze();
    mazeAnswerInput.focus();
  }

  function submitMazeAnswer(event) {
    event.preventDefault();

    if (!mazeActiveProblem || mazeAnswerInput.value.trim() === "") {
      return;
    }

    if (Number(mazeAnswerInput.value) === mazeActiveProblem.answer) {
      mazeMessage.textContent = "Goed! Je mag verder.";
    } else {
      mazePosition = {
        row: mazeLayout.start.row,
        col: mazeLayout.start.col
      };
      mazeMessage.textContent = "Niet juist. Terug naar de start.";
    }

    mazeActiveProblem = null;
    mazeProblemPosition = null;
    mazeAnswerInput.value = "";
    renderMaze();
  }

  function makeMazeKey(row, col) {
    return row + "," + col;
  }

  function isMazePosition(a, b) {
    return a.row === b.row && a.col === b.col;
  }

  function handleMazeKeydown(event) {
    if (!screens.maze.classList.contains("is-active") || mazeActiveProblem) {
      return;
    }

    var keyMap = {
      ArrowUp: "top",
      ArrowRight: "right",
      ArrowDown: "bottom",
      ArrowLeft: "left"
    };
    var direction = keyMap[event.key];

    if (direction) {
      event.preventDefault();
      moveMaze(direction);
    }
  }

  function startLegoGame() {
    recentProblemKeys = [];
    resetLegoState();
    showScreen("lego");
    renderLego();
    readyButton.blur();
  }

  function resetLegoState() {
    legoSelectedTypeKey = "";
    legoSelectedColor = legoColors[0];
    legoOrientation = "horizontal";
    legoCurrentProblem = null;
    legoReadyBrick = null;
    legoWrongBrick = null;
    legoPlacedBricks = [];
    legoPreview = null;
    legoCols = defaultLegoCols;
    legoRows = defaultLegoRows;
    legoAnswerInput.value = "";
    legoMessage.textContent = "Kies een blokje.";
  }

  function renderLego() {
    syncLegoBoardVars();
    renderLegoBoard();
    renderLegoPicker();
    renderLegoColors();
    legoRotateButton.classList.toggle("is-vertical", legoOrientation === "vertical");
  }

  function syncLegoBoardVars() {
    legoBoard.style.setProperty("--lego-cols", String(legoCols));
    legoBoard.style.setProperty("--lego-rows", String(legoRows));
    legoBoard.style.setProperty("--lego-ratio", String(legoCols / legoRows));

    var boardRect = legoBoard.getBoundingClientRect();
    var cellSize = boardRect.width > 0 ? boardRect.width / legoCols : 22;

    screens.lego.style.setProperty("--lego-cell", cellSize + "px");
  }

  function renderLegoBoard() {
    legoBoard.innerHTML = "";

    legoPlacedBricks.forEach(function (brick) {
      legoBoard.appendChild(createLegoPlacedBrick(brick));
    });

    if (legoPreview) {
      legoBoard.appendChild(createLegoPreviewBrick(legoPreview));
    }
  }

  function createLegoPlacedBrick(brick) {
    var element = document.createElement("div");
    element.className = "lego-placed-brick";
    element.style.left = (brick.x / legoCols * 100) + "%";
    element.style.top = (brick.y / legoRows * 100) + "%";
    element.style.width = (brick.width / legoCols * 100) + "%";
    element.style.height = (brick.height / legoRows * 100) + "%";
    element.style.backgroundColor = brick.color;
    element.style.setProperty("--brick-w", String(brick.width));
    element.style.setProperty("--brick-h", String(brick.height));
    element.setAttribute("aria-label", brick.label);
    addBrickStuds(element, brick.width * brick.height);
    return element;
  }

  function createLegoPreviewBrick(brick) {
    var element = createLegoPlacedBrick(brick);
    element.classList.add("lego-preview-brick");
    return element;
  }

  function renderLegoPicker() {
    legoPicker.innerHTML = "";

    var rows = [
      legoBrickTypes.filter(function (type) {
        return type.height === 1;
      }),
      legoBrickTypes.filter(function (type) {
        return type.height === 2;
      })
    ];

    rows.forEach(function (rowTypes) {
      var row = document.createElement("div");
      row.className = "lego-picker-row";

      rowTypes.forEach(function (type) {
        var button = document.createElement("button");
        var size = {
          width: type.width,
          height: type.height
        };
        button.className = "lego-picker-brick";
        button.type = "button";
        button.dataset.type = type.key;
        button.style.setProperty("--brick-w", String(size.width));
        button.style.setProperty("--brick-h", String(size.height));
        button.style.backgroundColor = legoSelectedColor;
        button.setAttribute("aria-label", "Kies blokje " + type.label);

        if (type.key === legoSelectedTypeKey) {
          button.classList.add("is-selected");
        }

        if (legoReadyBrick && legoReadyBrick.type.key === type.key) {
          button.classList.add("is-ready");
        }

        if (legoWrongBrick && legoWrongBrick.type.key === type.key) {
          button.classList.add("is-wrong");
        }

        renderPickerBrickContent(button, type);
        addBrickStuds(button, size.width * size.height);
        button.addEventListener("click", function () {
          chooseLegoBrick(type);
        });
        button.addEventListener("pointerdown", function (event) {
          startLegoDrag(event, type);
        });

        row.appendChild(button);
      });

      legoPicker.appendChild(row);
    });
  }

  function renderPickerBrickContent(button, type) {
    var label = document.createElement("span");
    label.className = "lego-brick-label";

    if (legoCurrentProblem && legoSelectedTypeKey === type.key) {
      label.textContent = legoCurrentProblem.label;
    } else if (legoWrongBrick && legoWrongBrick.type.key === type.key) {
      label.textContent = legoWrongBrick.problem.label + " = " + legoWrongBrick.problem.answer;
    } else if (legoReadyBrick && legoReadyBrick.type.key === type.key) {
      label.textContent = "";
    } else {
      label.textContent = "";
    }

    if (label.textContent) {
      button.appendChild(label);
    }
  }

  function addBrickStuds(element, count) {
    for (var index = 0; index < count; index += 1) {
      var stud = document.createElement("span");
      stud.className = "lego-stud";
      element.appendChild(stud);
    }
  }

  function renderLegoColors() {
    legoColorsElement.innerHTML = "";

    legoColors.forEach(function (color) {
      var button = document.createElement("button");
      button.className = "lego-color";
      button.type = "button";
      button.style.backgroundColor = color;
      button.setAttribute("aria-label", "Kleur " + color);

      if (color === legoSelectedColor) {
        button.classList.add("is-selected");
      }

      button.addEventListener("click", function () {
        legoSelectedColor = color;

        if (legoReadyBrick) {
          legoReadyBrick.color = color;
        }

        renderLego();
      });
      legoColorsElement.appendChild(button);
    });
  }

  function chooseLegoBrick(type) {
    legoSelectedTypeKey = type.key;
    legoCurrentProblem = pickProblem();
    legoReadyBrick = null;
    legoWrongBrick = null;
    legoAnswerInput.value = "";
    legoMessage.textContent = "Los eerst " + legoCurrentProblem.label + " op.";
    renderLego();
    legoAnswerInput.focus();
  }

  function submitLegoAnswer(event) {
    event.preventDefault();

    if (!legoCurrentProblem || !legoSelectedTypeKey || legoAnswerInput.value.trim() === "") {
      return;
    }

    var type = getBrickType(legoSelectedTypeKey);
    var userAnswer = Number(legoAnswerInput.value);

    if (userAnswer === legoCurrentProblem.answer) {
      legoReadyBrick = {
        type: type,
        color: legoSelectedColor
      };
      legoWrongBrick = null;
      legoCurrentProblem = null;
      legoMessage.textContent = "Goed! Sleep het blokje naar de bouwplaat.";
    } else {
      legoWrongBrick = {
        type: type,
        problem: legoCurrentProblem
      };
      legoReadyBrick = null;
      legoCurrentProblem = null;
      legoMessage.textContent = "Niet juist. Het antwoord is " + legoWrongBrick.problem.answer + ". Kies opnieuw een blokje.";
    }

    legoAnswerInput.value = "";
    renderLego();
  }

  function getBrickType(key) {
    return legoBrickTypes.find(function (type) {
      return type.key === key;
    });
  }

  function getOrientedSize(type) {
    if (legoOrientation === "vertical" && type.width !== type.height) {
      return {
        width: type.height,
        height: type.width
      };
    }

    return {
      width: type.width,
      height: type.height
    };
  }

  function startLegoDrag(event, type) {
    if (!legoReadyBrick || legoReadyBrick.type.key !== type.key) {
      return;
    }

    event.preventDefault();
    syncLegoBoardVars();
    var size = getOrientedSize(type);
    legoDrag = {
      type: type,
      width: size.width,
      height: size.height,
      color: legoReadyBrick.color,
      label: type.label,
      ghost: createLegoGhost(size, legoReadyBrick.color)
    };
    document.body.appendChild(legoDrag.ghost);
    moveLegoGhost(event.clientX, event.clientY);
    updateLegoPreview(event.clientX, event.clientY, legoDrag);
  }

  function createLegoGhost(size, color) {
    var ghost = document.createElement("div");
    var cellSize = getLegoCellSize();
    ghost.className = "lego-drag-ghost";
    ghost.style.width = (size.width * cellSize) + "px";
    ghost.style.height = (size.height * cellSize) + "px";
    ghost.style.backgroundColor = color;
    ghost.style.setProperty("--brick-w", String(size.width));
    ghost.style.setProperty("--brick-h", String(size.height));
    addBrickStuds(ghost, size.width * size.height);
    return ghost;
  }

  function getLegoCellSize() {
    var boardRect = legoBoard.getBoundingClientRect();
    return boardRect.width > 0 ? boardRect.width / legoCols : 22;
  }

  function moveLegoGhost(clientX, clientY) {
    if (!legoDrag) {
      return;
    }

    legoDrag.ghost.style.transform = "translate(" + (clientX + 12) + "px, " + (clientY + 12) + "px)";
  }

  function moveLegoDrag(event) {
    moveLegoGhost(event.clientX, event.clientY);
    updateLegoPreview(event.clientX, event.clientY, legoDrag);
  }

  function finishLegoDrag(event) {
    if (!legoDrag) {
      return;
    }

    var boardRect = legoBoard.getBoundingClientRect();
    var isInsideBoard = event.clientX >= boardRect.left &&
      event.clientX <= boardRect.right &&
      event.clientY >= boardRect.top &&
      event.clientY <= boardRect.bottom;

    if (isInsideBoard) {
      placeLegoBrickAtPoint(event.clientX, event.clientY, legoDrag);
    }

    legoDrag.ghost.remove();
    legoDrag = null;
    legoPreview = null;
    renderLegoBoard();
  }

  function placeLegoBrickAtPoint(clientX, clientY, brick) {
    var point = getLegoGridPoint(clientX, clientY, brick);

    if (!point) {
      return;
    }

    addPlacedLegoBrick(point.x, point.y, brick);
  }

  function updateLegoPreview(clientX, clientY, brick) {
    if (!brick) {
      return;
    }

    var point = getLegoGridPoint(clientX, clientY, brick);

    if (!point) {
      if (legoPreview) {
        legoPreview = null;
        renderLegoBoard();
      }

      return;
    }

    legoPreview = {
      x: point.x,
      y: point.y,
      width: brick.width,
      height: brick.height,
      color: brick.color,
      label: brick.label
    };
    renderLegoBoard();
  }

  function getLegoGridPoint(clientX, clientY, brick) {
    var boardRect = legoBoard.getBoundingClientRect();
    var isInsideBoard = clientX >= boardRect.left &&
      clientX <= boardRect.right &&
      clientY >= boardRect.top &&
      clientY <= boardRect.bottom;

    if (!isInsideBoard) {
      return null;
    }

    var cellWidth = boardRect.width / legoCols;
    var cellHeight = boardRect.height / legoRows;
    var x = Math.floor((clientX - boardRect.left) / cellWidth);
    var y = Math.floor((clientY - boardRect.top) / cellHeight);

    x = clamp(x, 0, legoCols - brick.width);
    y = clamp(y, 0, legoRows - brick.height);

    return {
      x: x,
      y: y
    };
  }

  function addPlacedLegoBrick(x, y, brick) {
    var placed = {
      id: legoBrickId,
      x: x,
      y: y,
      width: brick.width,
      height: brick.height,
      color: brick.color,
      label: brick.label
    };
    legoBrickId += 1;
    legoPlacedBricks = legoPlacedBricks.filter(function (existing) {
      return !rectanglesOverlap(existing, placed);
    });
    legoPlacedBricks.push(placed);
    legoReadyBrick = null;
    legoSelectedTypeKey = "";
    legoMessage.textContent = "Mooi! Kies nog een blokje.";
    renderLego();
  }

  function rectanglesOverlap(a, b) {
    return a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rotateLegoBrick() {
    legoOrientation = legoOrientation === "horizontal" ? "vertical" : "horizontal";
    legoMessage.textContent = legoOrientation === "vertical" ? "Draaien staat aan voor het volgende sleepblokje." : "Draaien staat uit.";
    renderLego();
  }

  function resizeLegoBoard(direction) {
    var occupied = getLegoOccupiedBounds();
    var nextCols = clamp(legoCols + (direction * legoBoardStep), Math.max(minLegoCols, occupied.cols), maxLegoCols);
    var nextRows = clamp(legoRows + (direction * legoBoardStep), Math.max(minLegoRows, occupied.rows), maxLegoRows);

    if (nextCols === legoCols && nextRows === legoRows) {
      legoMessage.textContent = direction > 0 ? "De bouwplaat is al groot genoeg." : "Kleiner kan niet met deze blokjes.";
      return;
    }

    legoCols = nextCols;
    legoRows = nextRows;
    legoMessage.textContent = "Bouwplaat: " + legoCols + " x " + legoRows + " noppen.";
    renderLego();
  }

  function getLegoOccupiedBounds() {
    var cols = 0;
    var rows = 0;

    legoPlacedBricks.forEach(function (brick) {
      cols = Math.max(cols, brick.x + brick.width);
      rows = Math.max(rows, brick.y + brick.height);
    });

    return {
      cols: cols,
      rows: rows
    };
  }

  function goHome() {
    stopConfetti();
    selectedTables = [];
    score = 0;
    activeCell = null;
    isResetting = false;
    mazeActiveProblem = null;
    mazeProblemPosition = null;
    mazePosition = mazeLayout ? {
      row: mazeLayout.start.row,
      col: mazeLayout.start.col
    } : null;
    resetLegoState();
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

  readyButton.addEventListener("click", startSelectedGame);
  answerForm.addEventListener("submit", submitAnswer);
  answerButton.addEventListener("click", submitAnswer);
  backButton.addEventListener("click", goHome);
  mazeBackButton.addEventListener("click", goHome);
  mazeAnswerForm.addEventListener("submit", submitMazeAnswer);
  mazeAnswerButton.addEventListener("click", submitMazeAnswer);
  Array.prototype.forEach.call(mazeArrowButtons, function (button) {
    button.addEventListener("click", function () {
      moveMaze(button.dataset.direction);
    });
  });
  legoBackButton.addEventListener("click", goHome);
  legoAnswerForm.addEventListener("submit", submitLegoAnswer);
  legoAnswerButton.addEventListener("click", submitLegoAnswer);
  legoRotateButton.addEventListener("click", rotateLegoBrick);
  legoZoomOut.addEventListener("click", function () {
    resizeLegoBoard(-1);
  });
  legoZoomIn.addEventListener("click", function () {
    resizeLegoBoard(1);
  });
  document.addEventListener("pointermove", moveLegoDrag);
  document.addEventListener("pointerup", finishLegoDrag);
  document.addEventListener("keydown", handleMazeKeydown);
  homeButton.addEventListener("click", goHome);
  retryButton.addEventListener("click", retry);

  renderGames();
  renderTables();
  renderLego();
}());
