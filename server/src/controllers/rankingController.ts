import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { rankCandidates } from '../services/claudeService';
import { logger } from '../utils/logger';

/**
 * Ranks all candidates in the system against given criteria using Claude AI.
 * Saves rankings with priority based on result order (index + 1).
 */
export const rankAllCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const criteria: string = req.body.criteria || 'Software Engineering Position';

    // Fetch all candidates with their skills
    const candidates = await prisma.candidate.findMany({
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (candidates.length === 0) {
      res.status(404).json({ error: { message: 'No candidates found in the system' } });
      return;
    }

    // Prepare candidate data for AI ranking
    const candidateData = candidates.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      experience: c.yearsOfExp,
      skills: c.skills.map((cs) => cs.skill.name),
    }));

    // Get AI rankings
    const aiRankings = await rankCandidates(candidateData, criteria);

    // Delete all previous rankings before saving new ones
    await prisma.ranking.deleteMany();

    // Build a lookup set of valid candidate IDs for fast validation
    const candidateIdSet = new Set(candidates.map((c) => c.id));

    // Save rankings to database with priority = index + 1
    const savedRankings: Array<Awaited<ReturnType<typeof prisma.ranking.create>>> = [];
    let priority = 1;

    for (const ranking of aiRankings) {
      // Skip if Claude returned an ID we don't recognize
      if (!candidateIdSet.has(ranking.id)) {
        logger.warn(`Skipping unknown candidate ID from AI: ${ranking.id}`);
        continue;
      }

      const saved = await prisma.ranking.create({
        data: {
          candidateId: ranking.id,
          score: ranking.score,
          reasoning: ranking.reasoning,
          criteria,
          shouldInterview: ranking.shouldInterview,
          priority,
        },
        include: {
          candidate: {
            include: { skills: { include: { skill: true } } },
          },
        },
      });

      savedRankings.push(saved);
      priority++;
    }

    // If some candidates were missed by the AI, log a warning
    if (savedRankings.length < candidates.length) {
      logger.warn(
        `AI ranked ${savedRankings.length}/${candidates.length} candidates. ` +
        `Missing IDs will not have rankings.`
      );
    }

    res.status(200).json({ data: savedRankings });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all rankings with candidate details, ordered by priority ascending
 */
export const getRankings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rankings = await prisma.ranking.findMany({
      include: {
        candidate: {
          include: { skills: { include: { skill: true } } },
        },
      },
      orderBy: { priority: 'asc' },
    });

    res.status(200).json({ data: rankings });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns candidates split into two lists: those who should be interviewed
 * (ordered by priority) and those who should not (ordered by score descending)
 */
export const getInterviewList = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rankings = await prisma.ranking.findMany({
      include: {
        candidate: {
          include: { skills: { include: { skill: true } } },
        },
      },
    });

    const shouldInterview = rankings
      .filter((r) => r.shouldInterview)
      .sort((a, b) => b.score - a.score);

    const shouldNotInterview = rankings
      .filter((r) => !r.shouldInterview)
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      data: {
        shouldInterview,
        shouldNotInterview,
      },
    });
  } catch (error) {
    next(error);
  }
};
