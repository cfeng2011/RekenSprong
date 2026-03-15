import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { LEVEL_CONFIG } from '../types';
import type { Level } from '../types';

const levelGradients: Record<Level, string> = {
  wizFUN_g3: 'from-green-400 to-emerald-500',
  wizFUN_g4: 'from-blue-400 to-cyan-500',
  wizKID: 'from-purple-500 to-violet-600',
  wizSMART: 'from-orange-400 to-red-500',
};

export default function LevelSelect() {
  const navigate = useNavigate();
  const { profiles, activeChildId, computeProgress } = useAppStore();
  const activeProfile = profiles.find((p) => p.id === activeChildId);
  const progress = activeChildId ? computeProgress(activeChildId) : null;

  if (!activeProfile) {
    navigate('/profiles');
    return null;
  }

  function startFull(level: Level) {
    navigate('/quiz', { state: { level, rush: false } });
  }

  function startRush(level: Level) {
    navigate('/quiz', { state: { level, rush: true } });
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => navigate('/profiles')}
            className="text-white/80 hover:text-white text-3xl transition-colors"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`${activeProfile.color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg`}
            >
              {activeProfile.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                Hoi, {activeProfile.name}! 👋
              </h1>
              {progress && progress.totalSessionsCompleted > 0 && (
                <p className="text-yellow-300 font-bold">
                  🔥{' '}
                  {progress.streak > 0
                    ? `${progress.streak} dag streak!`
                    : `${progress.totalSessionsCompleted} quiz${
                        progress.totalSessionsCompleted > 1 ? 'zen' : ''
                      } gedaan`}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Level list */}
        <motion.p
          className="text-white/80 font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Kies een level — of doe een snelle ⚡ Rush Test!
        </motion.p>

        <div className="flex flex-col gap-5">
          {(Object.entries(LEVEL_CONFIG) as [Level, typeof LEVEL_CONFIG[Level]][]).map(
            ([lv, cfg], i) => {
              const isRecommended = lv === activeProfile.level;
              const sessionsForLevel =
                progress?.sessions.filter((s) => s.level === lv) ?? [];
              const lastScore =
                sessionsForLevel.length > 0
                  ? sessionsForLevel[sessionsForLevel.length - 1]
                  : null;

              return (
                <motion.div
                  key={lv}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  {/* ── Full quiz card ── */}
                  <motion.button
                    onClick={() => startFull(lv)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ display: 'block', width: '100%', textAlign: 'left' }}
                    className={`relative bg-gradient-to-r ${levelGradients[lv]} rounded-3xl p-5 shadow-xl overflow-hidden`}
                  >
                    {isRecommended && (
                      <div className="absolute top-3 right-3 bg-yellow-300 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                        ⭐ Jouw niveau
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{cfg.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-black text-xl">{cfg.label}</div>
                        <div className="text-white/90 font-bold text-sm">{cfg.group}</div>
                        <div className="text-white/70 text-sm">
                          {cfg.questions} vragen · {cfg.timeMinutes} min
                        </div>
                        <div className="text-white/70 text-sm mt-0.5">{cfg.description}</div>
                      </div>
                    </div>

                    {lastScore && (
                      <div className="mt-3 bg-white/20 rounded-2xl px-4 py-2 flex items-center gap-2 flex-wrap">
                        <span className="text-white/80 text-sm">Laatste score:</span>
                        <span className="text-white font-black">
                          {lastScore.score}/{lastScore.totalQuestions}
                        </span>
                        <span className="text-white/80 text-sm">
                          ({Math.round((lastScore.score / lastScore.totalQuestions) * 100)}%)
                        </span>
                      </div>
                    )}

                    {/* decorative circles */}
                    <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
                  </motion.button>

                  {/* ── Rush button — completely separate, below the card ── */}
                  <motion.button
                    onClick={() => startRush(lv)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    style={{ display: 'block', width: '100%', marginTop: '0.5rem' }}
                    className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black rounded-2xl py-3 px-5 shadow-md"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.span
                        style={{ fontSize: '1.3rem', display: 'inline-block' }}
                        animate={{ rotate: [-15, 15, -15] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        ⚡
                      </motion.span>
                      <span className="text-base">
                        Rush Test · 3 vragen · 3 minuten
                      </span>
                      <motion.span
                        style={{ fontSize: '1.3rem', display: 'inline-block' }}
                        animate={{ rotate: [15, -15, 15] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        ⚡
                      </motion.span>
                    </div>
                  </motion.button>
                </motion.div>
              );
            }
          )}
        </div>

        {/* Badges */}
        {progress && progress.badges.length > 0 && (
          <motion.div
            className="mt-8 bg-white/15 rounded-3xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-white font-black text-lg mb-3">Jouw badges 🏅</h3>
            <div className="flex flex-wrap gap-3">
              {progress.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white/20 rounded-2xl px-3 py-2 text-center"
                  title={badge.description}
                >
                  <div className="text-2xl">{badge.emoji}</div>
                  <div className="text-white text-xs font-bold">{badge.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
