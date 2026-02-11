import { rankingRepository } from './rankingRepository';
import { prisma } from '../services/prismaService';
import { createMockRanking } from '../test/mockData';

jest.mock('../services/prismaService', () => ({
  prisma: {
    ranking: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

describe('rankingRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates ranking with all fields', async () => {
      const mockRanking = createMockRanking();
      (prisma.ranking.create as jest.Mock).mockResolvedValue(mockRanking);

      const data = {
        candidateId: '1',
        score: 85,
        reasoning: 'Strong candidate',
        criteria: 'Senior Engineer',
        shouldInterview: true,
        priority: 1,
      };

      const result = await rankingRepository.create(data);

      expect(prisma.ranking.create).toHaveBeenCalledWith({
        data,
        include: {
          candidate: {
            include: { skills: { include: { skill: true } } },
          },
        },
      });
      expect(result).toEqual(mockRanking);
    });
  });

  describe('findAll', () => {
    it('returns paginated rankings', async () => {
      const mockRankings = [createMockRanking(), createMockRanking({ id: 'r2' })];
      (prisma.ranking.findMany as jest.Mock).mockResolvedValue(mockRankings);
      (prisma.ranking.count as jest.Mock).mockResolvedValue(20);

      const result = await rankingRepository.findAll({ page: 1, limit: 10 });

      expect(prisma.ranking.findMany).toHaveBeenCalledWith({
        include: {
          candidate: {
            include: { skills: { include: { skill: true } } },
          },
        },
        orderBy: { priority: 'asc' },
        skip: 0,
        take: 10,
      });

      expect(result.data).toEqual(mockRankings);
      expect(result.pagination.total).toBe(20);
    });
  });

  describe('findSplitByInterview', () => {
    it('splits rankings by shouldInterview flag', async () => {
      const approved = [createMockRanking({ shouldInterview: true, score: 90 })];
      const rejected = [createMockRanking({ id: 'r2', shouldInterview: false, score: 30 })];

      (prisma.ranking.findMany as jest.Mock).mockResolvedValue([...approved, ...rejected]);

      const result = await rankingRepository.findSplitByInterview();

      expect(prisma.ranking.findMany).toHaveBeenCalledTimes(1);
      expect(result.shouldInterview).toEqual(approved);
      expect(result.shouldNotInterview).toEqual(rejected);
    });
  });

  describe('deleteAll', () => {
    it('deletes all rankings', async () => {
      (prisma.ranking.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });

      await rankingRepository.deleteAll();

      expect(prisma.ranking.deleteMany).toHaveBeenCalledWith();
    });
  });
});
