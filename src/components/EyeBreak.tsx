import { useEffect, useRef, useState } from 'react';

const WORK_MS = 20 * 60 * 1000; // 20 minuten actief gebruik
const REST_S = 20; // 20 seconden rust (20-20-20 regel)
const STORAGE_KEY = 'kangoeroe-oogpauze-stickers';

type Phase = 'working' | 'resting' | 'done';

export default function EyeBreak() {
  const [phase, setPhase] = useState<Phase>('working');
  const [countdown, setCountdown] = useState(REST_S);
  const [stickers, setStickers] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const activeMs = useRef(0);

  // Tel alleen actieve tijd terwijl het tabblad zichtbaar is
  useEffect(() => {
    if (phase !== 'working') return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeMs.current += 1000;
        if (activeMs.current >= WORK_MS) {
          setCountdown(REST_S);
          setPhase('resting');
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Rust-aftelling — niet weg te klikken tot de teller op nul staat
  useEffect(() => {
    if (phase !== 'resting') return undefined;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setPhase('done');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const finish = () => {
    const next = stickers + 1;
    setStickers(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // opslag niet beschikbaar — sticker geldt alleen deze sessie
    }
    activeMs.current = 0;
    setPhase('working');
  };

  if (phase === 'working') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Oogpauze"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center p-6"
      style={{ background: 'linear-gradient(135deg, #7dd3fc, #a5b4fc, #f9a8d4)' }}
    >
      <div className="text-7xl mb-4 animate-bounce" aria-hidden="true">🦘</div>
      <h2 className="text-4xl font-black text-white drop-shadow mb-3">Oogpauze!</h2>
      <p className="text-xl font-bold text-white/95 max-w-md mb-8">
        Kijk 20 tellen uit het raam, naar iets vér weg. Je ogen worden er blij van!
      </p>
      {phase === 'resting' ? (
        <div className="text-8xl font-black text-white drop-shadow-lg tabular-nums" role="timer">
          {countdown}
        </div>
      ) : (
        <button
          onClick={finish}
          className="bg-white text-purple-600 text-2xl font-black px-10 py-5 rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-transform"
        >
          Klaar! 🎉
        </button>
      )}
      <p className="mt-8 text-lg font-black text-white/95">⭐ Pauze-stickers: {stickers}</p>
    </div>
  );
}
