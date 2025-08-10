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
    isHypMode: false,
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
    lastAnswer: 0,
    isInFractionMode: false,
    isInMixedMode: false,
    isInEE: false,
    isInConstant: false,
    constantValue: 0,
    cursorPosition: 0,
    isInsertMode: false,
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
      listIndicator: document.getElementById("list-indicator"),

      // Buttons
      onBtn: document.getElementById("on-btn"),
      offBtn: document.getElementById("off-btn"),
      secondBtn: document.getElementById("second-btn"),
      modeBtn: document.getElementById("mode-btn"),
      clearBtn: document.getElementById("clear-btn"),
      deleteBtn: document.getElementById("delete-btn"),
      insertBtn: document.getElementById("insert-btn"),
      ansBtn: document.getElementById("ans-btn"),

      // Memory buttons
      stoBtn: document.getElementById("sto-btn"),
      rclBtn: document.getElementById("rcl-btn"),
      mPlusBtn: document.getElementById("m-plus-btn"),
      mMinusBtn: document.getElementById("m-minus-btn"),

      // Scientific buttons
      sinBtn: document.getElementById("sin-btn"),
      cosBtn: document.getElementById("cos-btn"),
      tanBtn: document.getElementById("tan-btn"),
      logBtn: document.getElementById("log-btn"),
      lnBtn: document.getElementById("ln-btn"),
      piBtn: document.getElementById("pi-btn"),
      eBtn: document.getElementById("e-btn"),
      factorialBtn: document.getElementById("factorial-btn"),
      squareBtn: document.getElementById("square-btn"),
      cubeBtn: document.getElementById("cube-btn"),
      powerBtn: document.getElementById("power-btn"),
      sqrtBtn: document.getElementById("sqrt-btn"),

      // Fraction buttons
      fractionBtn: document.getElementById("fraction-btn"),
      mixedBtn: document.getElementById("mixed-btn"),
      reciprocalBtn: document.getElementById("reciprocal-btn"),
      absBtn: document.getElementById("abs-btn"),

      // Statistics buttons
      statBtn: document.getElementById("stat-btn"),
      dataBtn: document.getElementById("data-btn"),
      tableBtn: document.getElementById("table-btn"),
      constBtn: document.getElementById("const-btn"),

      // Number buttons
      numberBtns: {},

      // Operation buttons
      addBtn: document.getElementById("add-btn"),
      subtractBtn: document.getElementById("subtract-btn"),
      multiplyBtn: document.getElementById("multiply-btn"),
      divideBtn: document.getElementById("divide-btn"),
      equalsBtn: document.getElementById("equals-btn"),
      decimalBtn: document.getElementById("decimal-btn"),
      negativeBtn: document.getElementById("negative-btn"),
      leftParenBtn: document.getElementById("left-paren-btn"),
      rightParenBtn: document.getElementById("right-paren-btn"),
      eeBtn: document.getElementById("ee-btn"),

      // Navigation buttons
      leftArrowBtn: document.getElementById("left-arrow-btn"),
      rightArrowBtn: document.getElementById("right-arrow-btn"),
      upArrowBtn: document.getElementById("up-arrow-btn"),
      downArrowBtn: document.getElementById("down-arrow-btn"),

      // Special buttons
      hypBtn: document.getElementById("hyp-btn"),
      fixBtn: document.getElementById("fix-btn"),
      sciBtn: document.getElementById("sci-btn"),
      helpBtn: document.getElementById("help-btn"),

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
    // Power buttons
    elements.onBtn.addEventListener("click", turnOn);
    elements.offBtn.addEventListener("click", turnOff);

    // Mode buttons
    elements.secondBtn.addEventListener("click", toggleSecondMode);
    elements.modeBtn.addEventListener("click", openModeMenu);
    elements.hypBtn.addEventListener("click", toggleHypMode);

    // Clear and edit buttons
    elements.clearBtn.addEventListener("click", clearEntry);
    elements.deleteBtn.addEventListener("click", deleteCharacter);
    elements.insertBtn.addEventListener("click", toggleInsertMode);
    elements.ansBtn.addEventListener("click", insertAnswer);

    // Memory buttons
    elements.stoBtn.addEventListener("click", storeValue);
    elements.rclBtn.addEventListener("click", recallValue);
    elements.mPlusBtn.addEventListener("click", addToMemory);
    elements.mMinusBtn.addEventListener("click", subtractFromMemory);

    // Scientific function buttons
    elements.sinBtn.addEventListener("click", () => executeTrigFunction("sin"));
    elements.cosBtn.addEventListener("click", () => executeTrigFunction("cos"));
    elements.tanBtn.addEventListener("click", () => executeTrigFunction("tan"));
    elements.logBtn.addEventListener("click", () => executeLogFunction("log"));
    elements.lnBtn.addEventListener("click", () => executeLogFunction("ln"));
    elements.piBtn.addEventListener("click", insertConstant);
    elements.eBtn.addEventListener("click", insertConstant);
    elements.factorialBtn.addEventListener("click", executeFactorial);
    elements.squareBtn.addEventListener("click", () => executePower(2));
    elements.cubeBtn.addEventListener("click", () => executePower(3));
    elements.powerBtn.addEventListener("click", insertOperator);
    elements.sqrtBtn.addEventListener("click", executeSquareRoot);

    // Fraction buttons
    elements.fractionBtn.addEventListener("click", toggleFractionMode);
    elements.mixedBtn.addEventListener("click", toggleMixedMode);
    elements.reciprocalBtn.addEventListener("click", executeReciprocal);
    elements.absBtn.addEventListener("click", executeAbsolute);

    // Statistics buttons
    elements.statBtn.addEventListener("click", openStatistics);
    elements.dataBtn.addEventListener("click", openDataEditor);
    elements.tableBtn.addEventListener("click", openTableFunction);
    elements.constBtn.addEventListener("click", toggleConstant);

    // Number buttons
    Object.keys(elements.numberBtns).forEach((num) => {
      elements.numberBtns[num].addEventListener("click", () =>
        insertNumber(num)
      );
    });

    // Operation buttons
    elements.addBtn.addEventListener("click", () => insertOperator("+"));
    elements.subtractBtn.addEventListener("click", () => insertOperator("−"));
    elements.multiplyBtn.addEventListener("click", () => insertOperator("×"));
    elements.divideBtn.addEventListener("click", () => insertOperator("÷"));
    elements.equalsBtn.addEventListener("click", calculate);
    elements.decimalBtn.addEventListener("click", insertDecimal);
    elements.negativeBtn.addEventListener("click", insertNegative);
    elements.leftParenBtn.addEventListener("click", () => insertOperator("("));
    elements.rightParenBtn.addEventListener("click", () => insertOperator(")"));
    elements.eeBtn.addEventListener("click", insertEE);

    // Navigation buttons
    elements.leftArrowBtn.addEventListener("click", () => moveCursor(-1));
    elements.rightArrowBtn.addEventListener("click", () => moveCursor(1));
    elements.upArrowBtn.addEventListener("click", () => navigateHistory(-1));
    elements.downArrowBtn.addEventListener("click", () => navigateHistory(1));

    // Display format buttons
    elements.fixBtn.addEventListener("click", () => setDisplayMode("FIX"));
    elements.sciBtn.addEventListener("click", () => setDisplayMode("SCI"));

    // Help panel
    elements.helpBtn.addEventListener("click", openHelp);
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
    const keyCode = event.keyCode;

    // Prevent default for calculator keys
    if (isCalculatorKey(key, keyCode)) {
      event.preventDefault();
    }

    // Number keys
    if (key >= "0" && key <= "9") {
      insertNumber(key);
    }
    // Decimal
    else if (key === ".") {
      insertDecimal();
    }
    // Operators
    else if (key === "+") {
      insertOperator("+");
    } else if (key === "-") {
      insertOperator("−");
    } else if (key === "*") {
      insertOperator("×");
    } else if (key === "/") {
      insertOperator("÷");
    } else if (key === "^") {
      insertOperator("^");
    }
    // Parentheses
    else if (key === "(") {
      insertOperator("(");
    } else if (key === ")") {
      insertOperator(")");
    }
    // Enter/Equals
    else if (key === "Enter" || key === "=") {
      calculate();
    }
    // Backspace
    else if (key === "Backspace") {
      deleteCharacter();
    }
    // Escape
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
    // Home/End
    else if (key === "Home") {
      state.cursorPosition = 0;
      updateDisplay();
    } else if (key === "End") {
      state.cursorPosition = state.entryLine.length;
      updateDisplay();
    }
  }

  // Check if key is a calculator key
  function isCalculatorKey(key, keyCode) {
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
      "(",
      ")",
      "=",
      "Enter",
      "Backspace",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    return calculatorKeys.includes(key);
  }

  // Power functions
  function turnOn() {
    state.isOn = true;
    state.entryLine = "";
    state.resultLine = "";
    updateDisplay();
    updateIndicators();
    showMessage("Calculator turned on");
  }

  function turnOff() {
    state.isOn = false;
    state.entryLine = "";
    state.resultLine = "";
    updateDisplay();
    updateIndicators();
    showMessage("Calculator turned off");
  }

  // Mode functions
  function toggleSecondMode() {
    state.isSecondMode = !state.isSecondMode;
    updateIndicators();
    updateButtonStates();
  }

  function toggleHypMode() {
    state.isHypMode = !state.isHypMode;
    updateIndicators();
    updateButtonStates();
  }

  function setDisplayMode(mode) {
    state.displayMode = mode;
    if (mode === "FIX") {
      state.fixDecimals =
        prompt("Enter number of decimal places (0-9):", "2") || 2;
      state.fixDecimals = Math.max(0, Math.min(9, parseInt(state.fixDecimals)));
    }
    updateIndicators();
    updateDisplay();
  }

  function setAngleMode(mode) {
    state.angleMode = mode;
    updateIndicators();
  }

  // Input functions
  function insertNumber(num) {
    if (!state.isOn) return;

    if (state.entryLine.length >= MAX_DISPLAY_LENGTH) {
      showError("Entry too long");
      return;
    }

    if (state.isInFractionMode) {
      // Handle fraction input
      insertFractionNumber(num);
    } else {
      state.entryLine += num;
    }

    updateDisplay();
  }

  function insertDecimal() {
    if (!state.isOn) return;

    // Check if current number already has a decimal
    const currentNumber = getCurrentNumber();
    if (currentNumber.includes(".")) {
      showError("Decimal already exists");
      return;
    }

    state.entryLine += ".";
    updateDisplay();
  }

  function insertNegative() {
    if (!state.isOn) return;

    const currentNumber = getCurrentNumber();
    if (currentNumber.startsWith("-")) {
      // Remove negative
      state.entryLine = state.entryLine.replace(/^-/, "");
    } else {
      // Add negative
      state.entryLine = "-" + state.entryLine;
    }

    updateDisplay();
  }

  function insertOperator(operator) {
    if (!state.isOn) return;

    // Handle special operators based on mode
    if (state.isSecondMode) {
      switch (operator) {
        case "sin":
          operator = "sin⁻¹";
          break;
        case "cos":
          operator = "cos⁻¹";
          break;
        case "tan":
          operator = "tan⁻¹";
          break;
        case "log":
          operator = "10^x";
          break;
        case "ln":
          operator = "e^x";
          break;
      }
    }

    if (state.isHypMode) {
      switch (operator) {
        case "sin":
          operator = "sinh";
          break;
        case "cos":
          operator = "cosh";
          break;
        case "tan":
          operator = "tanh";
          break;
      }
    }

    state.entryLine += operator;
    updateDisplay();
  }

  function insertConstant() {
    if (!state.isOn) return;

    const constant = state.isSecondMode ? "e" : "π";
    const value = constant === "π" ? PI : E;

    if (state.isInFractionMode) {
      insertFractionNumber(value.toString());
    } else {
      state.entryLine += constant;
    }

    updateDisplay();
  }

  function insertAnswer() {
    if (!state.isOn) return;

    const answer = formatNumber(state.lastAnswer);
    state.entryLine += answer;
    updateDisplay();
  }

  function insertEE() {
    if (!state.isOn) return;

    state.isInEE = true;
    state.entryLine += "E";
    updateDisplay();
  }

  // Edit functions
  function clearEntry() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Clear all memory and reset
      clearAllMemory();
      showMessage("All memory cleared");
    } else {
      // Clear current entry
      state.entryLine = "";
      state.resultLine = "";
    }

    updateDisplay();
  }

  function deleteCharacter() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Insert mode
      toggleInsertMode();
    } else {
      // Delete character
      if (state.entryLine.length > 0) {
        state.entryLine = state.entryLine.slice(0, -1);
      }
    }

    updateDisplay();
  }

  function toggleInsertMode() {
    state.isInsertMode = !state.isInsertMode;
    updateIndicators();
  }

  function moveCursor(direction) {
    if (!state.isOn) return;

    const newPosition = state.cursorPosition + direction;
    if (newPosition >= 0 && newPosition <= state.entryLine.length) {
      state.cursorPosition = newPosition;
      updateDisplay();
    }
  }

  // Navigation functions
  function navigateHistory(direction) {
    if (!state.isOn || state.history.length === 0) return;

    // Implementation for history navigation
    // This would require additional state management for history position
    showMessage("History navigation not yet implemented");
  }

  // Memory functions
  function storeValue() {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    state.memory.M = value;
    showMessage(`Stored ${formatNumber(value)}`);
  }

  function recallValue() {
    if (!state.isOn) return;

    if (state.isSecondMode) {
      // Show memory variables menu
      showMemoryVariables();
    } else {
      // Recall M
      const value = formatNumber(state.memory.M);
      state.entryLine += value;
      updateDisplay();
    }
  }

  function addToMemory() {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    state.memory.M += value;
    showMessage(`Added ${formatNumber(value)} to memory`);
  }

  function subtractFromMemory() {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    state.memory.M -= value;
    showMessage(`Subtracted ${formatNumber(value)} from memory`);
  }

  function clearAllMemory() {
    state.memory = {
      M: 0,
      x: 0,
      y: 0,
      z: 0,
      t: 0,
      a: 0,
      b: 0,
      c: 0,
    };
    state.lastAnswer = 0;
    state.history = [];
  }

  // Scientific functions
  function executeTrigFunction(func) {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    let result;

    // Convert to radians if needed
    const angleInRadians = convertAngleToRadians(value);

    if (state.isSecondMode) {
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
    updateDisplay();
  }

  function executeLogFunction(func) {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    let result;

    if (state.isSecondMode) {
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
    updateDisplay();
  }

  function executeFactorial() {
    if (!state.isOn) return;

    const value = parseInt(state.resultLine) || 0;

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
    updateDisplay();
  }

  function executePower(power) {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    const result = Math.pow(value, power);

    state.resultLine = formatNumber(result);
    updateDisplay();
  }

  function executeSquareRoot() {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;

    if (value < 0) {
      showError("Invalid input for square root");
      return;
    }

    const result = Math.sqrt(value);
    state.resultLine = formatNumber(result);
    updateDisplay();
  }

  function executeReciprocal() {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;

    if (value === 0) {
      showError("Division by zero");
      return;
    }

    const result = 1 / value;
    state.resultLine = formatNumber(result);
    updateDisplay();
  }

  function executeAbsolute() {
    if (!state.isOn) return;

    const value = parseFloat(state.resultLine) || 0;
    const result = Math.abs(value);

    state.resultLine = formatNumber(result);
    updateDisplay();
  }

  // Fraction functions
  function toggleFractionMode() {
    state.isInFractionMode = !state.isInFractionMode;
    updateIndicators();
  }

  function toggleMixedMode() {
    state.isInMixedMode = !state.isInMixedMode;
    updateIndicators();
  }

  function insertFractionNumber(num) {
    // Simplified fraction input
    state.entryLine += num;
  }

  // Statistics functions
  function openStatistics() {
    showMessage("Statistics mode not yet implemented");
  }

  function openDataEditor() {
    showMessage("Data editor not yet implemented");
  }

  function openTableFunction() {
    showMessage("Table function not yet implemented");
  }

  function toggleConstant() {
    state.isInConstant = !state.isInConstant;
    updateIndicators();
  }

  // Calculation functions
  function calculate() {
    if (!state.isOn || !state.entryLine) return;

    try {
      // Parse and evaluate expression
      const expression = parseExpression(state.entryLine);
      const result = evaluateExpression(expression);

      if (isFinite(result)) {
        state.lastAnswer = result;
        state.resultLine = formatNumber(result);

        // Add to history
        addToHistory(state.entryLine, state.resultLine);

        state.entryLine = "";
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
      .replace(/e/g, E.toString());

    return expr;
  }

  function evaluateExpression(expr) {
    // Basic expression evaluation with PEMDAS
    // This is a simplified version - a full implementation would need
    // a proper expression parser for complex mathematical operations

    // For now, use eval with safety checks
    const sanitizedExpr = expr.replace(/[^0-9+\-*/().,]/g, "");
    return eval(sanitizedExpr);
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
        formatted = num.toExponential(DISPLAY_PRECISION);
        break;
      case "ENG":
        formatted = formatEngineering(num);
        break;
      default: // NORM
        formatted = num.toString();
        if (formatted.length > DISPLAY_PRECISION) {
          formatted = parseFloat(num.toPrecision(DISPLAY_PRECISION)).toString();
        }
    }

    return formatted;
  }

  function formatEngineering(num) {
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = num / Math.pow(10, engExp);
    return mantissa.toFixed(3) + "E" + engExp;
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
      return;
    }

    elements.entryLine.textContent = state.entryLine;
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
    elements.hypIndicator.classList.toggle("active", state.isHypMode);
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
    elements.kIndicator.classList.toggle("active", state.isInConstant);
  }

  function updateButtonStates() {
    // Update button visual states based on modes
    elements.secondBtn.classList.toggle("secondary-active", state.isSecondMode);
    elements.hypBtn.classList.toggle("hyp-active", state.isHypMode);
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
    // Simple message display - could be enhanced with a toast notification
    console.log(message);
  }

  // Menu functions
  function openModeMenu() {
    const modes = [
      { name: "Number Format", options: ["NORM", "FIX", "SCI", "ENG"] },
      { name: "Angle Unit", options: ["DEG", "RAD", "GRAD"] },
      { name: "Display Format", options: ["MathPrint", "Classic"] },
    ];

    // Simplified mode menu - could be enhanced with a proper modal
    const mode = prompt(
      "Select mode:\n1. Number Format\n2. Angle Unit\n3. Display Format"
    );

    switch (mode) {
      case "1":
        const numFormat = prompt(
          "Select number format:\n1. NORM\n2. FIX\n3. SCI\n4. ENG"
        );
        const numFormats = ["NORM", "FIX", "SCI", "ENG"];
        if (numFormat && numFormats[numFormat - 1]) {
          setDisplayMode(numFormats[numFormat - 1]);
        }
        break;
      case "2":
        const angleMode = prompt("Select angle unit:\n1. DEG\n2. RAD\n3. GRAD");
        const angleModes = ["DEG", "RAD", "GRAD"];
        if (angleMode && angleModes[angleMode - 1]) {
          setAngleMode(angleModes[angleMode - 1]);
        }
        break;
    }
  }

  function showMemoryVariables() {
    const variables = Object.keys(state.memory);
    const varList = variables
      .map((v) => `${v}: ${formatNumber(state.memory[v])}`)
      .join("\n");
    alert(`Memory Variables:\n${varList}`);
  }

  function openHelp() {
    elements.helpPanel.hidden = false;
  }

  function closeHelp() {
    elements.helpPanel.hidden = true;
  }

  // Public API
  return {
    init: init,
    turnOn: turnOn,
    turnOff: turnOff,
    calculate: calculate,
    clearEntry: clearEntry,
    deleteCharacter: deleteCharacter,
    insertNumber: insertNumber,
    insertOperator: insertOperator,
    insertDecimal: insertDecimal,
    insertNegative: insertNegative,
    toggleSecondMode: toggleSecondMode,
    toggleHypMode: toggleHypMode,
    setDisplayMode: setDisplayMode,
    setAngleMode: setAngleMode,
    storeValue: storeValue,
    recallValue: recallValue,
    addToMemory: addToMemory,
    subtractFromMemory: subtractFromMemory,
    executeTrigFunction: executeTrigFunction,
    executeLogFunction: executeLogFunction,
    executeFactorial: executeFactorial,
    executePower: executePower,
    executeSquareRoot: executeSquareRoot,
    executeReciprocal: executeReciprocal,
    executeAbsolute: executeAbsolute,
    toggleFractionMode: toggleFractionMode,
    toggleMixedMode: toggleMixedMode,
    toggleConstant: toggleConstant,
    openStatistics: openStatistics,
    openDataEditor: openDataEditor,
    openTableFunction: openTableFunction,
    openModeMenu: openModeMenu,
    moveCursor: moveCursor,
    navigateHistory: navigateHistory,
    showError: showError,
    showMessage: showMessage,
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
