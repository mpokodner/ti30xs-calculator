/**
 * TI-30XS MultiView Scientific Calculator
 * A comprehensive web-based replica of the Texas Instruments calculator
 */

// Calculator Module Pattern
const TI30XSCalculator = (function () {
  "use strict";

  // Constants
  const PI = Math.PI;
  const E = Math.E;
  const MAX_DISPLAY_LENGTH = 16;
  const MAX_PRECISION = 13;
  const DISPLAY_PRECISION = 10;
  const HISTORY_SIZE = 8;

  // Calculator State
  let state = {
    isOn: false,
    isSecondMode: false,
    isAlphaMode: false,
    angleMode: "DEG", // DEG, RAD, GRAD
    displayMode: "NORM", // NORM, FIX, SCI, ENG
    fixDecimals: 2,
    entryLine: "",
    resultLine: "",
    history: [],
    memory: {
      M: 0,
      x: 0,
      y: 0,
      z: 0,
      t: 0,
      a: 0,
      b: 0,
      c: 0,
    },
    lists: {
      L1: [],
      L2: [],
      L3: [],
      L4: [],
      L5: [],
      L6: [],
    },
    lastAnswer: 0,
    cursorPosition: 0,
    isInsertMode: false,
    historyIndex: -1,
    isInStatMode: false,
  };

  // DOM Elements
  let elements = {};

  // Initialize calculator
  function init() {
    setupDOMElements();
    setupEventListeners();
    setupKeyboardSupport();
    turnOn();
    updateDisplay();
  }

  // Setup DOM element references
  function setupDOMElements() {
    elements = {
      // Display elements
      entryLine: document.getElementById("entry-line"),
      resultLine: document.getElementById("result-line"),
      historyLine1: document.getElementById("history-line-1"),
      historyLine2: document.getElementById("history-line-2"),
      display: document.querySelector(".display"),

      // Status indicators
      secondIndicator: document.getElementById("second-indicator"),
      hypIndicator: document.getElementById("hyp-indicator"),
      fixIndicator: document.getElementById("fix-indicator"),
      sciIndicator: document.getElementById("sci-indicator"),
      engIndicator: document.getElementById("eng-indicator"),
      angleIndicator: document.getElementById("angle-indicator"),
      kIndicator: document.getElementById("k-indicator"),
      statIndicator: document.getElementById("stat-indicator"),

      // Main buttons
      secondBtn: document.getElementById("second-btn"),
      modeBtn: document.getElementById("mode-btn"),
      deleteBtn: document.getElementById("delete-btn"),

      // Navigation buttons
      upBtn: document.getElementById("up-btn"),
      downBtn: document.getElementById("down-btn"),
      leftBtn: document.getElementById("left-btn"),
      rightBtn: document.getElementById("right-btn"),

      // Function buttons
      alphaBtn: document.getElementById("alpha-btn"),
      xVarBtn: document.getElementById("x-var-btn"),
      statBtn: document.getElementById("stat-btn"),
      mathBtn: document.getElementById("math-btn"),
      appsBtn: document.getElementById("apps-btn"),
      prgmBtn: document.getElementById("prgm-btn"),
      clearBtn: document.getElementById("clear-btn"),

      // Scientific buttons
      xInverseBtn: document.getElementById("x-inverse-btn"),
      sinBtn: document.getElementById("sin-btn"),
      cosBtn: document.getElementById("cos-btn"),
      tanBtn: document.getElementById("tan-btn"),
      squareBtn: document.getElementById("square-btn"),
      powerBtn: document.getElementById("power-btn"),
      logBtn: document.getElementById("log-btn"),
      lnBtn: document.getElementById("ln-btn"),
      stoBtn: document.getElementById("sto-btn"),

      // Number buttons
      numberBtns: {},

      // Operation buttons
      divideBtn: document.getElementById("divide-btn"),
      multiplyBtn: document.getElementById("multiply-btn"),
      subtractBtn: document.getElementById("subtract-btn"),
      addBtn: document.getElementById("add-btn"),
      enterBtn: document.getElementById("enter-btn"),
      decimalBtn: document.getElementById("decimal-btn"),
      negativeBtn: document.getElementById("negative-btn"),

      // Special buttons
      onBtn: document.getElementById("on-btn"),
      dataBtn: document.getElementById("data-btn"),

      // Error display
      errorDisplay: document.getElementById("error-display"),

      // Help panel
      helpPanel: document.getElementById("help-panel"),
      helpCloseBtn: document.getElementById("help-close-btn"),
    };

    // Setup number buttons
    for (let i = 0; i <= 9; i++) {
      elements.numberBtns[i] = document.getElementById(`btn-${i}`);
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Power button
    elements.onBtn.addEventListener("click", handleOnButton);

    // 2nd button
    elements.secondBtn.addEventListener("click", toggleSecondMode);

    // Mode and delete buttons
    elements.modeBtn.addEventListener("click", handleModeButton);
    elements.deleteBtn.addEventListener("click", handleDeleteButton);

    // Navigation buttons
    elements.upBtn.addEventListener("click", () => navigateHistory(-1));
    elements.downBtn.addEventListener("click", () => navigateHistory(1));
    elements.leftBtn.addEventListener("click", () => moveCursor(-1));
    elements.rightBtn.addEventListener("click", () => moveCursor(1));

    // Clear button
    elements.clearBtn.addEventListener("click", clearEntry);

    // Scientific function buttons
    elements.sinBtn.addEventListener("click", () => handleTrigButton("sin"));
    elements.cosBtn.addEventListener("click", () => handleTrigButton("cos"));
    elements.tanBtn.addEventListener("click", () => handleTrigButton("tan"));
    elements.logBtn.addEventListener("click", () => handleLogButton("log"));
    elements.lnBtn.addEventListener("click", () => handleLogButton("ln"));
    elements.xInverseBtn.addEventListener("click", () =>
      handleXInverseButton()
    );
    elements.squareBtn.addEventListener("click", () => handleSquareButton());
    elements.powerBtn.addEventListener("click", () => handlePowerButton());

    // Memory button
    elements.stoBtn.addEventListener("click", () => handleStoButton());

    // Number buttons
    Object.keys(elements.numberBtns).forEach((num) => {
      elements.numberBtns[num].addEventListener("click", () =>
        handleNumberButton(num)
      );
    });

    // Operation buttons
    elements.divideBtn.addEventListener("click", () =>
      handleOperationButton("÷")
    );
    elements.multiplyBtn.addEventListener("click", () =>
      handleOperationButton("×")
    );
    elements.subtractBtn.addEventListener("click", () =>
      handleOperationButton("−")
    );
    elements.addBtn.addEventListener("click", () => handleOperationButton("+"));
    elements.enterBtn.addEventListener("click", () => handleEnterButton());
    elements.decimalBtn.addEventListener("click", () => handleDecimalButton());
    elements.negativeBtn.addEventListener("click", () =>
      handleNegativeButton()
    );

    // Alpha button
    elements.alphaBtn.addEventListener("click", toggleAlphaMode);

    // Stat button
    elements.statBtn.addEventListener("click", handleStatButton);

    // Data button
    elements.dataBtn.addEventListener("click", handleDataButton);

    // x-var button
    elements.xVarBtn.addEventListener("click", handleXVarButton);

    // Math button
    elements.mathBtn.addEventListener("click", handleMathButton);

    // Apps button
    elements.appsBtn.addEventListener("click", handleAppsButton);

    // Help panel
    elements.helpPanel.addEventListener("click", function (e) {
      if (e.target === elements.helpPanel) {
        closeHelp();
      }
    });
    elements.helpCloseBtn.addEventListener("click", closeHelp);

    // Display click for focus
    elements.display.addEventListener("click", () => elements.display.focus());
  }

  // Setup keyboard support
  function setupKeyboardSupport() {
    document.addEventListener("keydown", handleKeyPress);
  }

  // Handle keyboard input
  function handleKeyPress(event) {
    if (!state.isOn) return;

    const key = event.key;

    // Close help panel with Escape
    if (key === "Escape" && elements.helpPanel.classList.contains("show")) {
      closeHelp();
      event.preventDefault();
      return;
    }

    // Prevent default for calculator keys
    if (isCalculatorKey(key)) {
      event.preventDefault();
    }

    // Number keys
    if (key >= "0" && key <= "9") {
      handleNumberButton(key);
    }
    // Decimal
    else if (key === ".") {
      handleDecimalButton();
    }
    // Operators
    else if (key === "+") {
      handleOperationButton("+");
    } else if (key === "-") {
      handleOperationButton("−");
    } else if (key === "*") {
      handleOperationButton("×");
    } else if (key === "/") {
      handleOperationButton("÷");
    } else if (key === "^") {
      handlePowerButton();
    }
    // Enter/Equals
    else if (key === "Enter" || key === "=") {
      handleEnterButton();
    }
    // Backspace/Delete
    else if (key === "Backspace" || key === "Delete") {
      handleDeleteButton();
    }
    // Escape/Clear
    else if (key === "Escape") {
      clearEntry();
    }
    // Arrow keys
    else if (key === "ArrowLeft") {
      moveCursor(-1);
    } else if (key === "ArrowRight") {
      moveCursor(1);
    } else if (key === "ArrowUp") {
      navigateHistory(-1);
    } else if (key === "ArrowDown") {
      navigateHistory(1);
    }
  }

  // Check if key is a calculator key
  function isCalculatorKey(key) {
    const calculatorKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ".",
      "+",
      "-",
      "*",
      "/",
      "^",
      "=",
      "Enter",
      "Backspace",
      "Delete",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];
    return calculatorKeys.includes(key);
  }

  // Button handlers
  function handleOnButton() {
    if (!state.isOn) {
      turnOn();
    } else if (state.isSecondMode) {
      // 2nd + ON = OFF
      turnOff();
      state.isSecondMode = false;
      updateIndicators();
    }
  }

  function handleModeButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + MODE = QUIT
      quitCurrentMode();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      openModeMenu();
    }
  }

  function handleDeleteButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + DELETE = INSERT
      toggleInsertMode();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      deleteCharacter();
    }
  }

  function handleNumberButton(num) {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Handle secondary functions for number buttons
      switch (num) {
        case "0":
          // 2nd + 0 = RESET
          resetCalculator();
          break;
        case "1":
          // 2nd + 1 = L4
          insertList("L4");
          break;
        case "2":
          // 2nd + 2 = L5
          insertList("L5");
          break;
        case "3":
          // 2nd + 3 = L6
          insertList("L6");
          break;
        case "4":
          // 2nd + 4 = L1
          insertList("L1");
          break;
        case "5":
          // 2nd + 5 = L2
          insertList("L2");
          break;
        case "6":
          // 2nd + 6 = L3
          insertList("L3");
          break;
        case "7":
          // 2nd + 7 = y-var
          insertVariable("y");
          break;
        case "8":
          // 2nd + 8 = table
          openTableFunction();
          break;
        case "9":
          // 2nd + 9 = graph
          showMessage("Graph function not available");
          break;
      }
      state.isSecondMode = false;
      updateIndicators();
    } else {
      insertNumber(num);
    }
  }

  function handleTrigButton(func) {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Inverse trig functions
      executeTrigFunction(func, true);
      state.isSecondMode = false;
      updateIndicators();
    } else {
      executeTrigFunction(func, false);
    }
  }

  function handleLogButton(func) {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 10^x or e^x
      executeLogFunction(func, true);
      state.isSecondMode = false;
      updateIndicators();
    } else {
      executeLogFunction(func, false);
    }
  }

  function handleSquareButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Square root
      executeSquareRoot();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      // Square
      executePower(2);
    }
  }

  function handlePowerButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // nth root
      insertOperator("ˣ√");
      state.isSecondMode = false;
      updateIndicators();
    } else {
      insertOperator("^");
    }
  }

  function handleXInverseButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Absolute value
      executeAbsolute();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      executeReciprocal();
    }
  }

  function handleStoButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Recall
      recallValue();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      storeValue();
    }
  }

  function handleOperationButton(op) {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      switch (op) {
        case "÷":
          // 2nd + ÷ = e
          insertConstant("e");
          break;
        case "×":
          // 2nd + × = π
          insertConstant("pi");
          break;
        case "−":
          // 2nd + − = ANS
          insertAnswer();
          break;
        case "+":
          // 2nd + + = entry
          showMessage("Entry function not implemented");
          break;
      }
      state.isSecondMode = false;
      updateIndicators();
    } else {
      insertOperator(op);
    }
  }

  function handleEnterButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + ENTER = SOLVE
      showMessage("Solve function not implemented");
      state.isSecondMode = false;
      updateIndicators();
    } else {
      calculate();
    }
  }

  function handleDecimalButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + . = i (imaginary unit)
      insertConstant("i");
      state.isSecondMode = false;
      updateIndicators();
    } else {
      insertDecimal();
    }
  }

  function handleNegativeButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + (−) = ! (factorial)
      executeFactorial();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      insertNegative();
    }
  }

  function handleStatButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + STAT = stat menu
      openStatisticsMenu();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      // Regular stat mode
      toggleStatMode();
    }
  }

  function handleDataButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + DATA = [
      insertOperator("[");
      state.isSecondMode = false;
      updateIndicators();
    } else {
      openDataEditor();
    }
  }

  function handleXVarButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + x-var = angle
      showAngleMenu();
      state.isSecondMode = false;
      updateIndicators();
    } else {
      insertVariable("x");
    }
  }

  function handleMathButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + MATH = TEST
      showMessage("Test menu not implemented");
      state.isSecondMode = false;
      updateIndicators();
    } else {
      showMathMenu();
    }
  }

  function handleAppsButton() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // 2nd + APPS = CHAR
      showMessage("Character menu not implemented");
      state.isSecondMode = false;
      updateIndicators();
    } else {
      showAppsMenu();
    }
  }

  // Power functions
  function turnOn() {
    state.isOn = true;
    updateDisplay();
    updateIndicators();
  }

  function turnOff() {
    state.isOn = false;
    state.entryLine = "";
    state.resultLine = "";
    state.isSecondMode = false;
    state.isAlphaMode = false;
    updateDisplay();
    updateIndicators();
  }

  // Mode functions
  function toggleSecondMode() {
    if (!state.isOn) return;
    state.isSecondMode = !state.isSecondMode;
    updateIndicators();
    updateButtonStates();
  }

  function toggleAlphaMode() {
    if (!state.isOn) return;
    state.isAlphaMode = !state.isAlphaMode;
    showMessage(state.isAlphaMode ? "Alpha mode ON" : "Alpha mode OFF");
  }

  function toggleStatMode() {
    if (!state.isOn) return;
    state.isInStatMode = !state.isInStatMode;
    updateIndicators();
    showMessage(state.isInStatMode ? "STAT mode ON" : "STAT mode OFF");
  }

  function quitCurrentMode() {
    state.isInStatMode = false;
    state.isAlphaMode = false;
    updateIndicators();
    showMessage("Quit to home");
  }

  // Input functions
  function insertNumber(num) {
    if (!state.isOn) return;

    if (state.entryLine.length >= MAX_DISPLAY_LENGTH) {
      showError("Entry too long");
      return;
    }

    state.entryLine += num;
    updateDisplay();
  }

  function insertDecimal() {
    if (!state.isOn) return;

    const currentNumber = getCurrentNumber();
    if (currentNumber.includes(".")) {
      showError("Decimal already exists");
      return;
    }

    if (state.entryLine === "" || isOperator(state.entryLine.slice(-1))) {
      state.entryLine += "0.";
    } else {
      state.entryLine += ".";
    }
    updateDisplay();
  }

  function insertNegative() {
    if (!state.isOn) return;

    if (state.entryLine === "") {
      state.entryLine = "−";
    } else {
      // Toggle negative sign
      if (state.entryLine.startsWith("−")) {
        state.entryLine = state.entryLine.substring(1);
      } else {
        state.entryLine = "−" + state.entryLine;
      }
    }

    updateDisplay();
  }

  function insertOperator(operator) {
    if (!state.isOn) return;

    // Don't add operator if entry is empty (except for minus)
    if (state.entryLine === "" && operator !== "−") {
      return;
    }

    // Replace last operator if consecutive operators
    const lastChar = state.entryLine.slice(-1);
    if (isOperator(lastChar) && operator !== "(" && operator !== "−") {
      state.entryLine = state.entryLine.slice(0, -1) + operator;
    } else {
      state.entryLine += operator;
    }

    updateDisplay();
  }

  function insertConstant(type) {
    if (!state.isOn) return;

    switch (type) {
      case "pi":
        state.entryLine += "π";
        break;
      case "e":
        state.entryLine += "e";
        break;
      case "i":
        state.entryLine += "i";
        break;
    }

    updateDisplay();
  }

  function insertVariable(varName) {
    if (!state.isOn) return;
    state.entryLine += varName;
    updateDisplay();
  }

  function insertList(listName) {
    if (!state.isOn) return;
    state.entryLine += listName;
    updateDisplay();
  }

  function insertAnswer() {
    if (!state.isOn) return;
    const answer = state.lastAnswer.toString();
    state.entryLine += answer;
    updateDisplay();
  }

  // Edit functions
  function clearEntry() {
    if (!state.isOn) return;

    state.entryLine = "";
    state.resultLine = "";
    updateDisplay();
  }

  function deleteCharacter() {
    if (!state.isOn) return;

    if (state.entryLine.length > 0) {
      state.entryLine = state.entryLine.slice(0, -1);
      updateDisplay();
    }
  }

  function toggleInsertMode() {
    if (!state.isOn) return;
    state.isInsertMode = !state.isInsertMode;
    showMessage(state.isInsertMode ? "Insert mode ON" : "Overwrite mode");
  }

  function moveCursor(direction) {
    if (!state.isOn) return;

    const newPosition = state.cursorPosition + direction;
    if (newPosition >= 0 && newPosition <= state.entryLine.length) {
      state.cursorPosition = newPosition;
      updateDisplay();
    }
  }

  function navigateHistory(direction) {
    if (!state.isOn || state.history.length === 0) return;

    if (direction === -1) {
      // Up arrow
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const historyItem = state.history[state.historyIndex];
        state.entryLine = historyItem.entry;
        updateDisplay();
      }
    } else {
      // Down arrow
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const historyItem = state.history[state.historyIndex];
        state.entryLine = historyItem.entry;
        updateDisplay();
      } else if (state.historyIndex === 0) {
        state.historyIndex = -1;
        state.entryLine = "";
        updateDisplay();
      }
    }
  }

  // Memory functions
  function storeValue() {
    if (!state.isOn) return;

    const value = state.resultLine
      ? parseFloat(state.resultLine)
      : parseFloat(state.entryLine) || 0;
    state.memory.M = value;
    showMessage(`Stored ${formatNumber(value)} in M`);
  }

  function recallValue() {
    if (!state.isOn) return;

    const value = state.memory.M.toString();
    state.entryLine += value;
    updateDisplay();
  }

  // Scientific functions
  function executeTrigFunction(func, isInverse = false) {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseFloat(evaluateExpression(parseExpression(state.entryLine)))
        : 0;
      let result;

      if (isInverse) {
        // Inverse functions
        switch (func) {
          case "sin":
            result = Math.asin(value);
            break;
          case "cos":
            result = Math.acos(value);
            break;
          case "tan":
            result = Math.atan(value);
            break;
        }
        result = convertRadiansToAngle(result);
      } else {
        // Regular functions
        const angleInRadians = convertAngleToRadians(value);
        switch (func) {
          case "sin":
            result = Math.sin(angleInRadians);
            break;
          case "cos":
            result = Math.cos(angleInRadians);
            break;
          case "tan":
            result = Math.tan(angleInRadians);
            break;
        }
      }

      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory(state.entryLine, state.resultLine);
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  function executeLogFunction(func, isInverse = false) {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseFloat(evaluateExpression(parseExpression(state.entryLine)))
        : 0;
      let result;

      if (isInverse) {
        // Inverse functions
        switch (func) {
          case "log":
            result = Math.pow(10, value);
            break;
          case "ln":
            result = Math.pow(E, value);
            break;
        }
      } else {
        // Regular functions
        switch (func) {
          case "log":
            result = Math.log10(value);
            break;
          case "ln":
            result = Math.log(value);
            break;
        }
      }

      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory(state.entryLine, state.resultLine);
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  function executeFactorial() {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseInt(evaluateExpression(parseExpression(state.entryLine)))
        : 0;

      if (value < 0 || value !== Math.floor(value)) {
        showError("Invalid input for factorial");
        return;
      }

      if (value > 170) {
        showError("Factorial too large");
        return;
      }

      let result = 1;
      for (let i = 2; i <= value; i++) {
        result *= i;
      }

      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory(state.entryLine + "!", state.resultLine);
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  function executePower(power) {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseFloat(evaluateExpression(parseExpression(state.entryLine)))
        : 0;
      const result = Math.pow(value, power);

      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory(
        state.entryLine + (power === 2 ? "²" : "³"),
        state.resultLine
      );
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  function executeSquareRoot() {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseFloat(evaluateExpression(parseExpression(state.entryLine)))
        : 0;

      if (value < 0) {
        showError("Invalid input for square root");
        return;
      }

      const result = Math.sqrt(value);
      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory("√(" + state.entryLine + ")", state.resultLine);
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  function executeReciprocal() {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseFloat(evaluateExpression(parseExpression(state.entryLine)))
        : 0;

      if (value === 0) {
        showError("Division by zero");
        return;
      }

      const result = 1 / value;
      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory("1/(" + state.entryLine + ")", state.resultLine);
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  function executeAbsolute() {
    if (!state.isOn) return;

    try {
      const value = state.entryLine
        ? parseFloat(evaluateExpression(parseExpression(state.entryLine)))
        : 0;
      const result = Math.abs(value);

      state.resultLine = formatNumber(result);
      state.lastAnswer = result;
      addToHistory("abs(" + state.entryLine + ")", state.resultLine);
      state.entryLine = "";
      updateDisplay();
    } catch (error) {
      showError("Invalid input");
    }
  }

  // Menu functions
  function openModeMenu() {
    const mode = prompt(
      "Select mode:\n1. Number Format (NORM/FIX/SCI/ENG)\n2. Angle Unit (DEG/RAD/GRAD)"
    );

    switch (mode) {
      case "1":
        const numFormat = prompt(
          "Select number format:\n1. NORM\n2. FIX\n3. SCI\n4. ENG"
        );
        const numFormats = ["", "NORM", "FIX", "SCI", "ENG"];
        if (numFormat && numFormats[parseInt(numFormat)]) {
          setDisplayMode(numFormats[parseInt(numFormat)]);
        }
        break;
      case "2":
        const angleMode = prompt("Select angle unit:\n1. DEG\n2. RAD\n3. GRAD");
        const angleModes = ["", "DEG", "RAD", "GRAD"];
        if (angleMode && angleModes[parseInt(angleMode)]) {
          setAngleMode(angleModes[parseInt(angleMode)]);
        }
        break;
    }
  }

  function setDisplayMode(mode) {
    if (!state.isOn) return;
    state.displayMode = mode;
    if (mode === "FIX") {
      const decimals = prompt("Enter number of decimal places (0-9):", "2");
      if (decimals !== null) {
        state.fixDecimals = Math.max(0, Math.min(9, parseInt(decimals) || 2));
      }
    }
    updateIndicators();
    if (state.resultLine) {
      state.resultLine = formatNumber(parseFloat(state.resultLine));
      updateDisplay();
    }
  }

  function setAngleMode(mode) {
    state.angleMode = mode;
    updateIndicators();
  }

  function showAngleMenu() {
    const angle = prompt("Select angle unit:\n1. DEG\n2. RAD\n3. GRAD");
    const angleModes = ["", "DEG", "RAD", "GRAD"];
    if (angle && angleModes[parseInt(angle)]) {
      setAngleMode(angleModes[parseInt(angle)]);
    }
  }

  function showMathMenu() {
    showMessage("Math menu not implemented");
  }

  function showAppsMenu() {
    showMessage("Apps menu not implemented");
  }

  function openStatisticsMenu() {
    showMessage("Statistics menu not implemented");
  }

  function openDataEditor() {
    showMessage("Data editor not implemented");
  }

  function openTableFunction() {
    showMessage("Table function not implemented");
  }

  function resetCalculator() {
    if (confirm("Reset all memory and settings?")) {
      state = {
        isOn: true,
        isSecondMode: false,
        isAlphaMode: false,
        angleMode: "DEG",
        displayMode: "NORM",
        fixDecimals: 2,
        entryLine: "",
        resultLine: "",
        history: [],
        memory: {
          M: 0,
          x: 0,
          y: 0,
          z: 0,
          t: 0,
          a: 0,
          b: 0,
          c: 0,
        },
        lists: {
          L1: [],
          L2: [],
          L3: [],
          L4: [],
          L5: [],
          L6: [],
        },
        lastAnswer: 0,
        cursorPosition: 0,
        isInsertMode: false,
        historyIndex: -1,
        isInStatMode: false,
      };
      updateDisplay();
      updateIndicators();
      showMessage("Calculator reset");
    }
  }

  // Calculation functions
  function calculate() {
    if (!state.isOn || !state.entryLine) return;

    try {
      const expression = parseExpression(state.entryLine);
      const result = evaluateExpression(expression);

      if (isFinite(result)) {
        state.lastAnswer = result;
        state.resultLine = formatNumber(result);

        // Add to history
        addToHistory(state.entryLine, state.resultLine);

        state.entryLine = "";
        state.historyIndex = -1;
      } else {
        showError("Invalid calculation");
      }
    } catch (error) {
      showError("Syntax error");
    }

    updateDisplay();
  }

  // Expression parsing and evaluation
  function parseExpression(expr) {
    // Replace display symbols with JavaScript operators
    expr = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-")
      .replace(/π/g, PI.toString())
      .replace(/e/g, E.toString())
      .replace(/E/g, "e"); // Scientific notation

    return expr;
  }

  function evaluateExpression(expr) {
    // Basic expression evaluation with safety checks
    // Remove any dangerous characters
    const sanitizedExpr = expr.replace(/[^0-9+\-*/().,e]/g, "");

    try {
      // Use Function constructor instead of eval for better safety
      const result = new Function("return " + sanitizedExpr)();
      return result;
    } catch (error) {
      throw new Error("Invalid expression");
    }
  }

  // Utility functions
  function formatNumber(num) {
    if (!isFinite(num)) return "Error";

    let formatted;

    switch (state.displayMode) {
      case "FIX":
        formatted = num.toFixed(state.fixDecimals);
        break;
      case "SCI":
        formatted = num.toExponential(state.fixDecimals);
        break;
      case "ENG":
        formatted = formatEngineering(num);
        break;
      default: // NORM
        if (Math.abs(num) < 1e-10 || Math.abs(num) > 1e10) {
          formatted = num.toExponential(DISPLAY_PRECISION);
        } else {
          formatted = parseFloat(num.toPrecision(DISPLAY_PRECISION)).toString();
        }
    }

    return formatted;
  }

  function formatEngineering(num) {
    if (num === 0) return "0";

    const sign = num < 0 ? -1 : 1;
    num = Math.abs(num);

    const exp = Math.floor(Math.log10(num));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = (sign * num) / Math.pow(10, engExp);

    return mantissa.toFixed(state.fixDecimals) + "E" + engExp;
  }

  function convertAngleToRadians(angle) {
    switch (state.angleMode) {
      case "DEG":
        return (angle * Math.PI) / 180;
      case "RAD":
        return angle;
      case "GRAD":
        return (angle * Math.PI) / 200;
      default:
        return angle;
    }
  }

  function convertRadiansToAngle(radians) {
    switch (state.angleMode) {
      case "DEG":
        return (radians * 180) / Math.PI;
      case "RAD":
        return radians;
      case "GRAD":
        return (radians * 200) / Math.PI;
      default:
        return radians;
    }
  }

  function getCurrentNumber() {
    // Extract the current number being entered
    const match = state.entryLine.match(/[-+]?[\d.]*$/);
    return match ? match[0] : "";
  }

  function isOperator(char) {
    return ["+", "−", "×", "÷", "^"].includes(char);
  }

  function addToHistory(entry, result) {
    state.history.unshift({ entry, result });
    if (state.history.length > HISTORY_SIZE) {
      state.history.pop();
    }
  }

  // Display update functions
  function updateDisplay() {
    if (!state.isOn) {
      elements.entryLine.textContent = "";
      elements.resultLine.textContent = "";
      elements.historyLine1.textContent = "";
      elements.historyLine2.textContent = "";
      return;
    }

    elements.entryLine.textContent = state.entryLine || "0";
    elements.resultLine.textContent = state.resultLine;

    // Update history lines
    if (state.history.length > 0) {
      elements.historyLine1.textContent = state.history[0].entry;
      elements.historyLine2.textContent = state.history[0].result;
    } else {
      elements.historyLine1.textContent = "";
      elements.historyLine2.textContent = "";
    }
  }

  function updateIndicators() {
    // Update status indicators
    elements.secondIndicator.classList.toggle("active", state.isSecondMode);
    elements.hypIndicator.classList.toggle("active", false); // HYP not implemented
    elements.fixIndicator.classList.toggle(
      "active",
      state.displayMode === "FIX"
    );
    elements.sciIndicator.classList.toggle(
      "active",
      state.displayMode === "SCI"
    );
    elements.engIndicator.classList.toggle(
      "active",
      state.displayMode === "ENG"
    );
    elements.angleIndicator.textContent = state.angleMode;
    elements.angleIndicator.classList.add("active");
    elements.kIndicator.classList.toggle("active", false); // K not implemented
    elements.statIndicator.classList.toggle("active", state.isInStatMode);
  }

  function updateButtonStates() {
    // Update button visual states based on modes
    elements.secondBtn.classList.toggle("secondary-active", state.isSecondMode);
  }

  // Error and message functions
  function showError(message) {
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.hidden = false;

    setTimeout(() => {
      elements.errorDisplay.hidden = true;
    }, 3000);
  }

  function showMessage(message) {
    // Use the error display for messages too, but with different styling
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.style.background = "#4299e1";
    elements.errorDisplay.hidden = false;

    setTimeout(() => {
      elements.errorDisplay.hidden = true;
      elements.errorDisplay.style.background = ""; // Reset to default
    }, 2000);
  }

  // Help panel functions
  function openHelp() {
    elements.helpPanel.classList.add("show");
    elements.helpPanel.setAttribute("aria-hidden", "false");

    // Focus on close button for accessibility
    setTimeout(() => {
      elements.helpCloseBtn.focus();
    }, 100);
  }

  function closeHelp() {
    elements.helpPanel.classList.remove("show");
    elements.helpPanel.setAttribute("aria-hidden", "true");

    // Return focus to calculator
    elements.display.focus();
  }

  // Public API
  return {
    init: init,
    getState: () => ({ ...state }),
    getMemory: () => ({ ...state.memory }),
  };
})();

// Initialize calculator when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  TI30XSCalculator.init();
});

// Export for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = TI30XSCalculator;
}
