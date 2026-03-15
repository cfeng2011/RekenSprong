import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import type { Level, Question } from '../types';
import { TOPIC_LABELS } from '../types';
import { ALL_QUESTIONS } from '../data';
import clsx from 'clsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];
const OPTION_COLORS = [
  'from-red-400 to-rose-500',
  'from-blue-400 to-cyan-500',
  'from-yellow-400 to-amber-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
];

export default function ReinforcePractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { level, topics } = location.state as { level: Level; topics: string[] };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    // Get questions for weak topics — try same level first, then all levels
    const pool: Question[] = [];
    for (const topic of topics) {
      const levelQs = ALL_QUESTIONS[level].filter((q) => q.topic === topic);
      pool.push(...levelQs);
    }
    // Shuffle and take up to 10
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
  }, [level, topics]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Geen extra vragen beschikbaar.</div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  function handleSelect(optionIdx: number) {
    if (selected !== null) return;
    const isCorrect = optionIdx === currentQ.correct;
    setSelected(optionIdx);
    setShowFeedback(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
  }

  function handleNext() {
    if (isLast) {
      setDone(true);
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setShowFeedback(false);
    setAnimKey((k) => k + 1);
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-7xl mb-4">{pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'}</div>
          <h2 className="text-3xl font-black text-purple-800 mb-2">
            Oefening klaar!
          </h2>
          <div className="text-6xl font-black text-purple-600 mb-1">{pct}%</div>
          <p className="text-gray-600 mb-6">
            {correctCount} van {questions.length} goed
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/levels')}
              className="py-3 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all"
            >
              Terug naar levels
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            onClick={() => navigate('/levels')}
            className="text-white/80 hover:text-white text-3xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-black text-white">🎯 Extra oefening</h1>
            <p className="text-white/70 text-sm">
              Onderwerpen: {topics.map((t) => TOPIC_LABELS[t as keyof typeof TOPIC_LABELS]).join(', ')}
            </p>
          </div>
          <div className="ml-auto glass-card rounded-xl px-3 py-1 text-white font-bold">
            {currentIdx + 1}/{questions.length}
          </div>
        </motion.div>

        {/* Progress */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden mb-4">
          <motion.div
            className="h-full bg-orange-400 rounded-full"
            style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-3xl p-6 shadow-2xl mb-4"
          >
            <div className="text-orange-500 font-bold text-sm mb-3 uppercase tracking-wide">
              Extra oefening
            </div>
            <p className="text-gray-800 font-bold text-xl leading-relaxed whitespace-pre-line mb-4">
              {currentQ.question}
            </p>

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={clsx(
                    'rounded-2xl p-4 mb-2',
                    selected === currentQ.correct
                      ? 'bg-green-50 border-2 border-green-400'
                      : 'bg-red-50 border-2 border-red-400'
                  )}
                >
                  <div className="flex gap-2">
                    <span className="text-2xl">
                      {selected === currentQ.correct ? '🎉' : '🤔'}
                    </span>
                    <div>
                      <div className={clsx(
                        'font-black',
                        selected === currentQ.correct ? 'text-green-700' : 'text-red-700'
                      )}>
                        {selected === currentQ.correct ? 'Goed!' : 'Niet helemaal...'}
                      </div>
                      <div className="text-gray-700 text-sm">{currentQ.explanation}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {currentQ.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrectAnswer = i === currentQ.correct;
            const showCorrect = showFeedback && isCorrectAnswer;
            const showWrong = showFeedback && isSelected && !isCorrectAnswer;

            return (
              <motion.button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={clsx(
                  'rounded-2xl px-5 py-4 text-left font-bold text-white shadow-lg flex items-center gap-4 btn-bounce',
                  showCorrect
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : showWrong
                    ? 'bg-gradient-to-r from-red-400 to-rose-500'
                    : showFeedback
                    ? 'opacity-50 bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${OPTION_COLORS[i]} hover:brightness-110`
                )}
                whileHover={!showFeedback ? { scale: 1.02, x: 4 } : {}}
                whileTap={!showFeedback ? { scale: 0.98 } : {}}
              >
                <span className="bg-white/30 rounded-xl w-10 h-10 flex items-center justify-center font-black text-lg shrink-0">
                  {OPTION_LETTERS[i]}
                </span>
                <span className="text-lg">{option}</span>
                {showCorrect && <span className="ml-auto text-2xl">✓</span>}
                {showWrong && <span className="ml-auto text-2xl">✗</span>}
              </motion.button>
            );
          })}
        </div>

        {showFeedback && (
          <motion.button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black text-xl shadow-lg btn-bounce"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {isLast ? '🏁 Klaar!' : 'Volgende →'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
