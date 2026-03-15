import type { Question, Level } from '../types';
import { questionsWizFunG3 } from './questions-wizfun-g3';
import { questionsWizFunG4 } from './questions-wizfun-g4';
import { questionsWizKid } from './questions-wizkid';
import { questionsWizSmart } from './questions-wizsmart';

export const ALL_QUESTIONS: Record<Level, Question[]> = {
  wizFUN_g3: questionsWizFunG3,
  wizFUN_g4: questionsWizFunG4,
  wizKID: questionsWizKid,
  wizSMART: questionsWizSmart,
};

export function getQuestionsForSession(level: Level, count: number): Question[] {
  const pool = [...ALL_QUESTIONS[level]];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function getReinforceQuestions(level: Level, topic: string, exclude: string[]): Question[] {
  return ALL_QUESTIONS[level]
    .filter(q => q.topic === topic && !exclude.includes(q.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}

/**
 * Rush test: 2 easy questions (difficulty 1) + 1 challenging (difficulty 3, or 2 as fallback).
 * Shuffled so the hard one can land anywhere.
 */
export function getRushQuestions(level: Level): Question[] {
  const pool = ALL_QUESTIONS[level];

  const easy = [...pool.filter(q => q.difficulty === 1)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const hard = [...pool.filter(q => q.difficulty === 3)]
    .sort(() => Math.random() - 0.5)
    .slice(0, 1);

  // Fallback to difficulty 2 if no difficulty-3 questions exist for this level
  const challenge = hard.length > 0
    ? hard
    : [...pool.filter(q => q.difficulty === 2)].sort(() => Math.random() - 0.5).slice(0, 1);

  // Shuffle the 3 together so the hard question isn't always last
  return [...easy, ...challenge].sort(() => Math.random() - 0.5);
}
