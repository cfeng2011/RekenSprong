export type Level = 'wizFUN_g3' | 'wizFUN_g4' | 'wizKID' | 'wizSMART';

export type Topic =
  | 'optellen'       // addition
  | 'aftrekken'      // subtraction
  | 'vermenigvuldigen' // multiplication
  | 'delen'          // division
  | 'breuken'        // fractions
  | 'procenten'      // percentages
  | 'meetkunde'      // geometry
  | 'meten'          // measurement (length, weight, time)
  | 'logica'         // logic
  | 'reeksen'        // sequences/patterns
  | 'woordsom'       // word problems
  | 'getallenleer';  // number theory

export interface Question {
  id: string;
  level: Level;
  topic: Topic;
  question: string;
  hint?: string;
  options: string[];       // 5 options: A-E
  correct: number;         // 0-4 index
  explanation: string;
  visual?: VisualElement;
  difficulty: 1 | 2 | 3;  // 1=easy, 2=medium, 3=hard
}

export type VisualElementType =
  | 'grid'
  | 'shapes'
  | 'number_line'
  | 'table'
  | 'pattern';

export interface VisualElement {
  type: VisualElementType;
  data: unknown;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;           // emoji
  level: Level;
  createdAt: number;
  color: string;            // tailwind color class
}

export interface QuizSession {
  id: string;
  childId: string;
  level: Level;
  startedAt: number;
  finishedAt: number;
  timeLimit: number;        // seconds
  answers: SessionAnswer[];
  score: number;            // correct count
  totalQuestions: number;
}

export interface SessionAnswer {
  questionId: string;
  topic: Topic;
  selectedOption: number | null;
  correct: boolean;
  timeSpent: number;        // seconds on this question
}

export interface TopicStats {
  topic: Topic;
  correct: number;
  total: number;
  percentage: number;
}

export interface ChildProgress {
  childId: string;
  sessions: QuizSession[];
  topicStats: TopicStats[];
  weakTopics: Topic[];
  strongTopics: Topic[];
  averageScore: number;
  totalSessionsCompleted: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earnedAt: number;
}

export const LEVEL_CONFIG: Record<Level, {
  label: string;
  group: string;
  questions: number;
  timeMinutes: number;
  color: string;
  bgColor: string;
  emoji: string;
  description: string;
}> = {
  wizFUN_g3: {
    label: 'wizFUN',
    group: 'Groep 3',
    questions: 12,
    timeMinutes: 30,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    emoji: '⭐',
    description: 'Optellen en aftrekken tot 100',
  },
  wizFUN_g4: {
    label: 'wizFUN',
    group: 'Groep 4',
    questions: 24,
    timeMinutes: 60,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    emoji: '🌟',
    description: 'Tafels, meten en eenvoudige sommen',
  },
  wizKID: {
    label: 'wizKID',
    group: 'Groep 5 & 6',
    questions: 24,
    timeMinutes: 50,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    emoji: '🚀',
    description: 'Breuken, decimalen en meetkunde',
  },
  wizSMART: {
    label: 'wizSMART',
    group: 'Groep 7 & 8',
    questions: 24,
    timeMinutes: 50,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    emoji: '🏆',
    description: 'Procenten, complexe sommen en logica',
  },
};

export const TOPIC_LABELS: Record<Topic, string> = {
  optellen: 'Optellen',
  aftrekken: 'Aftrekken',
  vermenigvuldigen: 'Vermenigvuldigen',
  delen: 'Delen',
  breuken: 'Breuken',
  procenten: 'Procenten',
  meetkunde: 'Meetkunde',
  meten: 'Meten',
  logica: 'Logica',
  reeksen: 'Reeksen',
  woordsom: 'Woordsom',
  getallenleer: 'Getallenleer',
};

export const TOPIC_EMOJIS: Record<Topic, string> = {
  optellen: '➕',
  aftrekken: '➖',
  vermenigvuldigen: '✖️',
  delen: '➗',
  breuken: '½',
  procenten: '%',
  meetkunde: '📐',
  meten: '📏',
  logica: '🧩',
  reeksen: '🔢',
  woordsom: '📖',
  getallenleer: '🔢',
};
