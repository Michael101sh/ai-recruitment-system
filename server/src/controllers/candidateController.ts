import type { Request, Response, NextFunction } from 'express';

import { prisma } from '../services/prismaService';
import { generateCV } from '../services/claudeService';
import type { CandidateInput } from '../types';

/**
 * Creates a new candidate and generates a CV using Claude AI
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
        summary: data.summary,
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
    const generatedCV = await generateCV({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      yearsOfExp: data.yearsOfExp,
      summary: data.summary,
      skills: data.skills,
    });

    // Update candidate with generated CV
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { generatedCV },
      include: {
        skills: { include: { skill: true } },
      },
    });

    res.status(201).json({ data: updatedCandidate });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all candidates with their skills
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
        rankings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: candidates });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single candidate by ID
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
        rankings: { orderBy: { createdAt: 'desc' } },
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
