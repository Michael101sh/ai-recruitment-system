import type { Candidate } from '../../types';
import type { SortOption } from '../../components/candidates/CandidateFilters';

/**
 * Filters candidates by a search query across name, email, and skills
 */
export const filterCandidates = (candidates: Candidate[], query: string): Candidate[] => {
  if (!query.trim()) return candidates;
  const lower = query.toLowerCase().trim();
  return candidates.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const email = c.email.toLowerCase();
    const skills = c.skills.map((s) => s.skill.name.toLowerCase()).join(' ');
    return fullName.includes(lower) || email.includes(lower) || skills.includes(lower);
  });
};

/**
 * Sorts candidates by the chosen option
 */
export const sortCandidates = (candidates: Candidate[], sort: SortOption): Candidate[] => {
  const sorted = [...candidates];
  sorted.sort((a, b) => {
    switch (sort) {
      case 'score-desc': {
        // Unranked candidates (-1) sort to bottom when descending
        const sa = a.rankings[0]?.score ?? -1;
        const sb = b.rankings[0]?.score ?? -1;
        return sb - sa;
      }
      case 'score-asc': {
        // Unranked candidates (-1) sort to bottom when ascending
        const sa = a.rankings[0]?.score ?? -1;
        const sb = b.rankings[0]?.score ?? -1;
        return sa - sb;
      }
      case 'name-asc':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'name-desc':
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case 'exp-desc':
        return b.yearsOfExp - a.yearsOfExp;
      case 'exp-asc':
        return a.yearsOfExp - b.yearsOfExp;
      default:
        return 0;
    }
  });
  return sorted;
};
