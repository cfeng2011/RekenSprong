import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import type { ChildProfile, Level } from '../types';
import { LEVEL_CONFIG } from '../types';
import { generateId, AVATARS, PROFILE_COLORS } from '../utils/helpers';

export default function ProfileSelect() {
  const navigate = useNavigate();
  const { profiles, addProfile, setActiveChild, deleteProfile } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedLevel, setSelectedLevel] = useState<Level>('wizFUN_g3');
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);

  function handleCreate() {
    if (!name.trim()) return;
    const profile: ChildProfile = {
      id: generateId(),
      name: name.trim(),
      avatar: selectedAvatar,
      level: selectedLevel,
      createdAt: Date.now(),
      color: selectedColor,
    };
    addProfile(profile);
    setShowCreate(false);
    setName('');
    setActiveChild(profile.id);
    navigate('/levels');
  }

  function handleSelect(profile: ChildProfile) {
    setActiveChild(profile.id);
    navigate('/levels');
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white text-3xl transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">Wie ben jij?</h1>
            <p className="text-white/70">Kies jouw profiel of maak een nieuw aan</p>
          </div>
        </motion.div>

        {/* Profile cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <AnimatePresence>
            {profiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <motion.button
                  onClick={() => handleSelect(profile)}
                  className={`w-full ${profile.color} rounded-3xl p-6 flex flex-col items-center gap-2 shadow-xl btn-bounce`}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <div className="text-6xl">{profile.avatar}</div>
                  <div className="text-white font-black text-xl">{profile.name}</div>
                  <div className="bg-white/30 rounded-full px-3 py-1 text-white text-sm font-bold">
                    {LEVEL_CONFIG[profile.level].label} {LEVEL_CONFIG[profile.level].group}
                  </div>
                </motion.button>
                <button
                  onClick={() => deleteProfile(profile.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Verwijder profiel"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add new profile card */}
          <motion.button
            onClick={() => setShowCreate(true)}
            className="bg-white/20 border-4 border-dashed border-white/40 rounded-3xl p-6 flex flex-col items-center gap-2 text-white hover:bg-white/30 transition-all"
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: profiles.length * 0.1 }}
          >
            <div className="text-6xl">➕</div>
            <div className="font-bold text-lg">Nieuw profiel</div>
          </motion.button>
        </div>

        {/* Create profile modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
              >
                <h2 className="text-2xl font-black text-purple-800 mb-6">
                  Nieuw profiel aanmaken ✨
                </h2>

                {/* Name */}
                <div className="mb-4">
                  <label className="block text-purple-700 font-bold mb-2">Jouw naam</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bijv. Emma"
                    className="w-full border-3 border-purple-200 rounded-2xl px-4 py-3 text-lg font-bold text-gray-800 focus:outline-none focus:border-purple-500"
                    maxLength={20}
                    autoFocus
                  />
                </div>

                {/* Avatar */}
                <div className="mb-4">
                  <label className="block text-purple-700 font-bold mb-2">Kies jouw dier</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        onClick={() => setSelectedAvatar(av)}
                        className={`text-3xl p-2 rounded-2xl transition-all ${
                          selectedAvatar === av
                            ? 'bg-purple-200 scale-110 shadow-md'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="mb-4">
                  <label className="block text-purple-700 font-bold mb-2">Kies een kleur</label>
                  <div className="flex gap-2">
                    {PROFILE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-10 h-10 rounded-full ${c} transition-all ${
                          selectedColor === c ? 'scale-125 shadow-lg ring-4 ring-purple-400' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="mb-6">
                  <label className="block text-purple-700 font-bold mb-2">Welke groep?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(LEVEL_CONFIG) as [Level, typeof LEVEL_CONFIG[Level]][]).map(
                      ([lv, cfg]) => (
                        <button
                          key={lv}
                          onClick={() => setSelectedLevel(lv)}
                          className={`p-3 rounded-2xl text-left transition-all font-bold ${
                            selectedLevel === lv
                              ? `${cfg.bgColor} ${cfg.color} shadow-md ring-2 ring-offset-1 ring-purple-400`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <div className="text-xl">{cfg.emoji}</div>
                          <div className="text-sm">{cfg.label}</div>
                          <div className="text-xs font-normal">{cfg.group}</div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Aanmaken! 🎉
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
