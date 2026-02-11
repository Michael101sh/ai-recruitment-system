import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { rankCandidates } from '../services/claudeService';

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

    // Save rankings to database with priority = index + 1
    const savedRankings = await Promise.all(
      aiRankings.map((ranking, index) => {
        // Match AI result back to candidate by name
        const matched = candidates.find(
          (c) => `${c.firstName} ${c.lastName}` === ranking.name
        );

        if (!matched) {
          throw new Error(`Could not match ranking result for candidate: ${ranking.name}`);
        }

        return prisma.ranking.create({
          data: {
            candidateId: matched.id,
            score: ranking.score,
            reasoning: ranking.reasoning,
            criteria,
            shouldInterview: ranking.shouldInterview,
            priority: index + 1,
          },
          include: {
            candidate: {
              include: { skills: { include: { skill: true } } },
            },
          },
        });
      })
    );

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
      .sort((a, b) => a.priority - b.priority);

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
