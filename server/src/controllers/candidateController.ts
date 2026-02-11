import type { Request, Response, NextFunction } from 'express';

import { candidateRepository } from '../dal/candidateRepository';
import { generateCandidateProfiles, generateCV } from '../services/claudeService';
import { logger } from '../utils/logger';
import { PaginationSchema } from '../types';
import type { GenerateCandidatesInput, BatchGenerationResult } from '../types';

/**
 * Uses Claude AI to generate candidate profiles and CVs in bulk.
 * No manual input needed — AI creates realistic candidates from scratch.
 */
export const generateCandidatesWithCVs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { count }: GenerateCandidatesInput = req.body;

    // Step 1: Ask Claude to generate fictional candidate profiles
    const profiles = await generateCandidateProfiles(count);

    logger.info(`Generated ${profiles.length} candidate profiles, creating records…`);

    // Step 2: For each profile, create the candidate in DB and generate a CV
    const results: BatchGenerationResult['candidates'] = [];

    for (const profile of profiles) {
      // Ensure email is unique — add a random suffix if it already exists
      let email = profile.email;
      const existingCandidate = await candidateRepository.findByEmail(email);
      if (existingCandidate) {
        const suffix = Math.random().toString(36).substring(2, 7);
        const [localPart, domain] = email.split('@');
        email = `${localPart}+${suffix}@${domain}`;
      }

      const candidate = await candidateRepository.create({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email,
        phone: profile.phone,
        yearsOfExp: profile.yearsOfExp,
        skills: profile.skills,
      });

      // Generate a full CV for this candidate
      const cvResult = await generateCV({
        firstName: profile.firstName,
        lastName: profile.lastName,
        yearsOfExp: profile.yearsOfExp,
        skills: profile.skills,
      });

      const cv = await candidateRepository.createCV({
        candidateId: candidate.id,
        content: cvResult.content,
        prompt: cvResult.prompt,
        generatedBy: 'claude-sonnet-4',
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
 * Retrieves all candidates with their skills, latest CV, and latest ranking.
 * Supports optional pagination via `?page=1&limit=50` query params.
 */
export const getAllCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit } = PaginationSchema.parse(req.query);
    const result = await candidateRepository.findAll({ page, limit });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a candidate by ID.
 * Automatically cascades to delete all related CVs, skills, and rankings.
 */
export const deleteCandidate = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    await candidateRepository.delete(id);

    logger.info(`Deleted candidate ${id} and all related data`);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
