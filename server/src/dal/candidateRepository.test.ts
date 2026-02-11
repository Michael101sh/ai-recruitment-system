import { candidateRepository } from './candidateRepository';
import { prisma } from '../services/prismaService';
import { createMockCandidate } from '../test/mockData';

// Mock Prisma client
jest.mock('../services/prismaService', () => ({
  prisma: {
    candidate: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    cV: {
      create: jest.fn(),
    },
  },
}));

describe('candidateRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('finds candidate by email', async () => {
      const mockCandidate = createMockCandidate({ email: 'test@example.com' });
      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(mockCandidate);

      const result = await candidateRepository.findByEmail('test@example.com');

      expect(prisma.candidate.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockCandidate);
    });

    it('returns null when candidate not found', async () => {
      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await candidateRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates candidate with skills using connectOrCreate pattern', async () => {
      const mockCandidate = createMockCandidate();
      (prisma.candidate.create as jest.Mock).mockResolvedValue(mockCandidate);

      const data = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        yearsOfExp: 3,
        skills: ['React', 'TypeScript'],
      };

      await candidateRepository.create(data);

      expect(prisma.candidate.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: undefined,
          yearsOfExp: 3,
          skills: {
            create: [
              {
                skill: {
                  connectOrCreate: {
                    where: { name: 'React' },
                    create: { name: 'React', category: 'technical' },
                  },
                },
              },
              {
                skill: {
                  connectOrCreate: {
                    where: { name: 'TypeScript' },
                    create: { name: 'TypeScript', category: 'technical' },
                  },
                },
              },
            ],
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('returns paginated candidates with relations', async () => {
      const mockCandidates = [createMockCandidate(), createMockCandidate({ id: '2' })];
      (prisma.candidate.findMany as jest.Mock).mockResolvedValue(mockCandidates);
      (prisma.candidate.count as jest.Mock).mockResolvedValue(15);

      const result = await candidateRepository.findAll({ page: 2, limit: 5 });

      expect(prisma.candidate.findMany).toHaveBeenCalledWith({
        include: {
          skills: { include: { skill: true } },
          cvs: { orderBy: { createdAt: 'desc' }, take: 1 },
          rankings: { orderBy: { rankedAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
      });

      expect(result.data).toEqual(mockCandidates);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('delete', () => {
    it('deletes candidate by ID', async () => {
      const mockCandidate = createMockCandidate();
      (prisma.candidate.delete as jest.Mock).mockResolvedValue(mockCandidate);

      await candidateRepository.delete('1');

      expect(prisma.candidate.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('createCV', () => {
    it('creates CV with all fields', async () => {
      const mockCV = {
        id: 'cv1',
        candidateId: '1',
        content: 'CV content',
        generatedBy: 'claude-sonnet-4',
        prompt: 'Generate CV...',
        createdAt: new Date(),
      };
      (prisma.cV.create as jest.Mock).mockResolvedValue(mockCV);

      const data = {
        candidateId: '1',
        content: 'CV content',
        generatedBy: 'claude-sonnet-4',
        prompt: 'Generate CV...',
      };

      const result = await candidateRepository.createCV(data);

      expect(prisma.cV.create).toHaveBeenCalledWith({
        data: {
          candidateId: '1',
          content: 'CV content',
          prompt: 'Generate CV...',
          generatedBy: 'claude-sonnet-4',
        },
      });
      expect(result).toEqual(mockCV);
    });
  });
});
