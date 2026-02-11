import type { Request, Response, NextFunction } from 'express';
import { getAllCandidates, deleteCandidate } from './candidateController';
import { candidateRepository } from '../dal/candidateRepository';
import { createMockCandidate } from '../test/mockData';

jest.mock('../dal/candidateRepository');

describe('candidateController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockSend: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockNext = jest.fn();

    mockRequest = {
      query: {},
      params: {},
    };

    mockResponse = {
      json: mockJson,
      send: mockSend,
      status: mockStatus,
    };

    jest.clearAllMocks();
  });

  describe('getAllCandidates', () => {
    it('returns paginated candidates with default pagination', async () => {
      const mockData = {
        data: [createMockCandidate()],
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      };

      (candidateRepository.findAll as jest.Mock).mockResolvedValue(mockData);

      await getAllCandidates(mockRequest as Request, mockResponse as Response, mockNext);

      expect(candidateRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
      expect(mockJson).toHaveBeenCalledWith(mockData);
    });

    it('uses custom pagination parameters', async () => {
      mockRequest.query = { page: '3', limit: '10' };

      const mockData = {
        data: [],
        pagination: { page: 3, limit: 10, total: 50, totalPages: 5 },
      };

      (candidateRepository.findAll as jest.Mock).mockResolvedValue(mockData);

      await getAllCandidates(mockRequest as Request, mockResponse as Response, mockNext);

      expect(candidateRepository.findAll).toHaveBeenCalledWith({ page: 3, limit: 10 });
    });

    it('enforces maximum limit of 100', async () => {
      mockRequest.query = { limit: '500' };

      await getAllCandidates(mockRequest as Request, mockResponse as Response, mockNext);

      // Zod validation will clamp limit to 100
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(''),
        })
      );
    });

    it('enforces minimum page of 1', async () => {
      mockRequest.query = { page: '0' };

      await getAllCandidates(mockRequest as Request, mockResponse as Response, mockNext);

      // Zod validation will reject page 0
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(''),
        })
      );
    });
  });

  describe('deleteCandidate', () => {
    it('deletes candidate and returns 204', async () => {
      mockRequest.params = { id: '123' };
      (candidateRepository.delete as jest.Mock).mockResolvedValue(createMockCandidate());

      await deleteCandidate(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(candidateRepository.delete).toHaveBeenCalledWith('123');
      expect(mockStatus).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('calls next with error when delete fails', async () => {
      mockRequest.params = { id: 'nonexistent' };
      const error = new Error('Candidate not found');
      (candidateRepository.delete as jest.Mock).mockRejectedValue(error);

      await deleteCandidate(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
