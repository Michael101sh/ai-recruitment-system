/**
 * Data Access Layer for Candidate entities.
 *
 * All Prisma-specific queries live here so that controllers and services
 * remain decoupled from the ORM.  If the database or ORM changes in the
 * future, only this file needs updating.
 */
import { prisma } from '../services/prismaService';

// ── Types ────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  yearsOfExp: number;
  skills: string[];
}

export interface CreateCVData {
  candidateId: string;
  content: string;
  prompt: string;
  generatedBy: string;
}

// ── Repository ───────────────────────────────────────────────────────

export const candidateRepository = {
  /** Find a candidate by their unique email address. */
  async findByEmail(email: string) {
    return prisma.candidate.findUnique({ where: { email } });
  },

  /**
   * Create a new candidate with associated skills.
   * Skills are connected or created automatically (connectOrCreate pattern).
   */
  async create(data: CreateCandidateData) {
    return prisma.candidate.create({
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
    });
  },

  /**
   * Retrieve candidates with their relations, using offset-based pagination.
   * Includes: skills, latest CV, and latest ranking.
   */
  async findAll(
    pagination: PaginationParams,
  ): Promise<PaginatedResult<unknown>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        include: {
          skills: { include: { skill: true } },
          cvs: { orderBy: { createdAt: 'desc' }, take: 1 },
          rankings: { orderBy: { rankedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.candidate.count(),
    ]);

    return {
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /** Retrieve all candidates with skills (no pagination — used for AI ranking). */
  async findAllWithSkills() {
    return prisma.candidate.findMany({
      include: {
        skills: { include: { skill: true } },
      },
    });
  },

  /** Create a CV record for a candidate. */
  async createCV(data: CreateCVData) {
    return prisma.cV.create({
      data: {
        candidateId: data.candidateId,
        content: data.content,
        prompt: data.prompt,
        generatedBy: data.generatedBy,
      },
    });
  },
};
