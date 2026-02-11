/**
 * Data Access Layer for Ranking entities.
 *
 * Abstracts all Prisma queries related to candidate rankings so that
 * the controller / service layer stays ORM-agnostic.
 */
import { prisma } from '../services/prismaService';
import type { PaginationParams, PaginatedResult } from './candidateRepository';

// ── Types ────────────────────────────────────────────────────────────

export interface CreateRankingData {
  candidateId: string;
  score: number;
  reasoning: string;
  criteria: string;
  shouldInterview: boolean;
  priority: number;
}

// ── Repository ───────────────────────────────────────────────────────

/** Standard includes for rankings — always load the related candidate. */
const RANKING_INCLUDE = {
  candidate: {
    include: { skills: { include: { skill: true } } },
  },
} as const;

export const rankingRepository = {
  /** Delete all existing rankings (used before a new ranking run). */
  async deleteAll() {
    return prisma.ranking.deleteMany();
  },

  /** Create a single ranking with included candidate data. */
  async create(data: CreateRankingData) {
    return prisma.ranking.create({
      data,
      include: RANKING_INCLUDE,
    });
  },

  /** Retrieve rankings ordered by priority, with pagination. */
  async findAll(
    pagination: PaginationParams,
  ): Promise<PaginatedResult<unknown>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [rankings, total] = await Promise.all([
      prisma.ranking.findMany({
        include: RANKING_INCLUDE,
        orderBy: { priority: 'asc' },
        skip,
        take: limit,
      }),
      prisma.ranking.count(),
    ]);

    return {
      data: rankings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Retrieve all rankings split into "should interview" and
   * "should not interview" lists, each sorted by score descending.
   */
  async findSplitByInterview() {
    const rankings = await prisma.ranking.findMany({
      include: RANKING_INCLUDE,
    });

    const shouldInterview = rankings
      .filter((r) => r.shouldInterview)
      .sort((a, b) => b.score - a.score);

    const shouldNotInterview = rankings
      .filter((r) => !r.shouldInterview)
      .sort((a, b) => b.score - a.score);

    return { shouldInterview, shouldNotInterview };
  },
};
