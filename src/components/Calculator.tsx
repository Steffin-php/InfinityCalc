import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  History, 
  Moon, 
  Sun, 
  Delete, 
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import * as math from 'mathjs';
import { CalcMode, HistoryItem } from '../types';

interface CalculatorProps {
  onAddHistory: (item: HistoryItem) => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
}

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<CalcMode>('standard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Real-time evaluation
  useEffect(() => {
    if (!expression.trim()) {
      setResult(null);
      return;
    }

    try {
      // Basic sanitization and check if expression is "complete enough" to evaluate
      // Don't show error if it ends with an operator.
      const lastChar = expression.trim().slice(-1);
      const isOperator = ['+', '-', '*', '/', '(', '^', '.'].includes(lastChar);
      
      if (isOperator) {
        // Leave previous result or null
        return;
      }

      const evalResult = math.evaluate(expression);
      if (typeof evalResult === 'number' || typeof evalResult === 'object') {
        setResult(evalResult.toString());
      }
    } catch (e) {
      // Fail silently for real-time preview
    }
  }, [expression]);

  const handleAction = useCallback((value: string) => {
    if (value === '=') {
      if (expression && result) {
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          expression: expression,
          result: result,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev]);
        setExpression(result);
        setResult(null);
      }
      return;
    }

    if (value === 'AC') {
      setExpression('');
      setResult(null);
      return;
    }

    if (value === 'DEL') {
      setExpression(prev => prev.slice(0, -1));
      return;
    }

    // Handle special functions
    if (['sin', 'cos', 'tan', 'log', 'sqrt'].includes(value)) {
      setExpression(prev => prev + value + '(');
      return;
    }

    setExpression(prev => prev + value);
  }, [expression, result]);

  const handleHistorySelect = (item: HistoryItem) => {
    setExpression(item.expression);
    setIsHistoryOpen(false);
  };

  const toggleMode = () => setMode(prev => prev === 'standard' ? 'scientific' : 'standard');
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const containerVariants = {
    standard: { maxWidth: '896px' }, // max-w-4xl
    scientific: { maxWidth: '1024px' }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-1000 ${isDarkMode ? 'bg-blue-900/20 opacity-60' : 'bg-blue-200/50 opacity-40'}`} />
        <div className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-1000 ${isDarkMode ? 'bg-emerald-900/20 opacity-60' : 'bg-emerald-200/50 opacity-40'}`} />
      </div>

      <motion.div 
        layout
        initial="standard"
        animate={mode}
        variants={containerVariants}
        className={`relative z-10 flex w-full h-[640px] rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl backdrop-blur-2xl
          ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/70 border-black/5'}
        `}
      >
        {/* Left Sidebar: History */}
        <div className={`w-72 border-r transition-colors duration-500 flex flex-col hidden lg:flex
          ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-black/5 bg-slate-100/40'}
        `}>
          <div className="p-6 flex items-center gap-2 border-b border-white/5">
            <History className="w-4 h-4 text-white/40" />
            <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">History</span>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-10 gap-2">
                <RotateCcw size={24} />
                <p className="text-[10px] uppercase tracking-wider">No Data</p>
              </div>
            ) : (
              history.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleHistorySelect(item)}
                  className={`w-full p-3 rounded-xl border text-right transition-all group backdrop-blur-sm
                    ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}
                  `}
                >
                  <p className="text-[10px] font-mono text-white/40 mb-1 truncate">{item.expression}</p>
                  <p className="text-sm font-mono truncate">{item.result}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
              </div>
              <h1 className={`text-sm font-bold tracking-tight uppercase ${isDarkMode ? 'text-white/90' : 'text-slate-900/90'}`}>
                InfinityCalc
              </h1>
            </div>

            <div className={`flex rounded-full p-1 border transition-colors
              ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}
            `}>
              <button 
                onClick={() => setMode('standard')}
                className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all
                  ${mode === 'standard' 
                    ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black') 
                    : 'text-white/40 hover:text-white/60'}
                `}
              >
                STANDARD
              </button>
              <button 
                onClick={() => setMode('scientific')}
                className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all
                  ${mode === 'scientific' 
                    ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black') 
                    : 'text-white/40 hover:text-white/60'}
                `}
              >
                SCIENTIFIC
              </button>
            </div>

            <div className="flex items-center gap-2">
               <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                {isDarkMode ? <Sun size={14} className="text-white/40" /> : <Moon size={14} className="text-black/40" />}
              </button>
              <button onClick={() => setIsHistoryOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors">
                <History size={14} className="text-white/40" />
              </button>
            </div>
          </div>

          {/* Display Area */}
          <div className="flex-1 flex flex-col justify-end px-10 py-8 text-right bg-gradient-to-b from-transparent to-white/[0.02]">
            <motion.div 
              layout
              className={`text-2xl font-mono tracking-tight mb-2 truncate
                ${isDarkMode ? 'text-white/40' : 'text-slate-900/40'}
              `}
            >
              {expression || '0'}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div 
                key={result || 'placeholder'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-7xl font-mono font-light tracking-tighter truncate
                  ${isDarkMode ? 'text-white' : 'text-slate-900'}
                `}
              >
                {result || expression.split(/[-+*/]/).pop() || '0'}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className={`p-10 bg-black/20 grid gap-4 ${mode === 'scientific' ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <CalcButton label="AC" onClick={() => handleAction('AC')} type="action" isDarkMode={isDarkMode} />
            <CalcButton label="(" onClick={() => handleAction('(')} isDarkMode={isDarkMode} />
            <CalcButton label=")" onClick={() => handleAction(')')} isDarkMode={isDarkMode} />
            {mode === 'scientific' && <CalcButton label="DEL" onClick={() => handleAction('DEL')} type="operator" isDarkMode={isDarkMode} />}
            <CalcButton label="÷" onClick={() => handleAction('/')} type="operator" isDarkMode={isDarkMode} />
            
            {mode === 'scientific' && <CalcButton label="sin" onClick={() => handleAction('sin')} type="scientific" isDarkMode={isDarkMode} />}
            <CalcButton label="7" onClick={() => handleAction('7')} isDarkMode={isDarkMode} />
            <CalcButton label="8" onClick={() => handleAction('8')} isDarkMode={isDarkMode} />
            <CalcButton label="9" onClick={() => handleAction('9')} isDarkMode={isDarkMode} />
            <CalcButton label="×" onClick={() => handleAction('*')} type="operator" isDarkMode={isDarkMode} />

            {mode === 'scientific' && <CalcButton label="cos" onClick={() => handleAction('cos')} type="scientific" isDarkMode={isDarkMode} />}
            <CalcButton label="4" onClick={() => handleAction('4')} isDarkMode={isDarkMode} />
            <CalcButton label="5" onClick={() => handleAction('5')} isDarkMode={isDarkMode} />
            <CalcButton label="6" onClick={() => handleAction('6')} isDarkMode={isDarkMode} />
            <CalcButton label="−" onClick={() => handleAction('-')} type="operator" isDarkMode={isDarkMode} />

            {mode === 'scientific' && <CalcButton label="tan" onClick={() => handleAction('tan')} type="scientific" isDarkMode={isDarkMode} />}
            <CalcButton label="1" onClick={() => handleAction('1')} isDarkMode={isDarkMode} />
            <CalcButton label="2" onClick={() => handleAction('2')} isDarkMode={isDarkMode} />
            <CalcButton label="3" onClick={() => handleAction('3')} isDarkMode={isDarkMode} />
            <CalcButton label="+" onClick={() => handleAction('+')} type="operator" isDarkMode={isDarkMode} />

            {mode === 'scientific' && <CalcButton label="log" onClick={() => handleAction('log')} type="scientific" isDarkMode={isDarkMode} />}
            <CalcButton label="0" onClick={() => handleAction('0')} isDarkMode={isDarkMode} />
            <CalcButton label="." onClick={() => handleAction('.')} isDarkMode={isDarkMode} />
            
            {mode === 'scientific' ? (
              <>
                <CalcButton label="^" onClick={() => handleAction('^')} type="scientific" isDarkMode={isDarkMode} />
                <CalcButton label="sqrt" onClick={() => handleAction('sqrt')} type="scientific" isDarkMode={isDarkMode} />
                <div className="col-span-5 mt-2">
                  <CalcButton label="=" onClick={() => handleAction('=')} type="equal" isDarkMode={isDarkMode} />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <CalcButton label="=" onClick={() => handleAction('=')} type="equal" isDarkMode={isDarkMode} />
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar Overlay */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute inset-0 z-20 flex flex-col p-8 backdrop-blur-3xl shadow-xl
                ${isDarkMode ? 'bg-black/95 text-white' : 'bg-white/95 text-slate-900'}
              `}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">History</h3>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4">
                    <RotateCcw size={48} />
                    <p>No calculations yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => handleHistorySelect(item)}
                      className={`w-full p-4 rounded-2xl text-right transition-all group
                        ${isDarkMode ? 'hover:bg-white/5 bg-white/2' : 'hover:bg-black/5 bg-black/2'}
                      `}
                    >
                      <div className="text-xs opacity-40 mb-1 group-hover:opacity-60 transition-opacity">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="font-mono text-sm opacity-60 truncate mb-1">{item.expression}</div>
                      <div className="font-mono text-lg font-bold group-hover:text-blue-400 transition-colors">={item.result}</div>
                    </button>
                  ))
                )}
              </div>
              <button 
                onClick={() => setHistory([])}
                className={`mt-6 w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider
                  ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}
                `}
              >
                Clear History
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Decorative Detail */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-white/20">
        <span>Powered by Quantum Core</span>
        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
        <span>v2.4.0-Stable</span>
      </div>
    </div>
  );
}

interface CalcButtonProps {
  label: string;
  onClick: () => void;
  type?: 'number' | 'operator' | 'action' | 'equal' | 'scientific';
  isDarkMode: boolean;
}

function CalcButton({ label, onClick, type = 'number', isDarkMode }: CalcButtonProps) {
  const getStyles = () => {
    switch (type) {
      case 'action':
        return isDarkMode 
          ? 'bg-rose-500/20 text-rose-400 border-rose-500/20 hover:bg-rose-500/30' 
          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100';
      case 'operator':
        return isDarkMode 
          ? 'bg-blue-600 text-white border-blue-500/30 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
          : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700';
      case 'equal':
        return isDarkMode 
          ? 'col-span-1 bg-emerald-500 text-black border-emerald-400/30 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
          : 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.3)]';
      case 'scientific':
        return isDarkMode 
          ? 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white/90' 
          : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100';
      default:
        return isDarkMode 
          ? 'bg-white/5 text-white/90 border-white/10 hover:bg-white/10 hover:text-white' 
          : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-16 flex items-center justify-center rounded-2xl border text-xl font-mono transition-all group overflow-hidden relative
        ${getStyles()}
      `}
    >
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </motion.button>
  );
}
