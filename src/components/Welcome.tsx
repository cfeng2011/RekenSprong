import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const floatingStars = ['⭐', '🌟', '✨', '💫', '⭐'];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingStars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl star"
            style={{
              left: `${10 + i * 20}%`,
              top: `${10 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            {star}
          </motion.div>
        ))}
        <motion.div
          className="absolute bottom-10 left-5 text-5xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🌈
        </motion.div>
        <motion.div
          className="absolute top-10 right-5 text-4xl"
          animate={{ rotate: [0, 20, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          🎒
        </motion.div>
      </div>

      <motion.div
        className="text-center z-10 max-w-lg w-full"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Kangaroo mascot */}
        <motion.div
          className="text-9xl mb-4 kangaroo-anim inline-block"
          whileHover={{ scale: 1.1 }}
        >
          🦘
        </motion.div>

        <motion.h1
          className="text-5xl font-black text-white mb-2 drop-shadow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          Kangoeroe
        </motion.h1>
        <motion.p
          className="text-2xl font-bold text-yellow-300 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Reken Avontuur! 🎯
        </motion.p>
        <motion.p
          className="text-white/80 text-lg mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Leer rekenen op een leuke manier!
        </motion.p>

        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={() => navigate('/profiles')}
            className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black text-2xl py-5 px-8 rounded-3xl shadow-xl btn-bounce transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Laten we beginnen!
          </motion.button>

          <motion.button
            onClick={() => navigate('/parent')}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-lg py-3 px-6 rounded-2xl border-2 border-white/40 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            👨‍👩‍👧 Ouder/Leraar dashboard
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center gap-6 text-white/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <div className="text-2xl">⭐</div>
            <div>Groep 3-4</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">🚀</div>
            <div>Groep 5-6</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">🏆</div>
            <div>Groep 7-8</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
