const display = document.getElementById('display');
const historyEl = document.getElementById('history');
const buttons = document.querySelectorAll('.btn');

let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;
let justCalculated = false;

function updateDisplay() {
  const parts = currentInput.split('.');
  if (parts[0].length > 12) {
    display.style.fontSize = '1.5rem';
  } else if (parts[0].length > 8) {
    display.style.fontSize = '2rem';
  } else {
    display.style.fontSize = '2.5rem';
  }
  display.innerText = currentInput;
}

function updateHistory() {
  if (operator && previousInput) {
    const opSymbol = getOperatorSymbol(operator);
    historyEl.innerText = `${formatNumber(previousInput)} ${opSymbol}`;
  } else if (!operator && !previousInput && justCalculated) {
    historyEl.innerText = '';
  } else {
    historyEl.innerText = '';
  }
}

function getOperatorSymbol(op) {
  switch (op) {
    case '+': return '+';
    case '-': return '-';
    case '*': return '×';
    case '/': return '÷';
    default: return op;
  }
}

function formatNumber(num) {
  const str = String(num);
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function inputNumber(num) {
  if (justCalculated) {
    currentInput = '0';
    previousInput = '';
    operator = null;
    justCalculated = false;
  }

  if (shouldResetDisplay) {
    currentInput = '0';
    shouldResetDisplay = false;
  }

  if (currentInput === '0' && num !== '.') {
    currentInput = num;
  } else {
    if (currentInput.length >= 15) return;
    currentInput += num;
  }

  updateDisplay();
  updateHistory();
}

function inputDecimal() {
  if (justCalculated) {
    currentInput = '0';
    previousInput = '';
    operator = null;
    justCalculated = false;
  }

  if (shouldResetDisplay) {
    currentInput = '0';
    shouldResetDisplay = false;
  }

  if (!currentInput.includes('.')) {
    currentInput += '.';
  }

  updateDisplay();
  updateHistory();
}

function handleOperator(op) {
  if (justCalculated) {
    justCalculated = false;
  }

  const current = parseFloat(currentInput);

  if (operator && !shouldResetDisplay) {
    const result = calculate(parseFloat(previousInput), current, operator);
    currentInput = String(result);
    previousInput = currentInput;
    updateDisplay();
  } else {
    previousInput = currentInput;
  }

  operator = op;
  shouldResetDisplay = true;
  updateHistory();
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/':
      if (b === 0) {
        return 'Error';
      }
      return a / b;
    default: return b;
  }
}

function calculateResult() {
  if (!operator) return;
  if (shouldResetDisplay) return;

  const a = parseFloat(previousInput);
  const b = parseFloat(currentInput);
  const result = calculate(a, b, operator);

  if (result === 'Error') {
    const errHistory = `${formatNumber(previousInput)} ${getOperatorSymbol(operator)} ${formatNumber(currentInput)} =`;
    currentInput = 'Error';
    display.innerText = 'Error';
    display.style.fontSize = '2rem';
    historyEl.innerText = errHistory;
    operator = null;
    previousInput = '';
    shouldResetDisplay = true;
    justCalculated = true;
    return;
  }

  const resultStr = Number.isInteger(result) ? String(result) : parseFloat(result.toFixed(10)).toString();
  historyEl.innerText = `${formatNumber(previousInput)} ${getOperatorSymbol(operator)} ${formatNumber(currentInput)} =`;
  currentInput = resultStr;
  operator = null;
  previousInput = '';
  shouldResetDisplay = true;
  justCalculated = true;
  updateDisplay();
}

function clearAll() {
  currentInput = '0';
  previousInput = '';
  operator = null;
  shouldResetDisplay = false;
  justCalculated = false;
  display.style.fontSize = '2.5rem';
  updateDisplay();
  historyEl.innerText = '';
}

function deleteLast() {
  if (justCalculated) {
    clearAll();
    return;
  }
  if (currentInput === 'Error') {
    clearAll();
    return;
  }
  if (shouldResetDisplay) return;

  if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }

  updateDisplay();
}

function handleButtonClick(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'number':
      inputNumber(value);
      break;
    case 'operator':
      handleOperator(value);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'calculate':
      calculateResult();
      break;
    case 'clear':
      clearAll();
      break;
    case 'delete':
      deleteLast();
      break;
  }
}

buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    inputNumber(e.key);
    return;
  }

  if (e.key === '.') {
    inputDecimal();
    return;
  }

  if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
    handleOperator(e.key);
    return;
  }

  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculateResult();
    return;
  }

  if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
    clearAll();
    return;
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    deleteLast();
    return;
  }
});

updateDisplay();
