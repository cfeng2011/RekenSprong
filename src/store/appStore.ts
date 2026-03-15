import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ChildProfile,
  QuizSession,
  Level,
  Badge,
} from '../types';
import { computeChildProgress } from '../utils/analytics';

interface AppState {
  profiles: ChildProfile[];
  sessions: QuizSession[];
  activeChildId: string | null;
  parentUnlocked: boolean;

  // Profile actions
  addProfile: (profile: ChildProfile) => void;
  updateProfile: (id: string, updates: Partial<ChildProfile>) => void;
  deleteProfile: (id: string) => void;
  setActiveChild: (id: string | null) => void;

  // Session actions
  addSession: (session: QuizSession) => void;

  // Parent auth
  setParentUnlocked: (unlocked: boolean) => void;

  // Computed
  getSessionsForChild: (childId: string) => QuizSession[];
  getChildProgress: ReturnType<typeof computeChildProgress> | null;
  computeProgress: (childId: string) => ReturnType<typeof computeChildProgress>;
}

const PARENT_PIN = '1234'; // Default PIN, easily changeable

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      sessions: [],
      activeChildId: null,
      parentUnlocked: false,

      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          sessions: state.sessions.filter((s) => s.childId !== id),
          activeChildId: state.activeChildId === id ? null : state.activeChildId,
        })),

      setActiveChild: (id) => set({ activeChildId: id }),

      addSession: (session) => {
        set((state) => ({ sessions: [...state.sessions, session] }));
        // Award badges
        const state = get();
        const childSessions = state.sessions.filter(
          (s) => s.childId === session.childId
        );
        const newBadges: Badge[] = [];
        const now = Date.now();

        if (childSessions.length === 1) {
          newBadges.push({
            id: 'first-quiz',
            name: 'Eerste quiz!',
            emoji: '🎉',
            description: 'Je eerste quiz afgemaakt!',
            earnedAt: now,
          });
        }
        if (session.score === session.totalQuestions) {
          newBadges.push({
            id: `perfect-${session.id}`,
            name: 'Perfect!',
            emoji: '⭐',
            description: 'Alle vragen goed!',
            earnedAt: now,
          });
        }
        const pct = session.score / session.totalQuestions;
        if (pct >= 0.8 && !newBadges.find(b => b.id === `star-${session.id}`)) {
          newBadges.push({
            id: `star-${session.id}`,
            name: 'Super Rekenwonder!',
            emoji: '🌟',
            description: '80% of meer goed!',
            earnedAt: now,
          });
        }

        if (newBadges.length > 0) {
          const profile = state.profiles.find(
            (p) => p.id === session.childId
          );
          if (profile) {
            // Badges stored in analytics, not profile — no-op here
          }
        }
      },

      setParentUnlocked: (unlocked) => set({ parentUnlocked: unlocked }),

      getSessionsForChild: (childId) =>
        get().sessions.filter((s) => s.childId === childId),

      getChildProgress: null,

      computeProgress: (childId) => {
        const sessions = get().sessions.filter((s) => s.childId === childId);
        return computeChildProgress(childId, sessions);
      },
    }),
    {
      name: 'kangoeroe-app-storage',
      partialize: (state) => ({
        profiles: state.profiles,
        sessions: state.sessions,
      }),
    }
  )
);

export { PARENT_PIN };
