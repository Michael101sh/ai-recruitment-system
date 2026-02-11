import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from './apiError';

describe('apiError', () => {
  describe('getApiErrorMessage', () => {
    it('returns custom error message from 401 response', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: { error: { message: 'Invalid API key' } },
        },
      } as AxiosError;

      expect(getApiErrorMessage(axiosError, 'Fallback')).toBe(
        '❌ Authentication failed — Invalid or missing API key'
      );
    });

    it('returns custom error message from 429 response', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {},
        },
      } as AxiosError;

      expect(getApiErrorMessage(axiosError, 'Fallback')).toBe(
        '⚠️ Too many requests — please wait before trying again'
      );
    });

    it('returns custom error message from 403 response', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {},
        },
      } as AxiosError;

      expect(getApiErrorMessage(axiosError, 'Fallback')).toBe(
        '❌ Access forbidden'
      );
    });

    it('uses server error message when available for generic errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { error: { message: 'Validation failed' } },
        },
      } as AxiosError;

      expect(getApiErrorMessage(axiosError, 'Fallback')).toBe('Validation failed');
    });

    it('returns fallback when no response', () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error',
      } as AxiosError;

      expect(getApiErrorMessage(axiosError, 'Fallback message')).toBe('Fallback message');
    });

    it('returns fallback for non-Axios errors', () => {
      const genericError = new Error('Something went wrong');

      expect(getApiErrorMessage(genericError, 'Fallback message')).toBe('Fallback message');
    });
  });
});
