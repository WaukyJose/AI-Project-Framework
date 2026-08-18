/**
 * @jest-environment node
 */
import { CreateSessionResponse } from '../types/speaking';

// Mock apiClient before importing speakingApi
const mockRequest = jest.fn();
jest.mock('../services/api/api-client', () => ({
  apiClient: {
    request: mockRequest,
  },
}));

jest.mock('expo-file-system', () => ({
  File: class MockFile {},
}));

import { speakingApi } from '../services/api/speaking-api';

describe('createSession payload', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('sends speaking_language: "es" for Spanish', async () => {
    mockRequest.mockResolvedValueOnce({
      session_id: 'test-es',
      part: 'part-1',
      session_state: 'created',
      created_at: '2026-01-01T00:00:00Z',
    } as CreateSessionResponse);

    await speakingApi.createSession('part-1', 'es');

    expect(mockRequest).toHaveBeenCalledTimes(1);
    const [path, options] = mockRequest.mock.calls[0];
    expect(path).toBe('/speaking/sessions/');
    expect(options.method).toBe('POST');
    expect(options.body).toEqual({ part: 'part-1', speaking_language: 'es' });
  });

  it('sends speaking_language: "en" for English (regression)', async () => {
    mockRequest.mockResolvedValueOnce({
      session_id: 'test-en',
      part: 'part-1',
      session_state: 'created',
      created_at: '2026-01-01T00:00:00Z',
    } as CreateSessionResponse);

    await speakingApi.createSession('part-1', 'en');

    expect(mockRequest).toHaveBeenCalledTimes(1);
    const [path, options] = mockRequest.mock.calls[0];
    expect(path).toBe('/speaking/sessions/');
    expect(options.method).toBe('POST');
    expect(options.body).toEqual({ part: 'part-1', speaking_language: 'en' });
  });
});