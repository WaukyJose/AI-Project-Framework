/**
 * @jest-environment node
 */

// @ts-nocheck

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

const mockCreateSession = jest.fn();
const mockStartSession = jest.fn();

const mockSpeakingApi = {
  completeSession: jest.fn(),
  createSession: mockCreateSession,
  getAssessment: jest.fn(),
  startSession: mockStartSession,
  submitTurn: jest.fn(),
};

const mockRecorderState = {
  capability: {
    playbackSupported: true,
    recordingMessage: 'Recording is available.',
    recordingStatus: 'ready',
  },
  lifecycleStatus: 'recorded' as const,
};

const mockAuthState = {
  isAuthenticated: true,
  logout: jest.fn(async () => {
    mockAuthState.isAuthenticated = false;
    mockAuthState.user = null;
  }),
  restoreSession: jest.fn(),
  user: {
    displayName: 'Mobile User',
    email: 'mobile@example.com',
    firstName: 'Mobile',
    fullName: 'Mobile User',
    id: 1,
    identifier: 'mobile-user',
    lastName: 'User',
    username: 'mobile-user',
  },
};

let currentLanguage: 'en' | 'es' = 'en';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        openVozApi: {
          defaultEnvironment: 'production',
          environments: {
            production: {
              apiBaseUrl: 'https://example.com/api/v1',
              connectivityPath: '/usersvoicechat/login/',
              label: 'Production',
              siteUrl: 'https://example.com',
              versionPath: '/api/version/',
            },
          },
        },
      },
    },
  },
}));

jest.mock('../utils/logger', () => ({
  logger: mockLogger,
}));

jest.mock('../store/auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(() => mockAuthState),
  },
}));

jest.mock('../store/ui-preferences-store', () => ({
  useUiPreferencesStore: {
    getState: jest.fn(() => ({
      uiLanguage: currentLanguage,
    })),
  },
}));

jest.mock('../services/api', () => ({
  ApiError: class MockApiError extends Error {
    code: string;
    details?: unknown;
    status?: number;
    url: string;

    constructor(
      message: string,
      {
        code,
        details,
        status,
        url,
      }: {
        code: string;
        details?: unknown;
        status?: number;
        url: string;
      },
    ) {
      super(message);
      this.code = code;
      this.details = details;
      this.status = status;
      this.url = url;
    }

    getUserMessage() {
      return this.message;
    }
  },
  speakingApi: mockSpeakingApi,
}));

jest.mock('../services/speaking/speaking-recorder', () => ({
  speakingRecorder: {
    discardRecording: jest.fn(),
    getState: jest.fn(() => mockRecorderState),
    playExaminerAudio: jest.fn(),
    stopExaminerAudio: jest.fn(),
    stopPlayback: jest.fn(),
    stopRecording: jest.fn(),
    subscribeExaminerPlayback: jest.fn(() => () => undefined),
    subscribeExaminerPlaybackProgress: jest.fn(() => () => undefined),
  },
}));

import { useSpeakingStore } from '../store/speaking-store';

const createAuthExpiredError = () =>
  new (jest.requireMock('../services/api').ApiError)('Authentication expired', {
    code: 'authentication_expired',
    status: 401,
    url: '/speaking/sessions/',
  });

describe('speaking auth-expiry recovery', () => {
  const baseSession = {
    createdAt: '2026-08-30T12:00:00.000Z',
    lastExaminerAudioUrl: null,
    lastExaminerText: null,
    lastTurnNumber: 0,
    localSessionId: 'local-1',
    part1Complete: false,
    partId: 'part-1' as const,
    remoteSessionId: null,
    remoteSessionStatus: 'not-created' as const,
    status: 'draft' as const,
    updatedAt: '2026-08-30T12:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    currentLanguage = 'en';
    mockAuthState.isAuthenticated = true;
    mockAuthState.user = {
      displayName: 'Mobile User',
      email: 'mobile@example.com',
      firstName: 'Mobile',
      fullName: 'Mobile User',
      id: 1,
      identifier: 'mobile-user',
      lastName: 'User',
      username: 'mobile-user',
    };
    mockAuthState.restoreSession.mockReset();
    mockAuthState.restoreSession.mockImplementation(async () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.user = null;
      return null;
    });
    mockAuthState.logout.mockClear();
    useSpeakingStore.setState({
      clip: null,
      errorMessage: null,
      examinerAudioUrl: null,
      examinerText: null,
      isCreatingSession: false,
      isStartingSession: false,
      isUploading: false,
      partId: 'part-1',
      session: { ...baseSession },
    });
  });

  it('retries the exact same Part 1 practice intent once after auth restore succeeds', async () => {
    currentLanguage = 'es';
    mockAuthState.restoreSession.mockImplementation(async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = {
        displayName: 'Mobile User',
        email: 'mobile@example.com',
        firstName: 'Mobile',
        fullName: 'Mobile User',
        id: 1,
        identifier: 'mobile-user',
        lastName: 'User',
        username: 'mobile-user',
      };
      return {
        expiresAt: '2026-09-01T00:00:00.000Z',
        environmentName: 'production',
        token: 'fresh-token',
        user: mockAuthState.user,
      };
    });
    mockCreateSession
      .mockRejectedValueOnce(createAuthExpiredError())
      .mockResolvedValueOnce({
        session_id: 'session-2',
        session_state: 'processing',
      });
    mockStartSession.mockResolvedValue({
      conversation_state: {
        part1_complete: false,
      },
      examiner_turn: {
        audio_url: null,
        text: 'Welcome back.',
        turn: 1,
      },
      photo: null,
      session_id: 'session-2',
      session_state: 'processing',
    });

    await useSpeakingStore
      .getState()
      .startSession(undefined, 'source-session-1', { practiceMode: 'new' });

    expect(mockAuthState.restoreSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledTimes(2);
    expect(mockCreateSession).toHaveBeenNthCalledWith(
      1,
      'part-1',
      'es',
      expect.objectContaining({
        clientContext: { practice_mode: 'new' },
        sourceSessionId: 'source-session-1',
      }),
    );
    expect(mockCreateSession).toHaveBeenNthCalledWith(
      2,
      'part-1',
      'es',
      expect.objectContaining({
        clientContext: { practice_mode: 'new' },
        sourceSessionId: 'source-session-1',
      }),
    );
    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(mockStartSession).toHaveBeenCalledWith('session-2', 'part-1', undefined);
    expect(useSpeakingStore.getState().errorMessage).toBeNull();
    expect(useSpeakingStore.getState().session?.remoteSessionId).toBe('session-2');
  });

  it('retries the exact same Part 4 replay intent once after auth restore succeeds', async () => {
    currentLanguage = 'en';
    mockAuthState.restoreSession.mockImplementation(async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = {
        displayName: 'Mobile User',
        email: 'mobile@example.com',
        firstName: 'Mobile',
        fullName: 'Mobile User',
        id: 1,
        identifier: 'mobile-user',
        lastName: 'User',
        username: 'mobile-user',
      };
      return {
        expiresAt: '2026-09-01T00:00:00.000Z',
        environmentName: 'production',
        token: 'fresh-token',
        user: mockAuthState.user,
      };
    });
    mockCreateSession
      .mockRejectedValueOnce(createAuthExpiredError())
      .mockResolvedValueOnce({
        session_id: 'part4-session-2',
        session_state: 'processing',
      });
    mockStartSession.mockResolvedValue({
      conversation_state: {
        part4_complete: false,
        source_part3_session_id: 'source-part3-session',
      },
      examiner_turn: {
        audio_url: null,
        text: 'Part 4 start.',
        turn: 1,
      },
      photo: null,
      session_id: 'part4-session-2',
      session_state: 'processing',
    });
    useSpeakingStore.setState({
      partId: 'part-4',
      session: null,
    });

    await useSpeakingStore
      .getState()
      .startSession('source-part3-session', 'source-session-2');

    expect(mockAuthState.restoreSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledTimes(2);
    expect(mockCreateSession).toHaveBeenNthCalledWith(
      1,
      'part-4',
      'en',
      expect.objectContaining({
        sourceSessionId: 'source-session-2',
      }),
    );
    expect(mockCreateSession).toHaveBeenNthCalledWith(
      2,
      'part-4',
      'en',
      expect.objectContaining({
        sourceSessionId: 'source-session-2',
      }),
    );
    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(mockStartSession).toHaveBeenCalledWith('part4-session-2', 'part-4', {
      sourcePart3SessionId: 'source-part3-session',
    });
    expect(useSpeakingStore.getState().errorMessage).toBeNull();
    expect(useSpeakingStore.getState().session?.remoteSessionId).toBe('part4-session-2');
  });

  it('clears auth and session state when auth restore fails', async () => {
    mockAuthState.restoreSession.mockImplementation(async () => {
      mockAuthState.isAuthenticated = false;
      mockAuthState.user = null;
      return null;
    });
    mockCreateSession.mockRejectedValueOnce(createAuthExpiredError());

    await useSpeakingStore
      .getState()
      .startSession(undefined, 'source-session-1', { practiceMode: 'repeat' });

    expect(mockAuthState.restoreSession).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(mockAuthState.isAuthenticated).toBe(false);
    expect(mockAuthState.user).toBeNull();
    expect(useSpeakingStore.getState().session).toBeNull();
    expect(useSpeakingStore.getState().isCreatingSession).toBe(false);
    expect(useSpeakingStore.getState().isStartingSession).toBe(false);
    expect(useSpeakingStore.getState().errorMessage).toBeNull();
  });

  it('does not loop when a retry still returns authentication_expired', async () => {
    mockAuthState.restoreSession.mockImplementation(async () => {
      mockAuthState.isAuthenticated = true;
      mockAuthState.user = {
        displayName: 'Mobile User',
        email: 'mobile@example.com',
        firstName: 'Mobile',
        fullName: 'Mobile User',
        id: 1,
        identifier: 'mobile-user',
        lastName: 'User',
        username: 'mobile-user',
      };
      return {
        expiresAt: '2026-09-01T00:00:00.000Z',
        environmentName: 'production',
        token: 'fresh-token',
        user: mockAuthState.user,
      };
    });
    mockCreateSession
      .mockRejectedValueOnce(createAuthExpiredError())
      .mockRejectedValueOnce(createAuthExpiredError());

    await useSpeakingStore
      .getState()
      .startSession(undefined, 'source-session-1', { practiceMode: 'new' });

    expect(mockAuthState.restoreSession).toHaveBeenCalledTimes(1);
    expect(mockAuthState.logout).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).toHaveBeenCalledTimes(2);
    expect(useSpeakingStore.getState().session).toBeNull();
    expect(useSpeakingStore.getState().errorMessage).toBeNull();
    expect(mockAuthState.isAuthenticated).toBe(false);
  });

  it('leaves ordinary non-auth errors unchanged', async () => {
    const failure = new Error('backend said no');
    mockCreateSession.mockRejectedValueOnce(failure);

    await useSpeakingStore
      .getState()
      .startSession(undefined, 'source-session-1', { practiceMode: 'new' });

    expect(mockAuthState.restoreSession).not.toHaveBeenCalled();
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
    expect(useSpeakingStore.getState().errorMessage).toBe('backend said no');
    expect(useSpeakingStore.getState().session?.status).toBe('error');
    expect(useSpeakingStore.getState().isCreatingSession).toBe(false);
    expect(useSpeakingStore.getState().isStartingSession).toBe(false);
  });
});
