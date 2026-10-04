export interface GradeInfo {
  grade: string;
  color: string;
  emoji: string;
}

export function getGrade(pct: number): GradeInfo {
  if (pct >= 90) return { grade: 'A+', color: '#16A34A', emoji: '🏆' };
  if (pct >= 80) return { grade: 'A', color: '#16A34A', emoji: '⭐' };
  if (pct >= 70) return { grade: 'B+', color: '#2563EB', emoji: '😊' };
  if (pct >= 60) return { grade: 'B', color: '#2563EB', emoji: '👍' };
  if (pct >= 50) return { grade: 'C', color: '#D97706', emoji: '✅' };
  return { grade: 'F', color: '#DC2626', emoji: '💪' };
}
