import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { LEVEL_CONFIG } from '../types';
import type { Level, Question, SessionAnswer, QuizSession } from '../types';
import { getQuestionsForSession, getRushQuestions } from '../data';
import { generateId, formatTime } from '../utils/helpers';
import clsx from 'clsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];
const OPTION_COLORS = [
  'from-red-400 to-rose-500',
  'from-blue-400 to-cyan-500',
  'from-yellow-400 to-amber-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
];
const OPTION_HOVER = [
  'hover:from-red-500 hover:to-rose-600',
  'hover:from-blue-500 hover:to-cyan-600',
  'hover:from-yellow-500 hover:to-amber-600',
  'hover:from-green-500 hover:to-emerald-600',
  'hover:from-purple-500 hover:to-violet-600',
];

const RUSH_TIME = 3 * 60; // 3 minutes for the full rush test

export default function QuizScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const level: Level = location.state?.level ?? 'wizFUN_g3';
  const isRush: boolean = location.state?.rush === true;
  const cfg = LEVEL_CONFIG[level];

  const { activeChildId, addSession } = useAppStore();

  const [questions] = useState<Question[]>(() =>
    isRush ? getRushQuestions(level) : getQuestionsForSession(level, cfg.questions)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(isRush ? RUSH_TIME : cfg.timeMinutes * 60);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartTime] = useState(Date.now());
  const [animKey, setAnimKey] = useState(0);
  const [feedbackAnim, setFeedbackAnim] = useState<'correct' | 'wrong' | null>(null);
  const [timesUp, setTimesUp] = useState(false);
  // Countdown 3-2-1 for rush mode
  const [rushCountdown, setRushCountdown] = useState(isRush ? 3 : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef<SessionAnswer[]>([]);

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const progressPct = (currentIdx / questions.length) * 100;
  const totalTime = isRush ? RUSH_TIME : cfg.timeMinutes * 60;
  const timerPct = (timeLeft / totalTime) * 100;

  // Rush 3-2-1 countdown before quiz starts
  useEffect(() => {
    if (!isRush || rushCountdown === 0) return;
    const t = setTimeout(() => setRushCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [isRush, rushCountdown]);

  // Main quiz timer — only starts after rush countdown finishes
  useEffect(() => {
    if (isRush && rushCountdown > 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimesUp(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isRush, rushCountdown]);

  useEffect(() => {
    if (timesUp) finishSession();
  }, [timesUp]);

  function finishSession(pendingAnswers?: SessionAnswer[]) {
    if (!activeChildId) return;
    clearInterval(timerRef.current!);
    const finalAnswers = pendingAnswers ?? answersRef.current;
    const correctCount = finalAnswers.filter((a) => a.correct).length;
    const session: QuizSession = {
      id: generateId(),
      childId: activeChildId,
      level,
      startedAt: sessionStartTime,
      finishedAt: Date.now(),
      timeLimit: totalTime,
      answers: finalAnswers,
      score: correctCount,
      totalQuestions: questions.length,
    };
    addSession(session);
    navigate('/results', { state: { session, rush: isRush } });
  }

  function handleSelect(optionIdx: number) {
    if (selected !== null || showFeedback) return;
    const isCorrect = optionIdx === currentQ.correct;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setSelected(optionIdx);
    setFeedbackAnim(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    const answer: SessionAnswer = {
      questionId: currentQ.id,
      topic: currentQ.topic,
      selectedOption: optionIdx,
      correct: isCorrect,
      timeSpent,
    };
    const next = [...answersRef.current, answer];
    answersRef.current = next;
    setAnswers(next);
  }

  function handleNext() {
    if (isLast) { finishSession(); return; }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setShowFeedback(false);
    setFeedbackAnim(null);
    setAnimKey((k) => k + 1);
    setQuestionStartTime(Date.now());
  }

  function handleSkip() {
    const answer: SessionAnswer = {
      questionId: currentQ.id,
      topic: currentQ.topic,
      selectedOption: null,
      correct: false,
      timeSpent: Math.floor((Date.now() - questionStartTime) / 1000),
    };
    const next = [...answersRef.current, answer];
    answersRef.current = next;
    setAnswers(next);
    if (isLast) { finishSession(next); return; }
    setCurrentIdx((i) => i + 1);
    setSelected(null);
    setShowFeedback(false);
    setFeedbackAnim(null);
    setAnimKey((k) => k + 1);
    setQuestionStartTime(Date.now());
  }

  const timerColor = timerPct > 50 ? 'bg-green-400' : timerPct > 20 ? 'bg-yellow-400' : 'bg-red-400';
  const rushTimerUrgent = isRush && timerPct < 33;

  // ── Rush 3-2-1 countdown overlay ──────────────────────────────────────
  if (isRush && rushCountdown > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
      >
        {/* Electric sparks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{ left: `${10 + i * 11}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
            transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, delay: i * 0.15 }}
          >
            ⚡
          </motion.div>
        ))}
        <div className="text-center z-10">
          <div className="text-white/80 font-black text-2xl mb-6 tracking-widest uppercase">
            ⚡ Rush Test · {cfg.label} ·  {cfg.group}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={rushCountdown}
              className="text-white font-black"
              style={{ fontSize: '10rem', lineHeight: 1, textShadow: '0 0 40px rgba(255,255,255,0.6)' }}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {rushCountdown}
            </motion.div>
          </AnimatePresence>
          <motion.div
            className="text-white/70 text-2xl font-bold mt-6"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Maak je klaar!
          </motion.div>
          <div className="mt-8 flex justify-center gap-6">
            {questions.map((_, i) => (
              <div key={i} className="text-center text-white/60">
                <div className="text-2xl">
                  {i < 2 ? '⭐' : '🔥'}
                </div>
                <div className="text-xs font-bold mt-1">
                  {i < 2 ? 'Makkelijk' : 'Uitdaging'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Rush "GO!" flash ───────────────────────────────────────────────────
  const rushBg = isRush
    ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
    : undefined;

  return (
    <div
      className="min-h-screen flex flex-col px-4 py-4"
      style={rushBg ? { background: rushBg } : undefined}
    >
      {/* Rush mode electric header strip */}
      {isRush && (
        <motion.div
          className="max-w-2xl mx-auto w-full mb-2 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.span
            className="text-2xl"
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >⚡</motion.span>
          <span className="text-white font-black text-xl tracking-widest uppercase">
            Rush Test
          </span>
          <motion.span
            className="text-2xl"
            animate={{ rotate: [10, -10, 10] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >⚡</motion.span>
        </motion.div>
      )}

      {/* Top bar */}
      <motion.div
        className="max-w-2xl mx-auto w-full mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="glass-card rounded-2xl px-4 py-2 text-white font-bold">
            {currentIdx + 1} / {questions.length}
          </div>
          <div className="text-white text-xl font-black">
            {isRush ? '' : `${cfg.emoji} ${cfg.label}`}
          </div>
          {/* Timer — big and pulse in rush mode when urgent */}
          <motion.div
            className={clsx(
              'glass-card rounded-2xl px-4 py-2 font-black',
              isRush ? 'text-xl' : 'text-lg',
              (timerPct < 20 || rushTimerUrgent) ? 'text-red-200' : 'text-white'
            )}
            animate={rushTimerUrgent ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {isRush ? '⚡' : '⏱'} {formatTime(timeLeft)}
          </motion.div>
        </div>

        {/* Question progress dots (rush) or bar (normal) */}
        {isRush ? (
          <div className="flex justify-center gap-4 mt-1">
            {questions.map((q, i) => (
              <div
                key={i}
                className={clsx(
                  'w-4 h-4 rounded-full transition-all',
                  i < currentIdx
                    ? answersRef.current[i]?.correct
                      ? 'bg-green-400 scale-110'
                      : 'bg-red-400 scale-110'
                    : i === currentIdx
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/30'
                )}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-yellow-400 rounded-full progress-bar"
                style={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="bg-white/20 rounded-full h-2 mt-1 overflow-hidden">
              <motion.div
                className={`h-full ${timerColor} rounded-full`}
                style={{ width: `${timerPct}%` }}
                transition={{ duration: 0.9 }}
              />
            </div>
          </>
        )}
      </motion.div>

      {/* Question card */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={animKey}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={clsx(
              'rounded-3xl p-6 shadow-2xl mb-4',
              isRush
                ? 'bg-white border-4 border-yellow-400'
                : 'bg-white'
            )}
          >
            {/* Topic + difficulty row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={clsx(
                'font-bold text-sm px-3 py-1 rounded-full',
                isRush ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
              )}>
                {currentQ.topic === 'optellen' && '➕ Optellen'}
                {currentQ.topic === 'aftrekken' && '➖ Aftrekken'}
                {currentQ.topic === 'vermenigvuldigen' && '✖️ Vermenigvuldigen'}
                {currentQ.topic === 'delen' && '➗ Delen'}
                {currentQ.topic === 'breuken' && '½ Breuken'}
                {currentQ.topic === 'procenten' && '% Procenten'}
                {currentQ.topic === 'meetkunde' && '📐 Meetkunde'}
                {currentQ.topic === 'meten' && '📏 Meten'}
                {currentQ.topic === 'logica' && '🧩 Logica'}
                {currentQ.topic === 'reeksen' && '🔢 Reeksen'}
                {currentQ.topic === 'woordsom' && '📖 Woordsom'}
                {currentQ.topic === 'getallenleer' && '🔢 Getallenleer'}
              </span>
              {isRush && (
                <span className={clsx(
                  'text-xs font-black px-2 py-1 rounded-full',
                  currentQ.difficulty === 3
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                )}>
                  {currentQ.difficulty === 3 ? '🔥 Uitdaging' : '⭐ Makkelijk'}
                </span>
              )}
              <span className="ml-auto">
                {Array.from({ length: currentQ.difficulty }, (_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </span>
            </div>

            <p className="text-gray-800 font-bold text-xl leading-relaxed whitespace-pre-line">
              {currentQ.question}
            </p>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={clsx(
                    'mt-4 rounded-2xl p-4',
                    feedbackAnim === 'correct'
                      ? 'bg-green-50 border-2 border-green-400'
                      : 'bg-red-50 border-2 border-red-400'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {feedbackAnim === 'correct'
                        ? (isRush ? '⚡' : '🎉')
                        : '🤔'}
                    </div>
                    <div>
                      <div className={clsx(
                        'font-black text-lg',
                        feedbackAnim === 'correct' ? 'text-green-700' : 'text-red-700'
                      )}>
                        {feedbackAnim === 'correct'
                          ? (isRush ? 'Razendsnel goed!' : 'Super goed!')
                          : 'Niet helemaal...'}
                      </div>
                      <div className="text-gray-700 text-sm mt-1">
                        {currentQ.explanation}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Answer options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`options-${animKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-3 mb-4"
          >
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
                    'relative rounded-2xl px-5 py-4 text-left font-bold text-white shadow-lg transition-all btn-bounce',
                    'flex items-center gap-4',
                    showCorrect
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 ring-4 ring-green-300'
                      : showWrong
                      ? 'bg-gradient-to-r from-red-400 to-rose-500 ring-4 ring-red-300'
                      : showFeedback
                      ? 'opacity-50 bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      : `bg-gradient-to-r ${OPTION_COLORS[i]} ${OPTION_HOVER[i]}`
                  )}
                  whileHover={!showFeedback ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="bg-white/30 rounded-xl w-10 h-10 flex items-center justify-center font-black text-lg shrink-0">
                    {OPTION_LETTERS[i]}
                  </span>
                  <span className="text-lg">{option}</span>
                  {showCorrect && (
                    <motion.span
                      className="ml-auto text-2xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {showWrong && <span className="ml-auto text-2xl">✗</span>}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <div className="max-w-2xl mx-auto w-full flex gap-3">
          {/* No skip in rush mode — you've gotta commit! */}
          {!showFeedback && !isRush && (
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-2xl bg-white/20 text-white font-bold hover:bg-white/30 transition-all"
            >
              Sla over →
            </button>
          )}
          {showFeedback && (
            <motion.button
              onClick={handleNext}
              className={clsx(
                'flex-1 py-4 rounded-2xl font-black text-xl shadow-lg btn-bounce',
                isRush
                  ? 'bg-white text-orange-600 hover:bg-yellow-50'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900'
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {isLast ? '🏁 Klaar!' : isRush ? '⚡ Volgende!' : 'Volgende vraag →'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
