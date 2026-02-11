import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { generateCV } from '../services/claudeService';
import type { CandidateInput, CVGenerationResult } from '../types';

/**
 * Creates a new candidate with skills, generates a CV using Claude AI,
 * saves it to the database, and returns the generation result
 */
export const createCandidateWithCV = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data: CandidateInput = req.body;

    const candidate = await prisma.candidate.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        yearsOfExp: data.yearsOfExp,
        skills: {
          create: data.skills.map((skillName) => ({
            skill: {
              connectOrCreate: {
                where: { name: skillName },
                create: { name: skillName, category: 'technical' },
              },
            },
          })),
        },
      },
      include: {
        skills: { include: { skill: true } },
      },
    });

    // Generate CV using Claude AI
    const cvContent = await generateCV({
      firstName: data.firstName,
      lastName: data.lastName,
      yearsOfExp: data.yearsOfExp,
      skills: data.skills,
    });

    // Save CV to database
    const cv = await prisma.cV.create({
      data: {
        candidateId: candidate.id,
        content: cvContent,
        generatedBy: 'claude-sonnet-4',
      },
    });

    const result: CVGenerationResult = {
      candidateId: candidate.id,
      cvId: cv.id,
      content: cv.content,
    };

    res.status(201).json({ data: result });
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
