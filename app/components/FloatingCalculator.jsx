'use client';

import { useState, useEffect } from 'react';
import { FaCalculator, FaTimes, FaBackspace } from 'react-icons/fa';

export default function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length === 1 || display === '0') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operator) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 'Error';
          break;
        default:
          break;
      }

      setPrevValue(newValue === 'Error' ? null : newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculateSquareRoot = () => {
    const value = parseFloat(display);
    if (value >= 0) {
      setDisplay(String(Math.sqrt(value)));
    } else {
      setDisplay('Error');
    }
    setWaitingForOperand(true);
  };

  // Keyboard shortcut listener when calculator is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === '+' || e.key === '-') {
        performOperation(e.key);
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        performOperation('=');
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, prevValue, operator, waitingForOperand]);

  return (
    <>
      {/* Floating Launcher Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-orange-600 hover:bg-orange-700 text-white w-12 h-12 rounded-2xl shadow-2xl shadow-orange-600/40 border border-orange-400/30 flex items-center justify-center text-lg transition active:scale-95 cursor-pointer"
        title="Open CBT Calculator"
        aria-label="Toggle CBT Calculator"
      >
        <FaCalculator />
      </button>

      {/* Floating Calculator Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-72 sm:w-80 bg-[#161922] border border-gray-800 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-b border-gray-800 pb-2">
            <span className="flex items-center gap-1.5 text-orange-400">
              <FaCalculator /> Standard CBT Calculator
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-md transition cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Screen Display */}
          <div className="bg-[#0f1117] border border-gray-800/80 rounded-2xl p-3 text-right">
            <div className="text-[10px] text-gray-500 font-mono h-3.5">
              {operator && prevValue !== null ? `${prevValue} ${operator}` : ''}
            </div>
            <div className="text-2xl font-black font-mono tracking-wider truncate text-gray-100">
              {display}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            <button
              onClick={clearAll}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer"
            >
              C
            </button>
            <button
              onClick={calculateSquareRoot}
              className="p-2.5 rounded-xl bg-[#0f1117] text-gray-300 hover:bg-gray-800 border border-gray-800 transition cursor-pointer"
            >
              √
            </button>
            <button
              onClick={backspace}
              className="p-2.5 rounded-xl bg-[#0f1117] text-gray-300 hover:bg-gray-800 border border-gray-800 flex items-center justify-center transition cursor-pointer"
            >
              <FaBackspace />
            </button>
            <button
              onClick={() => performOperation('÷')}
              className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 transition cursor-pointer"
            >
              ÷
            </button>

            {['7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => inputDigit(n)}
                className="p-2.5 rounded-xl bg-[#0f1117] text-gray-200 hover:bg-gray-800 border border-gray-800 transition cursor-pointer"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => performOperation('×')}
              className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 transition cursor-pointer"
            >
              ×
            </button>

            {['4', '5', '6'].map((n) => (
              <button
                key={n}
                onClick={() => inputDigit(n)}
                className="p-2.5 rounded-xl bg-[#0f1117] text-gray-200 hover:bg-gray-800 border border-gray-800 transition cursor-pointer"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => performOperation('-')}
              className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 transition cursor-pointer"
            >
              -
            </button>

            {['1', '2', '3'].map((n) => (
              <button
                key={n}
                onClick={() => inputDigit(n)}
                className="p-2.5 rounded-xl bg-[#0f1117] text-gray-200 hover:bg-gray-800 border border-gray-800 transition cursor-pointer"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => performOperation('+')}
              className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 transition cursor-pointer"
            >
              +
            </button>

            <button
              onClick={() => inputDigit(0)}
              className="col-span-2 p-2.5 rounded-xl bg-[#0f1117] text-gray-200 hover:bg-gray-800 border border-gray-800 transition cursor-pointer"
            >
              0
            </button>
            <button
              onClick={inputDot}
              className="p-2.5 rounded-xl bg-[#0f1117] text-gray-200 hover:bg-gray-800 border border-gray-800 transition cursor-pointer"
            >
              .
            </button>
            <button
              onClick={() => performOperation('=')}
              className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30 transition cursor-pointer"
            >
              =
            </button>
          </div>
        </div>
      )}
    </>
  );
}