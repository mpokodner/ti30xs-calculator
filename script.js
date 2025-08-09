/**
 * TI-30XS MultiView Scientific Calculator
 * A fully functional scientific calculator with authentic TI-30XS features
 *
 * Author: Senior Frontend Developer
 * License: Educational Use
 */

"use strict";

/**
 * Calculator Engine Module
 * Handles all mathematical operations and state management
 */
const CalculatorEngine = (() => {
  // Private state variables
  let currentExpression = "";
  let currentResult = "";
  let memory = 0;
  let isRadianMode = false; // Default to degree mode
  let is2ndFunction = false;
  let isAlphaFunction = false;
  let calculationHistory = [];
  let cursorPosition = 0;
  let lastAnswer = 0;

  // Mathematical constants
  const CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    MAX_DIGITS: 12,
    MAX_EXPRESSION_LENGTH: 200,
    EPSILON: 1e-10,
  };

  // Error types
  const ERRORS = {
    SYNTAX_ERROR: "SYNTAX ERROR",
    MATH_ERROR: "MATH ERROR",
    OVERFLOW: "OVERFLOW",
    DOMAIN_ERROR: "DOMAIN ERROR",
    DIVIDE_BY_ZERO: "DIVIDE BY ZERO",
  };

  /**
   * Mathematical utility functions
   */
  const MathUtils = {
    // Convert degrees to radians
    degToRad: (degrees) => degrees * (Math.PI / 180),

    // Convert radians to degrees
    radToDeg: (radians) => radians * (180 / Math.PI),

    // Factorial function
    factorial: (n) => {
      if (n < 0 || !Number.isInteger(n)) throw new Error(ERRORS.DOMAIN_ERROR);
      if (n > 170) throw new Error(ERRORS.OVERFLOW);
      if (n === 0 || n === 1) return 1;

      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    },

    // Combination function nCr
    combination: (n, r) => {
      if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        throw new Error(ERRORS.DOMAIN_ERROR);
      }
      if (r > n) return 0;
      if (r === 0 || r === n) return 1;

      r = Math.min(r, n - r); // Take advantage of symmetry
      let result = 1;
      for (let i = 0; i < r; i++) {
        result *= (n - i) / (i + 1);
      }
      return Math.round(result);
    },

    // Permutation function nPr
    permutation: (n, r) => {
      if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r)) {
        throw new Error(ERRORS.DOMAIN_ERROR);
      }
      if (r > n) return 0;

      let result = 1;
      for (let i = 0; i < r; i++) {
        result *= n - i;
      }
      return result;
    },

    // Format number for display
    formatNumber: (num) => {
      if (!isFinite(num)) {
        if (isNaN(num)) return ERRORS.MATH_ERROR;
        return num > 0 ? "∞" : "-∞";
      }

      if (Math.abs(num) < CONSTANTS.EPSILON) return "0";

      const absNum = Math.abs(num);
      const sign = num < 0 ? "-" : "";

      // Scientific notation for very large or very small numbers
      if (absNum >= 1e10 || (absNum < 1e-4 && absNum !== 0)) {
        return sign + absNum.toExponential(6);
      }

      // Regular formatting
      if (absNum >= 1) {
        return sign + absNum.toPrecision(Math.min(CONSTANTS.MAX_DIGITS, 15));
      } else {
        return sign + absNum.toFixed(Math.min(CONSTANTS.MAX_DIGITS - 1, 10));
      }
    },

    // Check if number is close to an integer
    isNearInteger: (num) => Math.abs(num - Math.round(num)) < CONSTANTS.EPSILON,
  };

  /**
   * Expression parser and evaluator
   */
  const ExpressionParser = {
    // Tokenize expression
    tokenize: (expression) => {
      const tokens = [];
      const regex =
        /(\d+\.?\d*|[+\-*/()^!%]|sin|cos|tan|log|ln|sqrt|abs|asin|acos|atan|nCr|nPr|π|e)/g;
      let match;

      while ((match = regex.exec(expression)) !== null) {
        tokens.push(match[0]);
      }

      return tokens;
    },

    // Convert infix to postfix notation (Shunting Yard Algorithm)
    infixToPostfix: (tokens) => {
      const output = [];
      const operators = [];

      const precedence = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "%": 2,
        "^": 3,
        "!": 4,
        sin: 5,
        cos: 5,
        tan: 5,
        asin: 5,
        acos: 5,
        atan: 5,
        log: 5,
        ln: 5,
        sqrt: 5,
        abs: 5,
        nCr: 4,
        nPr: 4,
      };

      const rightAssociative = ["^"];
      const functions = [
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "log",
        "ln",
        "sqrt",
        "abs",
      ];

      for (let token of tokens) {
        if (!isNaN(token) || token === "π" || token === "e") {
          output.push(token);
        } else if (functions.includes(token)) {
          operators.push(token);
        } else if (token === "(") {
          operators.push(token);
        } else if (token === ")") {
          while (operators.length && operators[operators.length - 1] !== "(") {
            output.push(operators.pop());
          }
          operators.pop(); // Remove '('

          // Pop function if present
          if (
            operators.length &&
            functions.includes(operators[operators.length - 1])
          ) {
            output.push(operators.pop());
          }
        } else if (precedence[token]) {
          while (
            operators.length &&
            operators[operators.length - 1] !== "(" &&
            (precedence[operators[operators.length - 1]] > precedence[token] ||
              (precedence[operators[operators.length - 1]] ===
                precedence[token] &&
                !rightAssociative.includes(token)))
          ) {
            output.push(operators.pop());
          }
          operators.push(token);
        }
      }

      while (operators.length) {
        output.push(operators.pop());
      }

      return output;
    },

    // Evaluate postfix expression
    evaluatePostfix: (postfixTokens) => {
      const stack = [];

      for (let token of postfixTokens) {
        if (!isNaN(token)) {
          stack.push(parseFloat(token));
        } else if (token === "π") {
          stack.push(CONSTANTS.PI);
        } else if (token === "e") {
          stack.push(CONSTANTS.E);
        } else {
          const result = this.applyOperation(token, stack);
          stack.push(result);
        }
      }

      if (stack.length !== 1) throw new Error(ERRORS.SYNTAX_ERROR);
      return stack[0];
    },

    // Apply mathematical operations
    applyOperation: (operator, stack) => {
      switch (operator) {
        case "+":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          return stack.pop() + stack.pop();

        case "-":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          const subtrahend = stack.pop();
          return stack.pop() - subtrahend;

        case "*":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          return stack.pop() * stack.pop();

        case "/":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          const divisor = stack.pop();
          if (Math.abs(divisor) < CONSTANTS.EPSILON)
            throw new Error(ERRORS.DIVIDE_BY_ZERO);
          return stack.pop() / divisor;

        case "%":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          const modDivisor = stack.pop();
          if (Math.abs(modDivisor) < CONSTANTS.EPSILON)
            throw new Error(ERRORS.DIVIDE_BY_ZERO);
          return stack.pop() % modDivisor;

        case "^":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          const exponent = stack.pop();
          const base = stack.pop();
          const result = Math.pow(base, exponent);
          if (!isFinite(result)) throw new Error(ERRORS.OVERFLOW);
          return result;

        case "!":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          return MathUtils.factorial(stack.pop());

        case "sin":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const sinArg = stack.pop();
          return Math.sin(isRadianMode ? sinArg : MathUtils.degToRad(sinArg));

        case "cos":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const cosArg = stack.pop();
          return Math.cos(isRadianMode ? cosArg : MathUtils.degToRad(cosArg));

        case "tan":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const tanArg = stack.pop();
          return Math.tan(isRadianMode ? tanArg : MathUtils.degToRad(tanArg));

        case "asin":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const asinArg = stack.pop();
          if (Math.abs(asinArg) > 1) throw new Error(ERRORS.DOMAIN_ERROR);
          const asinResult = Math.asin(asinArg);
          return isRadianMode ? asinResult : MathUtils.radToDeg(asinResult);

        case "acos":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const acosArg = stack.pop();
          if (Math.abs(acosArg) > 1) throw new Error(ERRORS.DOMAIN_ERROR);
          const acosResult = Math.acos(acosArg);
          return isRadianMode ? acosResult : MathUtils.radToDeg(acosResult);

        case "atan":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const atanArg = stack.pop();
          const atanResult = Math.atan(atanArg);
          return isRadianMode ? atanResult : MathUtils.radToDeg(atanResult);

        case "log":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const logArg = stack.pop();
          if (logArg <= 0) throw new Error(ERRORS.DOMAIN_ERROR);
          return Math.log10(logArg);

        case "ln":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const lnArg = stack.pop();
          if (lnArg <= 0) throw new Error(ERRORS.DOMAIN_ERROR);
          return Math.log(lnArg);

        case "sqrt":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          const sqrtArg = stack.pop();
          if (sqrtArg < 0) throw new Error(ERRORS.DOMAIN_ERROR);
          return Math.sqrt(sqrtArg);

        case "abs":
          if (stack.length < 1) throw new Error(ERRORS.SYNTAX_ERROR);
          return Math.abs(stack.pop());

        case "nCr":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          const r = stack.pop();
          const n = stack.pop();
          return MathUtils.combination(n, r);

        case "nPr":
          if (stack.length < 2) throw new Error(ERRORS.SYNTAX_ERROR);
          const pR = stack.pop();
          const pN = stack.pop();
          return MathUtils.permutation(pN, pR);

        default:
          throw new Error(ERRORS.SYNTAX_ERROR);
      }
    },
  };

  // Public API
  return {
    // Initialize calculator
    init() {
      this.clear();
      this.loadMemoryFromStorage();
      this.loadHistoryFromStorage();
    },

    // Add character to current expression
    addToExpression(char) {
      if (currentExpression.length >= CONSTANTS.MAX_EXPRESSION_LENGTH) {
        throw new Error("Expression too long");
      }

      currentExpression =
        currentExpression.slice(0, cursorPosition) +
        char +
        currentExpression.slice(cursorPosition);
      cursorPosition += char.length;
      return currentExpression;
    },

    // Delete character at cursor position
    deleteAtCursor() {
      if (cursorPosition > 0) {
        currentExpression =
          currentExpression.slice(0, cursorPosition - 1) +
          currentExpression.slice(cursorPosition);
        cursorPosition--;
      }
      return currentExpression;
    },

    // Clear current expression
    clearExpression() {
      currentExpression = "";
      cursorPosition = 0;
      return currentExpression;
    },

    // Clear all (expression and result)
    clear() {
      currentExpression = "";
      currentResult = "";
      cursorPosition = 0;
      is2ndFunction = false;
      isAlphaFunction = false;
      return { expression: currentExpression, result: currentResult };
    },

    // Calculate result
    calculate() {
      try {
        if (!currentExpression.trim()) {
          currentResult = "0";
          return currentResult;
        }

        // Preprocess expression
        let processedExpression = this.preprocessExpression(currentExpression);

        // Tokenize and parse
        const tokens = ExpressionParser.tokenize(processedExpression);
        const postfixTokens = ExpressionParser.infixToPostfix(tokens);
        const result = ExpressionParser.evaluatePostfix(postfixTokens);

        // Format result
        currentResult = MathUtils.formatNumber(result);
        lastAnswer = result;

        // Add to history
        this.addToHistory(currentExpression, currentResult);

        return currentResult;
      } catch (error) {
        currentResult = error.message || ERRORS.MATH_ERROR;
        return currentResult;
      }
    },

    // Preprocess expression for calculation
    preprocessExpression(expr) {
      return expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "^")
        .replace(/sin⁻¹/g, "asin")
        .replace(/cos⁻¹/g, "acos")
        .replace(/tan⁻¹/g, "atan")
        .replace(/10\^x/g, "10^")
        .replace(/e\^x/g, "e^")
        .replace(/x²/g, "^2")
        .replace(/√/g, "sqrt")
        .replace(/1\/x/g, "1/")
        .replace(/\(-\)/g, "-");
    },

    // Memory operations
    memoryClear() {
      memory = 0;
      this.saveMemoryToStorage();
      return memory;
    },

    memoryRecall() {
      return memory;
    },

    memoryStore(value) {
      memory = parseFloat(value) || 0;
      this.saveMemoryToStorage();
      return memory;
    },

    memoryAdd(value) {
      memory += parseFloat(value) || 0;
      this.saveMemoryToStorage();
      return memory;
    },

    memorySubtract(value) {
      memory -= parseFloat(value) || 0;
      this.saveMemoryToStorage();
      return memory;
    },

    // Mode operations
    toggleAngleMode() {
      isRadianMode = !isRadianMode;
      return isRadianMode;
    },

    getAngleMode() {
      return isRadianMode ? "RAD" : "DEG";
    },

    // Function mode operations
    set2ndFunction(active) {
      is2ndFunction = active;
      return is2ndFunction;
    },

    get2ndFunction() {
      return is2ndFunction;
    },

    setAlphaFunction(active) {
      isAlphaFunction = active;
      return isAlphaFunction;
    },

    getAlphaFunction() {
      return isAlphaFunction;
    },

    // History operations
    addToHistory(expression, result) {
      const historyItem = {
        expression,
        result,
        timestamp: new Date().toISOString(),
      };

      calculationHistory.unshift(historyItem);

      // Keep only last 50 calculations
      if (calculationHistory.length > 50) {
        calculationHistory = calculationHistory.slice(0, 50);
      }

      this.saveHistoryToStorage();
      return calculationHistory;
    },

    getHistory() {
      return calculationHistory;
    },

    clearHistory() {
      calculationHistory = [];
      this.saveHistoryToStorage();
      return calculationHistory;
    },

    // Storage operations
    saveMemoryToStorage() {
      try {
        localStorage.setItem("ti30xs-memory", memory.toString());
      } catch (e) {
        console.warn("Could not save memory to localStorage:", e);
      }
    },

    loadMemoryFromStorage() {
      try {
        const savedMemory = localStorage.getItem("ti30xs-memory");
        if (savedMemory !== null) {
          memory = parseFloat(savedMemory) || 0;
        }
      } catch (e) {
        console.warn("Could not load memory from localStorage:", e);
      }
    },

    saveHistoryToStorage() {
      try {
        localStorage.setItem(
          "ti30xs-history",
          JSON.stringify(calculationHistory)
        );
      } catch (e) {
        console.warn("Could not save history to localStorage:", e);
      }
    },

    loadHistoryFromStorage() {
      try {
        const savedHistory = localStorage.getItem("ti30xs-history");
        if (savedHistory) {
          calculationHistory = JSON.parse(savedHistory) || [];
        }
      } catch (e) {
        console.warn("Could not load history from localStorage:", e);
      }
    },

    // Getters
    getCurrentExpression() {
      return currentExpression;
    },

    getCurrentResult() {
      return currentResult;
    },

    getCursorPosition() {
      return cursorPosition;
    },

    setCursorPosition(position) {
      cursorPosition = Math.max(
        0,
        Math.min(position, currentExpression.length)
      );
      return cursorPosition;
    },

    getLastAnswer() {
      return lastAnswer;
    },

    hasMemory() {
      return Math.abs(memory) > CONSTANTS.EPSILON;
    },
  };
})();

/**
 * User Interface Controller
 * Handles all UI interactions and updates
 */
const UIController = (() => {
  // DOM elements
  let elements = {};

  // Animation classes
  const ANIMATION_CLASSES = {
    BUTTON_PRESSED: "btn--pressed",
    DISPLAY_UPDATING: "display--updating",
    CALCULATOR_ERROR: "calculator--error",
  };

  // Initialize UI
  function init() {
    cacheDOM();
    bindEvents();
    updateDisplay();
    updateIndicators();
    loadHistory();
  }

  // Cache DOM elements
  function cacheDOM() {
    elements = {
      calculator: document.querySelector(".calculator"),
      entryDisplay: document.getElementById("entry-display"),
      resultDisplay: document.getElementById("result-display"),
      degIndicator: document.getElementById("deg-indicator"),
      memoryIndicator: document.getElementById("memory-indicator"),
      shiftIndicator: document.getElementById("shift-indicator"),
      alphaIndicator: document.getElementById("alpha-indicator"),
      keypad: document.querySelector(".calculator__keypad"),
      historyPanel: document.getElementById("history-panel"),
      historyList: document.getElementById("history-list"),
      clearHistoryBtn: document.getElementById("clear-history"),
      errorModal: document.getElementById("error-modal"),
      errorTitle: document.getElementById("error-title"),
      errorMessage: document.getElementById("error-message"),
      errorOkBtn: document.getElementById("error-ok"),
      errorCloseBtn: document.querySelector(".modal__close"),
      srAnnouncements: document.getElementById("sr-announcements"),
    };
  }

  // Bind event listeners
  function bindEvents() {
    // Button clicks
    elements.keypad.addEventListener("click", handleButtonClick);

    // Keyboard input
    document.addEventListener("keydown", handleKeyboardInput);

    // History panel
    elements.clearHistoryBtn?.addEventListener("click", clearHistory);
    elements.historyList?.addEventListener("click", handleHistoryClick);

    // Error modal
    elements.errorOkBtn?.addEventListener("click", closeErrorModal);
    elements.errorCloseBtn?.addEventListener("click", closeErrorModal);
    elements.errorModal?.addEventListener("click", (e) => {
      if (e.target === elements.errorModal) closeErrorModal();
    });

    // Prevent context menu on buttons
    elements.keypad.addEventListener("contextmenu", (e) => e.preventDefault());

    // Handle focus management
    document.addEventListener("focusin", handleFocusIn);
  }

  // Handle button clicks
  function handleButtonClick(e) {
    const button = e.target.closest(".btn");
    if (!button) return;

    e.preventDefault();
    animateButton(button);

    const key = button.dataset.key;
    if (key) {
      processInput(key, button);
    }
  }

  // Handle keyboard input
  function handleKeyboardInput(e) {
    // Don't interfere with browser shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const keyMap = {
      0: "0",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      "+": "add",
      "-": "subtract",
      "*": "multiply",
      "/": "divide",
      Enter: "enter",
      "=": "enter",
      Escape: "clear",
      Backspace: "del",
      Delete: "del",
      ".": "decimal",
      ",": "decimal",
      "(": "leftparen",
      ")": "rightparen",
      s: "sin",
      c: "cos",
      t: "tan",
      l: "log",
      n: "ln",
      r: "sqrt",
      p: "pi",
      e: "ee",
      ArrowLeft: "left",
      ArrowRight: "right",
      m: "mode",
      M: "mode",
    };

    const mappedKey = keyMap[e.key];
    if (mappedKey) {
      e.preventDefault();

      // Find and animate corresponding button
      const button = document.querySelector(`[data-key="${mappedKey}"]`);
      if (button) {
        animateButton(button);
        processInput(mappedKey, button);
      }
    }
  }

  // Process user input
  function processInput(key, button) {
    try {
      const is2nd = CalculatorEngine.get2ndFunction();
      const isAlpha = CalculatorEngine.getAlphaFunction();

      switch (key) {
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          CalculatorEngine.addToExpression(key);
          break;

        case "decimal":
          CalculatorEngine.addToExpression(".");
          break;

        case "add":
          CalculatorEngine.addToExpression(" + ");
          break;

        case "subtract":
          CalculatorEngine.addToExpression(" − ");
          break;

        case "multiply":
          CalculatorEngine.addToExpression(" × ");
          break;

        case "divide":
          CalculatorEngine.addToExpression(" ÷ ");
          break;

        case "leftparen":
          CalculatorEngine.addToExpression(is2nd ? "{" : "(");
          break;

        case "rightparen":
          CalculatorEngine.addToExpression(is2nd ? "}" : ")");
          break;

        case "enter":
          const result = CalculatorEngine.calculate();
          announceToScreenReader(`Result: ${result}`);
          break;

        case "clear":
          CalculatorEngine.clear();
          announceToScreenReader("Calculator cleared");
          break;

        case "del":
          CalculatorEngine.deleteAtCursor();
          break;

        case "2nd":
          const new2ndState = !CalculatorEngine.get2ndFunction();
          CalculatorEngine.set2ndFunction(new2ndState);
          CalculatorEngine.setAlphaFunction(false); // Clear alpha when 2nd is activated
          announceToScreenReader(
            new2ndState
              ? "Second function activated"
              : "Second function deactivated"
          );
          break;

        case "alpha":
          const newAlphaState = !CalculatorEngine.getAlphaFunction();
          CalculatorEngine.setAlphaFunction(newAlphaState);
          CalculatorEngine.set2ndFunction(false); // Clear 2nd when alpha is activated
          announceToScreenReader(
            newAlphaState
              ? "Alpha function activated"
              : "Alpha function deactivated"
          );
          break;

        case "mode":
          const newMode = CalculatorEngine.toggleAngleMode();
          announceToScreenReader(
            `Angle mode: ${CalculatorEngine.getAngleMode()}`
          );
          break;

        case "sin":
          CalculatorEngine.addToExpression(is2nd ? "sin⁻¹(" : "sin(");
          break;

        case "cos":
          CalculatorEngine.addToExpression(is2nd ? "cos⁻¹(" : "cos(");
          break;

        case "tan":
          CalculatorEngine.addToExpression(is2nd ? "tan⁻¹(" : "tan(");
          break;

        case "log":
          CalculatorEngine.addToExpression(is2nd ? "10^(" : "log(");
          break;

        case "ln":
          CalculatorEngine.addToExpression(is2nd ? "e^(" : "ln(");
          break;

        case "x2":
          CalculatorEngine.addToExpression(is2nd ? "√(" : "^2");
          break;

        case "xy":
          CalculatorEngine.addToExpression(is2nd ? "y√(" : "^(");
          break;

        case "1x":
          CalculatorEngine.addToExpression(is2nd ? "nCr(" : "1/");
          break;

        case "neg":
          CalculatorEngine.addToExpression(is2nd ? "π" : "(-)");
          break;

        case "ee":
          CalculatorEngine.addToExpression(is2nd ? "nPr(" : "EE");
          break;

        case "sto":
          if (CalculatorEngine.getCurrentResult()) {
            CalculatorEngine.memoryStore(CalculatorEngine.getCurrentResult());
            announceToScreenReader("Value stored to memory");
          }
          break;

        case "rcl":
          const memoryValue = CalculatorEngine.memoryRecall();
          CalculatorEngine.addToExpression(memoryValue.toString());
          announceToScreenReader(`Memory recalled: ${memoryValue}`);
          break;

        case "mplus":
          if (CalculatorEngine.getCurrentResult()) {
            CalculatorEngine.memoryAdd(CalculatorEngine.getCurrentResult());
            announceToScreenReader("Value added to memory");
          }
          break;

        case "mminus":
          if (CalculatorEngine.getCurrentResult()) {
            CalculatorEngine.memorySubtract(
              CalculatorEngine.getCurrentResult()
            );
            announceToScreenReader("Value subtracted from memory");
          }
          break;

        case "left":
          const currentPos = CalculatorEngine.getCursorPosition();
          CalculatorEngine.setCursorPosition(currentPos - 1);
          break;

        case "right":
          const currentPos2 = CalculatorEngine.getCursorPosition();
          CalculatorEngine.setCursorPosition(currentPos2 + 1);
          break;

        case "percent":
          CalculatorEngine.addToExpression(" % ");
          break;

        case "frac":
          CalculatorEngine.addToExpression("a b/c");
          break;

        default:
          console.warn("Unhandled key:", key);
      }

      // Clear function modes after operation (except for mode toggles)
      if (!["2nd", "alpha", "mode"].includes(key)) {
        CalculatorEngine.set2ndFunction(false);
        CalculatorEngine.setAlphaFunction(false);
      }
    } catch (error) {
      showError("Input Error", error.message);
    }

    updateDisplay();
    updateIndicators();
  }

  // Animate button press
  function animateButton(button) {
    button.classList.add(ANIMATION_CLASSES.BUTTON_PRESSED);

    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    setTimeout(() => {
      button.classList.remove(ANIMATION_CLASSES.BUTTON_PRESSED);
    }, 150);
  }

  // Update display
  function updateDisplay() {
    const expression = CalculatorEngine.getCurrentExpression() || "0";
    const result = CalculatorEngine.getCurrentResult();

    elements.entryDisplay.textContent = expression;
    elements.resultDisplay.textContent = result;

    // Add updating animation
    elements.entryDisplay.classList.add(ANIMATION_CLASSES.DISPLAY_UPDATING);
    elements.resultDisplay.classList.add(ANIMATION_CLASSES.DISPLAY_UPDATING);

    setTimeout(() => {
      elements.entryDisplay.classList.remove(
        ANIMATION_CLASSES.DISPLAY_UPDATING
      );
      elements.resultDisplay.classList.remove(
        ANIMATION_CLASSES.DISPLAY_UPDATING
      );
    }, 200);
  }

  // Update indicators
  function updateIndicators() {
    const angleMode = CalculatorEngine.getAngleMode();
    const hasMemory = CalculatorEngine.hasMemory();
    const is2nd = CalculatorEngine.get2ndFunction();
    const isAlpha = CalculatorEngine.getAlphaFunction();

    // Update angle mode indicator
    elements.degIndicator.textContent = angleMode;
    elements.degIndicator.classList.toggle("indicator--active", true);

    // Update memory indicator
    elements.memoryIndicator.classList.toggle("indicator--active", hasMemory);

    // Update function indicators
    elements.shiftIndicator.classList.toggle("indicator--active", is2nd);
    elements.alphaIndicator.classList.toggle("indicator--active", isAlpha);

    // Update button states
    updateButtonStates(is2nd, isAlpha);
  }

  // Update button visual states based on active functions
  function updateButtonStates(is2nd, isAlpha) {
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((button) => {
      button.classList.remove("btn--active");

      if (is2nd && button.dataset.key === "2nd") {
        button.classList.add("btn--active");
      }

      if (isAlpha && button.dataset.key === "alpha") {
        button.classList.add("btn--active");
      }
    });
  }

  // Show error modal
  function showError(title, message) {
    elements.errorTitle.textContent = title;
    elements.errorMessage.textContent = message;
    elements.errorModal.hidden = false;
    elements.errorOkBtn.focus();

    // Add error animation to calculator
    elements.calculator.classList.add(ANIMATION_CLASSES.CALCULATOR_ERROR);
    setTimeout(() => {
      elements.calculator.classList.remove(ANIMATION_CLASSES.CALCULATOR_ERROR);
    }, 300);

    announceToScreenReader(`Error: ${message}`);
  }

  // Close error modal
  function closeErrorModal() {
    elements.errorModal.hidden = true;
  }

  // Handle history operations
  function loadHistory() {
    const history = CalculatorEngine.getHistory();
    updateHistoryDisplay(history);
  }

  function clearHistory() {
    CalculatorEngine.clearHistory();
    updateHistoryDisplay([]);
    announceToScreenReader("History cleared");
  }

  function handleHistoryClick(e) {
    const historyItem = e.target.closest(".history__item");
    if (!historyItem) return;

    const expression = historyItem.dataset.expression;
    if (expression) {
      CalculatorEngine.clearExpression();
      CalculatorEngine.addToExpression(expression);
      updateDisplay();
      announceToScreenReader(`Loaded from history: ${expression}`);
    }
  }

  function updateHistoryDisplay(history) {
    if (!elements.historyList) return;

    elements.historyList.innerHTML = "";

    history.forEach((item, index) => {
      const historyElement = document.createElement("div");
      historyElement.className = "history__item";
      historyElement.dataset.expression = item.expression;
      historyElement.innerHTML = `
        <div class="history__expression">${item.expression}</div>
        <div class="history__result">${item.result}</div>
      `;
      historyElement.setAttribute("role", "button");
      historyElement.setAttribute("tabindex", "0");
      historyElement.setAttribute(
        "aria-label",
        `History item ${index + 1}: ${item.expression} equals ${item.result}`
      );

      elements.historyList.appendChild(historyElement);
    });
  }

  // Screen reader announcements
  function announceToScreenReader(message) {
    if (elements.srAnnouncements) {
      elements.srAnnouncements.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        elements.srAnnouncements.textContent = "";
      }, 1000);
    }
  }

  // Handle focus management for accessibility
  function handleFocusIn(e) {
    const button = e.target.closest(".btn");
    if (button) {
      const primary = button.querySelector(".btn__primary")?.textContent;
      const secondary = button.querySelector(".btn__secondary")?.textContent;

      let announcement = `Button: ${primary}`;
      if (secondary && CalculatorEngine.get2ndFunction()) {
        announcement += `, second function: ${secondary}`;
      }

      announceToScreenReader(announcement);
    }
  }

  // Public API
  return {
    init,
    updateDisplay,
    updateIndicators,
    showError,
    announceToScreenReader,
  };
})();

/**
 * Application Initialization
 */
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize calculator engine
    CalculatorEngine.init();

    // Initialize UI controller
    UIController.init();

    // Set initial focus
    const firstButton = document.querySelector(".btn");
    if (firstButton) {
      firstButton.focus();
    }

    console.log("TI-30XS MultiView Calculator initialized successfully");

    // Register service worker for offline functionality (if available)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service worker registration failed:", err);
      });
    }
  } catch (error) {
    console.error("Failed to initialize calculator:", error);
    UIController.showError(
      "Initialization Error",
      "Calculator failed to initialize properly. Please refresh the page."
    );
  }
});

// Export for testing purposes
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CalculatorEngine, UIController };
}
