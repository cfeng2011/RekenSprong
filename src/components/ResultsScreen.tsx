import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import type { QuizSession } from '../types';
import { LEVEL_CONFIG, TOPIC_LABELS, TOPIC_EMOJIS } from '../types';
import { scoreToStars } from '../utils/analytics';
import { formatTime } from '../utils/helpers';

const starMessages = [
  'Blijf oefenen, je kunt het! 💪',
  'Goed begin! Nog wat oefenen! 📚',
  'Heel goed gedaan! 🎉',
  'Waanzinnig! Je bent een rekenwonder! 🌟',
];

export default function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const session: QuizSession = location.state?.session;
  const isRush: boolean = location.state?.rush === true;
  const { profiles, activeChildId, computeProgress } = useAppStore();
  const activeProfile = profiles.find((p) => p.id === activeChildId);
  const progress = activeChildId ? computeProgress(activeChildId) : null;

  if (!session) {
    navigate('/');
    return null;
  }

  const cfg = LEVEL_CONFIG[session.level];
  const stars = scoreToStars(session.score, session.totalQuestions);
  const pct = Math.round((session.score / session.totalQuestions) * 100);
  const totalTime = Math.floor((session.finishedAt - session.startedAt) / 1000);

  // Group answers by topic
  const topicResults: Record<string, { correct: number; total: number }> = {};
  for (const ans of session.answers) {
    if (!topicResults[ans.topic]) topicResults[ans.topic] = { correct: 0, total: 0 };
    topicResults[ans.topic].total++;
    if (ans.correct) topicResults[ans.topic].correct++;
  }

  const weakTopics = Object.entries(topicResults)
    .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.6)
    .map(([topic]) => topic as keyof typeof TOPIC_LABELS);

  return (
    <div className="min-h-screen px-4 py-8 overflow-y-auto">
      <div className="max-w-lg mx-auto">
        {/* Celebration header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isRush && (
            <motion.div
              className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-black px-5 py-2 rounded-full mb-3 text-lg shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
            >
              <motion.span
                animate={{ rotate: [-15, 15, -15] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              >⚡</motion.span>
              Rush Test klaar!
              <motion.span
                animate={{ rotate: [15, -15, 15] }}
                transition={{ duration: 0.4, repeat: Infinity }}
              >⚡</motion.span>
            </motion.div>
          )}

          <motion.div
            className="text-8xl mb-2"
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {stars >= 3 ? '🏆' : stars >= 2 ? '🌟' : stars >= 1 ? '⭐' : '🦘'}
          </motion.div>

          <h1 className="text-3xl font-black text-white mb-1">
            {activeProfile ? `Goed gedaan, ${activeProfile.name}!` : 'Quiz klaar!'}
          </h1>
          <p className="text-white/80 text-lg">
            {isRush
              ? (pct === 100 ? '⚡ Perfecte rush! Je bent een bliksem rekenwonder!' : pct >= 66 ? '⚡ Super snel en goed!' : '⚡ Goed geprobeerd! Probeer nog een rush!')
              : starMessages[stars]}
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-2xl mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-4">
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-3">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={`text-5xl ${i < stars ? '' : 'grayscale opacity-30'}`}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, type: 'spring', stiffness: 300 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <div className="text-6xl font-black text-purple-700">
              {pct}%
            </div>
            <div className="text-gray-500 text-lg">
              {session.score} van de {session.totalQuestions} goed
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-green-600">{session.score}</div>
              <div className="text-green-600 text-xs font-bold">Goed</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-red-500">
                {session.totalQuestions - session.score}
              </div>
              <div className="text-red-500 text-xs font-bold">Fout/Overgeslagen</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-black text-blue-600">{formatTime(totalTime)}</div>
              <div className="text-blue-600 text-xs font-bold">Tijd</div>
            </div>
          </div>

          {/* Topic breakdown */}
          <div>
            <h3 className="font-black text-gray-700 mb-3">Per onderwerp:</h3>
            {Object.entries(topicResults).map(([topic, { correct, total }]) => {
              const topicPct = Math.round((correct / total) * 100);
              const color =
                topicPct >= 80
                  ? 'bg-green-400'
                  : topicPct >= 60
                  ? 'bg-yellow-400'
                  : 'bg-red-400';
              return (
                <div key={topic} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-gray-700">
                      {TOPIC_EMOJIS[topic as keyof typeof TOPIC_EMOJIS]}{' '}
                      {TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS]}
                    </span>
                    <span className="text-sm font-black text-gray-600">
                      {correct}/{total}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full ${color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${topicPct}%` }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weak topics - reinforce */}
        {weakTopics.length > 0 && (
          <motion.div
            className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-5 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-black text-orange-700 text-lg mb-2">
              🎯 Nog even oefenen?
            </h3>
            <p className="text-orange-600 text-sm mb-3">
              Je kunt nog beter worden in:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {weakTopics.map((t) => (
                <span
                  key={t}
                  className="bg-orange-200 text-orange-800 rounded-full px-3 py-1 text-sm font-bold"
                >
                  {TOPIC_EMOJIS[t]} {TOPIC_LABELS[t]}
                </span>
              ))}
            </div>
            <button
              onClick={() =>
                navigate('/reinforce', {
                  state: { level: session.level, topics: weakTopics, sessionId: session.id },
                })
              }
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black transition-all btn-bounce"
            >
              🚀 Oefenen met extra vragen!
            </button>
          </motion.div>
        )}

        {/* New badges */}
        {progress && progress.badges.length > 0 && (
          <motion.div
            className="bg-yellow-50 border-2 border-yellow-300 rounded-3xl p-4 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-black text-yellow-700 mb-2">🏅 Jouw badges!</h3>
            <div className="flex flex-wrap gap-2">
              {progress.badges.map((b) => (
                <div key={b.id} className="text-center" title={b.description}>
                  <div className="text-3xl">{b.emoji}</div>
                  <div className="text-xs font-bold text-yellow-700">{b.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {isRush ? (
            <>
              <button
                onClick={() => navigate('/quiz', { state: { level: session.level, rush: true } })}
                className="py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black text-xl shadow-lg btn-bounce"
              >
                ⚡ Nog een Rush!
              </button>
              <button
                onClick={() => navigate('/quiz', { state: { level: session.level } })}
                className="py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all"
              >
                📝 Volledige quiz doen
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/quiz', { state: { level: session.level } })}
              className="py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black text-xl shadow-lg btn-bounce"
            >
              🔄 Nog een keer!
            </button>
          )}
          <button
            onClick={() => navigate('/levels')}
            className="py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all"
          >
            🎯 Ander level kiezen
          </button>
          <button
            onClick={() => navigate('/parent')}
            className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 font-bold transition-all"
          >
            📊 Ouder dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
