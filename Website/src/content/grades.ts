/**
 * Pokhara University undergraduate grading, from https://pu.edu.np/examination/academic-system/
 * Final score = 0.5 × internal + 0.5 × external; both must be at least 45% to pass.
 */
export const GRADES = [
  { letter: 'A', point: 4.0, min: 90, remark: 'Excellent' },
  { letter: 'A-', point: 3.7, min: 85, remark: 'Excellent' },
  { letter: 'B+', point: 3.3, min: 80, remark: 'Good' },
  { letter: 'B', point: 3.0, min: 75, remark: 'Good' },
  { letter: 'B-', point: 2.7, min: 70, remark: 'Good' },
  { letter: 'C+', point: 2.3, min: 65, remark: 'Fair' },
  { letter: 'C', point: 2.0, min: 60, remark: 'Fair' },
  { letter: 'C-', point: 1.7, min: 55, remark: 'Fair' },
  { letter: 'D+', point: 1.3, min: 50, remark: 'Satisfactory' },
  { letter: 'D', point: 1.0, min: 45, remark: 'Minimum for credit' },
  { letter: 'F', point: 0.0, min: 0, remark: 'Fail' },
] as const;

export type Letter = (typeof GRADES)[number]['letter'];

export const gradePoint = (letter: string): number | undefined => GRADES.find((g) => g.letter === letter)?.point;

/** The final-score range a grade covers, short: "90+", "85–89", "<45". */
export function gradeRange(index: number) {
  const g = GRADES[index];
  if (index === 0) return `${g.min}+`;
  if (g.letter === 'F') return `<${GRADES[index - 1].min}`;
  return `${g.min}–${GRADES[index - 1].min - 1}`;
}

/** Where the rules above come from, and when they were checked. */
export const GRADING_SOURCE = {
  url: 'https://pu.edu.np/examination/academic-system/',
  title: 'Pokhara University — Academic System',
  retrieved: 'September 29, 2026',
};

/** PU thresholds for undergraduates. */
export const MIN_CGPA = 2.0;
export const DISTINCTION_CGPA = 3.6;
export const DEANS_LIST_GPA = 3.7;

/** Σ(credit × grade point) ÷ Σ credits, or null when nothing is graded yet. */
export function gpa(items: { credits: number; point: number }[]) {
  const credits = items.reduce((sum, i) => sum + i.credits, 0);
  if (!credits) return null;
  return items.reduce((sum, i) => sum + i.credits * i.point, 0) / credits;
}

/** GPAs are shown to two decimals, the way PU transcripts print them. */
export const formatGpa = (value: number | null) => (value === null ? '—' : value.toFixed(2));
