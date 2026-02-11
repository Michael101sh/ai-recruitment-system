import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { generateCandidateProfiles, generateCV } from '../services/claudeService';
import { logger } from '../utils/logger';
import type { GenerateCandidatesInput, BatchGenerationResult } from '../types';

/**
 * Uses Claude AI to generate candidate profiles and CVs in bulk.
 * No manual input needed - AI creates realistic candidates from scratch.
 */
export const generateCandidatesWithCVs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { count }: GenerateCandidatesInput = req.body;

    // Step 1: Ask Claude to generate fictional candidate profiles
    const profiles = await generateCandidateProfiles(count);

    logger.info(`Generated ${profiles.length} candidate profiles, creating records...`);

    // Step 2: For each profile, create the candidate in DB and generate a CV
    const results: BatchGenerationResult['candidates'] = [];

    for (const profile of profiles) {
      // Ensure email is unique — add a random suffix if it already exists
      let email = profile.email;
      const existingCandidate = await prisma.candidate.findUnique({ where: { email } });
      if (existingCandidate) {
        const suffix = Math.random().toString(36).substring(2, 7);
        const [localPart, domain] = email.split('@');
        email = `${localPart}+${suffix}@${domain}`;
      }

      const candidate = await prisma.candidate.create({
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email,
          phone: profile.phone,
          yearsOfExp: profile.yearsOfExp,
          skills: {
            create: profile.skills.map((skillName) => ({
              skill: {
                connectOrCreate: {
                  where: { name: skillName },
                  create: { name: skillName, category: 'technical' },
                },
              },
            })),
          },
        },
      });

      // Generate a full CV for this candidate
      const cvContent = await generateCV({
        firstName: profile.firstName,
        lastName: profile.lastName,
        yearsOfExp: profile.yearsOfExp,
        skills: profile.skills,
      });

      const cv = await prisma.cV.create({
        data: {
          candidateId: candidate.id,
          content: cvContent,
          generatedBy: 'claude-sonnet-4',
        },
      });

      results.push({
        candidateId: candidate.id,
        name: `${profile.firstName} ${profile.lastName}`,
        cvId: cv.id,
      });
    }

    const batchResult: BatchGenerationResult = {
      generated: results.length,
      candidates: results,
    };

    res.status(201).json({ data: batchResult });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all candidates with their skills, latest CV, and latest ranking
 */
export const getAllCandidates = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        skills: { include: { skill: true } },
        cvs: { orderBy: { createdAt: 'desc' }, take: 1 },
        rankings: { orderBy: { rankedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: candidates });
  } catch (error) {
    next(error);
  }
};
