import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { generateCV } from '../services/claudeService';
import type { CandidateInput } from '../types';

/**
 * Creates a new candidate, generates a CV using Claude AI, and stores it
 */
export const createCandidate = async (
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

    // Generate CV using Claude AI and store as separate CV record
    const cvContent = await generateCV({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      yearsOfExp: data.yearsOfExp,
      skills: data.skills,
    });

    await prisma.cV.create({
      data: {
        candidateId: candidate.id,
        content: cvContent,
        generatedBy: 'claude-sonnet-4',
      },
    });

    // Return the full candidate with all relations
    const fullCandidate = await prisma.candidate.findUnique({
      where: { id: candidate.id },
      include: {
        skills: { include: { skill: true } },
        cvs: true,
        rankings: true,
        interviews: true,
      },
    });

    res.status(201).json({ data: fullCandidate });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all candidates with their skills, CVs, rankings, and interviews
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
        cvs: { orderBy: { createdAt: 'desc' } },
        rankings: { orderBy: { rankedAt: 'desc' } },
        interviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: candidates });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single candidate by ID with all relations
 */
export const getCandidateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        cvs: { orderBy: { createdAt: 'desc' } },
        rankings: { orderBy: { rankedAt: 'desc' } },
        interviews: true,
      },
    });

    if (!candidate) {
      res.status(404).json({ error: { message: 'Candidate not found' } });
      return;
    }

    res.status(200).json({ data: candidate });
  } catch (error) {
    next(error);
  }
};
