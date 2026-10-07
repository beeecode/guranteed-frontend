import { bundleScores } from '@/data/student';
import { sum } from '@/lib/format';
import type { ExamBundle } from '@/types/exam';
import type { SubjectResult } from '../components/SubjectResultsAccordion';
import { getGrade } from './grades';

/** Per-subject grades plus overall average/grade for a completed bundle. */
export function summarizeBundleResults(bundle: ExamBundle) {
  const subjectResults: SubjectResult[] = bundle.subjects.map((s, i) => {
    const pct = bundleScores[i] ?? 70;
    return { ...s, pct, ...getGrade(pct) };
  });

  const avgPct = Math.round(sum(subjectResults, r => r.pct) / subjectResults.length);
  const bestSubject = subjectResults.reduce((best, r) => r.pct > best.pct ? r : best, subjectResults[0]);

  return { subjectResults, avgPct, overall: getGrade(avgPct), bestSubject };
}
