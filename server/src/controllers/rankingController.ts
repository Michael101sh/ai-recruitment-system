import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { rankCandidates } from '../services/claudeService';
import type { RankCandidatesInput } from '../types';

/**
 * Ranks a set of candidates against a job description using Claude AI
 */
export const rankAllCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobDescription, candidateIds }: RankCandidatesInput = req.body;

    // Fetch candidates with their skills
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } },
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (candidates.length === 0) {
      res.status(404).json({ error: { message: 'No candidates found for the provided IDs' } });
      return;
    }

    // Prepare candidate data for AI ranking
    const candidateData = candidates.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      yearsOfExp: c.yearsOfExp,
      skills: c.skills.map((cs) => cs.skill.name),
    }));

    // Get AI rankings
    const rankings = await rankCandidates(candidateData, jobDescription);

    // Store rankings in database
    const savedRankings = await Promise.all(
      rankings.map((ranking) =>
        prisma.ranking.create({
          data: {
            candidateId: ranking.candidateId,
            score: ranking.score,
            reasoning: ranking.reasoning,
            criteria: ranking.criteria,
            shouldInterview: ranking.shouldInterview,
            priority: ranking.priority,
          },
          include: {
            candidate: {
              include: { skills: { include: { skill: true } } },
            },
          },
        })
      )
    );

    // Sort by priority ascending (1 = highest priority)
    const sortedRankings = savedRankings.sort((a, b) => a.priority - b.priority);

    res.status(200).json({ data: sortedRankings });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all rankings, sorted by priority ascending
 */
export const getAllRankings = async (
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
