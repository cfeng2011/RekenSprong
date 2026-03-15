import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts';
import { useAppStore, PARENT_PIN } from '../store/appStore';
import type { ChildProfile } from '../types';
import { LEVEL_CONFIG, TOPIC_LABELS, TOPIC_EMOJIS } from '../types';
import { computeChildProgress, getRecommendations } from '../utils/analytics';
import { formatDate } from '../utils/helpers';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { profiles, sessions, parentUnlocked, setParentUnlocked } = useAppStore();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    profiles[0]?.id ?? null
  );

  function handlePinSubmit() {
    if (pin === PARENT_PIN) {
      setParentUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  }

  if (!parentUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Ouder Dashboard</h2>
          <p className="text-gray-500 mb-6 text-sm">Voer de PIN-code in (standaard: 1234)</p>

          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-2xl border-4 flex items-center justify-center text-2xl font-black
                  ${pin.length > i ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}
                  ${pinError ? 'border-red-400 bg-red-50' : ''}`}
              >
                {pin.length > i ? '●' : ''}
              </div>
            ))}
          </div>

          {pinError && (
            <p className="text-red-500 text-sm font-bold mb-3">Onjuiste PIN, probeer opnieuw.</p>
          )}

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <button
                key={n}
                onClick={() => {
                  if (pin.length < 4) setPin((p) => p + n);
                }}
                className="py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xl transition-all"
              >
                {n}
              </button>
            ))}
            <div />
            <button
              onClick={() => {
                if (pin.length < 4) setPin((p) => p + '0');
              }}
              className="py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xl transition-all"
            >
              0
            </button>
            <button
              onClick={() => setPin((p) => p.slice(0, -1))}
              className="py-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-500 font-black text-xl transition-all"
            >
              ⌫
            </button>
          </div>

          <button
            onClick={handlePinSubmit}
            disabled={pin.length !== 4}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-lg transition-all disabled:opacity-40"
          >
            Openen 🔓
          </button>

          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full py-2 text-gray-500 hover:text-gray-700 font-bold text-sm"
          >
            ← Terug naar start
          </button>
        </motion.div>
      </div>
    );
  }

  const selectedProfile = profiles.find((p) => p.id === selectedChildId);
  const childSessions = sessions.filter((s) => s.childId === selectedChildId);
  const progress = selectedChildId
    ? computeChildProgress(selectedChildId, childSessions)
    : null;
  const recommendations = progress ? getRecommendations(progress) : [];

  // Chart data - topic radar
  const radarData = progress?.topicStats.map((t) => ({
    topic: TOPIC_LABELS[t.topic],
    score: t.percentage,
    fullMark: 100,
  })) ?? [];

  // Bar chart data — score per session
  const sessionBarData = childSessions.slice(-10).map((s, i) => ({
    name: `Quiz ${i + 1}`,
    score: Math.round((s.score / s.totalQuestions) * 100),
    date: formatDate(s.finishedAt),
  }));

  // Line chart — score over time (rolling)
  const lineData = childSessions.map((s, i) => ({
    name: `#${i + 1}`,
    score: Math.round((s.score / s.totalQuestions) * 100),
    level: LEVEL_CONFIG[s.level].label,
  }));

  return (
    <div className="min-h-screen px-4 py-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white text-3xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-black text-white">📊 Ouder Dashboard</h1>
              <p className="text-white/70 text-sm">Voortgang en inzichten</p>
            </div>
          </div>
          <button
            onClick={() => setParentUnlocked(false)}
            className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-2 text-sm font-bold transition-all"
          >
            🔒 Vergrendel
          </button>
        </motion.div>

        {/* Profile selector */}
        {profiles.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center">
            <div className="text-4xl mb-3">🦘</div>
            <p className="text-gray-600 font-bold">Nog geen profielen aangemaakt.</p>
            <button
              onClick={() => navigate('/profiles')}
              className="mt-4 py-2 px-6 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700"
            >
              Profiel aanmaken
            </button>
          </div>
        ) : (
          <>
            {/* Child tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedChildId(p.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold whitespace-nowrap transition-all ${
                    selectedChildId === p.id
                      ? 'bg-white text-purple-700 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {selectedProfile && progress && (
              <motion.div
                key={selectedChildId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Overview cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Quizzen', value: progress.totalSessionsCompleted, emoji: '📝' },
                    { label: 'Gemiddeld', value: `${progress.averageScore}%`, emoji: '📈' },
                    { label: 'Streak', value: `${progress.streak} 🔥`, emoji: '' },
                    { label: 'Badges', value: progress.badges.length, emoji: '🏅' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-4 text-center shadow-md">
                      <div className="text-2xl font-black text-purple-700">{stat.value}</div>
                      <div className="text-gray-500 text-xs font-bold mt-1">{stat.emoji} {stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Level info */}
                <div className="bg-white rounded-3xl p-5 mb-4 shadow-md">
                  <h3 className="font-black text-gray-800 mb-3 text-lg">Profiel</h3>
                  <div className="flex items-center gap-4">
                    <div className={`${selectedProfile.color} w-16 h-16 rounded-2xl flex items-center justify-center text-4xl`}>
                      {selectedProfile.avatar}
                    </div>
                    <div>
                      <div className="font-black text-gray-800 text-xl">{selectedProfile.name}</div>
                      <div className="text-gray-500">
                        Niveau: {LEVEL_CONFIG[selectedProfile.level].label} — {LEVEL_CONFIG[selectedProfile.level].group}
                      </div>
                      <div className="text-gray-500 text-sm">
                        Aangemaakt op {formatDate(selectedProfile.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 mb-4">
                    <h3 className="font-black text-blue-800 mb-3 text-lg flex items-center gap-2">
                      💡 Aanbevelingen voor {selectedProfile.name}
                    </h3>
                    <ul className="space-y-2">
                      {recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-blue-700">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="font-bold text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Topic breakdown */}
                {progress.topicStats.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 mb-4 shadow-md">
                    <h3 className="font-black text-gray-800 mb-4 text-lg">Prestaties per onderwerp</h3>
                    <div className="space-y-3">
                      {progress.topicStats.map((t) => (
                        <div key={t.topic}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-700 text-sm">
                              {TOPIC_EMOJIS[t.topic]} {TOPIC_LABELS[t.topic]}
                            </span>
                            <span className="text-sm font-black text-gray-600">
                              {t.correct}/{t.total} ({t.percentage}%)
                            </span>
                          </div>
                          <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                t.percentage >= 80
                                  ? 'bg-green-400'
                                  : t.percentage >= 60
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${t.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Radar chart */}
                    {radarData.length >= 3 && (
                      <div className="mt-6">
                        <h4 className="font-bold text-gray-600 mb-2 text-sm">Overzichtsdiagram</h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10 }} />
                            <Radar
                              name="Score"
                              dataKey="score"
                              stroke="#7c3aed"
                              fill="#7c3aed"
                              fillOpacity={0.3}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* Strong / Weak topics summary */}
                {(progress.strongTopics.length > 0 || progress.weakTopics.length > 0) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {progress.strongTopics.length > 0 && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                        <h4 className="font-black text-green-700 mb-2">💪 Sterk in</h4>
                        <div className="flex flex-wrap gap-1">
                          {progress.strongTopics.map((t) => (
                            <span key={t} className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                              {TOPIC_EMOJIS[t]} {TOPIC_LABELS[t]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {progress.weakTopics.length > 0 && (
                      <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
                        <h4 className="font-black text-orange-700 mb-2">📚 Nog oefenen</h4>
                        <div className="flex flex-wrap gap-1">
                          {progress.weakTopics.map((t) => (
                            <span key={t} className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                              {TOPIC_EMOJIS[t]} {TOPIC_LABELS[t]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Score over time chart */}
                {lineData.length > 1 && (
                  <div className="bg-white rounded-3xl p-5 mb-4 shadow-md">
                    <h3 className="font-black text-gray-800 mb-4 text-lg">Voortgang in de tijd</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, 'Score']}
                          contentStyle={{ borderRadius: 12, fontSize: 12 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#7c3aed"
                          strokeWidth={3}
                          dot={{ fill: '#7c3aed', r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Session bar chart */}
                {sessionBarData.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 mb-4 shadow-md">
                    <h3 className="font-black text-gray-800 mb-4 text-lg">Recente quizscores</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={sessionBarData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, 'Score']}
                          contentStyle={{ borderRadius: 12, fontSize: 12 }}
                        />
                        <Bar dataKey="score" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Session history */}
                {childSessions.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 mb-4 shadow-md">
                    <h3 className="font-black text-gray-800 mb-3 text-lg">Quizgeschiedenis</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {[...childSessions].reverse().map((s, i) => {
                        const pct = Math.round((s.score / s.totalQuestions) * 100);
                        return (
                          <div
                            key={s.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div>
                              <div className="font-bold text-gray-800 text-sm">
                                {LEVEL_CONFIG[s.level].emoji} {LEVEL_CONFIG[s.level].label} — {LEVEL_CONFIG[s.level].group}
                              </div>
                              <div className="text-gray-400 text-xs">{formatDate(s.finishedAt)}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-purple-700">{pct}%</div>
                              <div className="text-gray-400 text-xs">
                                {s.score}/{s.totalQuestions} goed
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Badges */}
                {progress.badges.length > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-5 mb-4">
                    <h3 className="font-black text-yellow-800 mb-3 text-lg">🏅 Verdiende badges</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {progress.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="bg-yellow-100 rounded-2xl p-3 text-center"
                        >
                          <div className="text-3xl mb-1">{badge.emoji}</div>
                          <div className="font-black text-yellow-800 text-xs">{badge.name}</div>
                          <div className="text-yellow-600 text-xs mt-1">{badge.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {childSessions.length === 0 && (
                  <div className="bg-white rounded-3xl p-8 text-center shadow-md">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-gray-600 font-bold">
                      {selectedProfile.name} heeft nog geen quizzen gedaan.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
