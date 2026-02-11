import type { Request, Response, NextFunction } from 'express';

import { candidateRepository } from '../dal/candidateRepository';
import { rankingRepository } from '../dal/rankingRepository';
import { rankCandidates } from '../services/claudeService';
import { logger } from '../utils/logger';
import { NotFoundError } from '../utils/AppError';
import { PaginationSchema } from '../types';
import type { RankCandidatesInput } from '../types';

/**
 * Ranks all candidates in the system against given criteria using Claude AI.
 * Saves rankings with priority based on result order (index + 1).
 */
export const rankAllCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { criteria }: RankCandidatesInput = req.body;

    // Fetch all candidates with their skills via the DAL
    const candidates = await candidateRepository.findAllWithSkills();

    if (candidates.length === 0) {
      throw new NotFoundError('No candidates found in the system');
    }

    // Prepare candidate data for AI ranking
    const candidateData = candidates.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      experience: c.yearsOfExp,
      skills: c.skills.map((cs) => cs.skill.name),
    }));

    // Build a lookup of valid candidate IDs and a name map for fallback messages
    const candidateIdSet = new Set(candidates.map((c) => c.id));
    const candidateNameMap = new Map(
      candidates.map((c) => [c.id, `${c.firstName} ${c.lastName}`]),
    );

    // Get AI rankings — retry once if any candidates are missing
    let aiRankings = await rankCandidates(candidateData, criteria);
    let rankedIds = new Set(
      aiRankings.filter((r) => candidateIdSet.has(r.id)).map((r) => r.id),
    );

    if (rankedIds.size < candidates.length) {
      const missingNames = candidates
        .filter((c) => !rankedIds.has(c.id))
        .map((c) => `${c.firstName} ${c.lastName}`);
      logger.warn(
        `AI missed ${missingNames.length} candidate(s) on first attempt: ${missingNames.join(', ')}. Retrying…`,
      );

      const retryRankings = await rankCandidates(candidateData, criteria);
      // Merge: use retry results for any IDs missing from the first run
      for (const r of retryRankings) {
        if (candidateIdSet.has(r.id) && !rankedIds.has(r.id)) {
          aiRankings.push(r);
          rankedIds.add(r.id);
        }
      }
    }

    // Fallback: assign a default ranking for any candidates still missing
    for (const c of candidates) {
      if (!rankedIds.has(c.id)) {
        logger.warn(
          `Candidate ${candidateNameMap.get(c.id)} (${c.id}) missed by AI after retry — assigning fallback ranking`,
        );
        aiRankings.push({
          id: c.id,
          score: 0,
          reasoning: 'Could not be evaluated by AI — please re-run ranking.',
          shouldInterview: false,
        });
      }
    }

    // Delete all previous rankings before saving new ones
    await rankingRepository.deleteAll();

    // Save rankings to database with priority = index + 1
    const savedRankings: Array<Awaited<ReturnType<typeof rankingRepository.create>>> = [];
    let priority = 1;

    for (const ranking of aiRankings) {
      // Skip if Claude returned an ID we don't recognise
      if (!candidateIdSet.has(ranking.id)) {
        logger.warn(`Skipping unknown candidate ID from AI: ${ranking.id}`);
        continue;
      }

      const saved = await rankingRepository.create({
        candidateId: ranking.id,
        score: ranking.score,
        reasoning: ranking.reasoning,
        criteria,
        shouldInterview: ranking.shouldInterview,
        priority,
      });

      savedRankings.push(saved);
      priority++;
    }

    res.status(200).json({ data: savedRankings });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all rankings with candidate details, ordered by priority ascending.
 * Supports optional pagination via `?page=1&limit=50` query params.
 */
export const getRankings = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await rankingRepository.findAll({ page, limit });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Returns candidates split into two lists: those who should be interviewed
 * (ordered by score desc) and those who should not (ordered by score desc).
 */
export const getInterviewList = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await rankingRepository.findSplitByInterview();

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};
