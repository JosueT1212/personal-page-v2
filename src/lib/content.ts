export type PostStatus = 'draft' | 'in-progress' | 'notes' | 'published';

export const STATUS_LABEL: Record<PostStatus, string> = {
  draft: 'Draft',
  'in-progress': 'In progress',
  notes: 'Notes',
  published: '',
};

export function primes(n: number): number[] {
  const out: number[] = [];
  for (let c = 2; out.length < n; c++) if (out.every(p => c % p)) out.push(c);
  return out;
}

export const latest = <T extends { data: { date: Date } }>(items: T[], n: number): T[] =>
  [...items].sort((a, b) => b.data.date.getTime() - a.data.date.getTime()).slice(0, n);
