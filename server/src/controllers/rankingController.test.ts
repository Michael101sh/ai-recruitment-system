import type { Request, Response, NextFunction } from 'express';
import { getRankings } from './rankingController';
import { rankingRepository } from '../dal/rankingRepository';
import { createMockRanking } from '../test/mockData';

jest.mock('../dal/rankingRepository');

describe('rankingController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();

    mockRequest = {
      query: {},
    };

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('getRankings', () => {
    it('returns paginated rankings', async () => {
      const mockData = {
        data: [createMockRanking()],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      };

      (rankingRepository.findAll as jest.Mock).mockResolvedValue(mockData);

      await getRankings(mockRequest as Request, mockResponse as Response, mockNext);

      expect(rankingRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    it('uses custom pagination parameters', async () => {
      mockRequest.query = { page: '2', limit: '25' };

      const mockData = {
        data: [],
        pagination: { page: 2, limit: 25, total: 100, totalPages: 4 },
      };

      (rankingRepository.findAll as jest.Mock).mockResolvedValue(mockData);

      await getRankings(mockRequest as Request, mockResponse as Response, mockNext);

      expect(rankingRepository.findAll).toHaveBeenCalledWith({ page: 2, limit: 25 });
    });
  });
});
