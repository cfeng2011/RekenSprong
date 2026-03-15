import type {
  QuizSession,
  TopicStats,
  ChildProgress,
  Topic,
  Badge,
} from '../types';
import { TOPIC_LABELS } from '../types';

export function computeChildProgress(
  childId: string,
  sessions: QuizSession[]
): ChildProgress {
  if (sessions.length === 0) {
    return {
      childId,
      sessions: [],
      topicStats: [],
      weakTopics: [],
      strongTopics: [],
      averageScore: 0,
      totalSessionsCompleted: 0,
      streak: 0,
      badges: [],
    };
  }

  // Aggregate answers by topic
  const topicMap: Record<string, { correct: number; total: number }> = {};
  for (const session of sessions) {
    for (const answer of session.answers) {
      if (!topicMap[answer.topic]) {
        topicMap[answer.topic] = { correct: 0, total: 0 };
      }
      topicMap[answer.topic].total++;
      if (answer.correct) topicMap[answer.topic].correct++;
    }
  }

  const topicStats: TopicStats[] = Object.entries(topicMap).map(
    ([topic, { correct, total }]) => ({
      topic: topic as Topic,
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
    })
  );

  topicStats.sort((a, b) => a.percentage - b.percentage);

  const weakTopics = topicStats
    .filter((t) => t.total >= 2 && t.percentage < 60)
    .map((t) => t.topic);

  const strongTopics = topicStats
    .filter((t) => t.total >= 2 && t.percentage >= 80)
    .map((t) => t.topic);

  const totalCorrect = sessions.reduce((acc, s) => acc + s.score, 0);
  const totalQuestions = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);
  const averageScore = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  // Streak: consecutive days with sessions
  const sessionDays = sessions
    .map((s) => {
      const d = new Date(s.finishedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()
    .reverse();

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sessionDays.length; i++) {
    const target = new Date(today);
    target.setDate(target.getDate() - i);
    const key = `${target.getFullYear()}-${target.getMonth()}-${target.getDate()}`;
    if (sessionDays.includes(key)) {
      streak++;
    } else {
      break;
    }
  }

  // Badges
  const badges: Badge[] = [];
  const now = Date.now();

  if (sessions.length >= 1) {
    badges.push({
      id: 'first-quiz',
      name: 'Eerste quiz!',
      emoji: '🎉',
      description: 'Je eerste quiz afgemaakt!',
      earnedAt: sessions[0].finishedAt,
    });
  }
  if (sessions.length >= 5) {
    badges.push({
      id: 'five-quizzes',
      name: 'Doorzetter!',
      emoji: '💪',
      description: '5 quizzen afgemaakt!',
      earnedAt: sessions[4].finishedAt,
    });
  }
  if (sessions.length >= 10) {
    badges.push({
      id: 'ten-quizzes',
      name: 'Rekenheld!',
      emoji: '🦸',
      description: '10 quizzen afgemaakt!',
      earnedAt: sessions[9].finishedAt,
    });
  }
  if (sessions.some((s) => s.score === s.totalQuestions)) {
    badges.push({
      id: 'perfect-score',
      name: 'Perfectionist!',
      emoji: '⭐',
      description: 'Alle vragen in één quiz goed!',
      earnedAt: now,
    });
  }
  if (averageScore >= 80) {
    badges.push({
      id: 'high-average',
      name: 'Rekenwonder!',
      emoji: '🧠',
      description: 'Gemiddeld 80%+ goed!',
      earnedAt: now,
    });
  }
  if (streak >= 3) {
    badges.push({
      id: 'streak-3',
      name: '3 Dagen op rij!',
      emoji: '🔥',
      description: '3 dagen achter elkaar geoefend!',
      earnedAt: now,
    });
  }

  return {
    childId,
    sessions,
    topicStats,
    weakTopics,
    strongTopics,
    averageScore,
    totalSessionsCompleted: sessions.length,
    streak,
    badges,
  };
}

export function getRecommendations(progress: ChildProgress): string[] {
  const recs: string[] = [];

  if (progress.weakTopics.length > 0) {
    const weakLabels = progress.weakTopics
      .slice(0, 3)
      .map((t) => TOPIC_LABELS[t])
      .join(', ');
    recs.push(`Oefen meer met: ${weakLabels}`);
  }

  if (progress.averageScore < 50) {
    recs.push('Probeer de vragen rustiger te lezen en neem je tijd.');
  } else if (progress.averageScore >= 80) {
    recs.push('Super! Je doet het geweldig. Probeer eens een moeilijker niveau!');
  }

  if (progress.streak === 0) {
    recs.push('Oefen elke dag een beetje — dat helpt echt!');
  } else if (progress.streak >= 3) {
    recs.push(`Geweldig! Je hebt al ${progress.streak} dagen achter elkaar geoefend!`);
  }

  if (progress.strongTopics.length > 0) {
    const strongLabels = progress.strongTopics
      .slice(0, 2)
      .map((t) => TOPIC_LABELS[t])
      .join(' en ');
    recs.push(`Je bent al heel goed in ${strongLabels}! Blijf oefenen!`);
  }

  return recs;
}

export function scoreToStars(score: number, total: number): number {
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}
