/**
 * @jest-environment node
 */

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

const mockSubmitTurn = jest.fn();
const mockCompleteSession = jest.fn();

const mockSpeakingApi = {
  completeSession: mockCompleteSession,
  getAssessment: jest.fn(),
  submitTurn: mockSubmitTurn,
};

const mockRecorderState = {
  capability: {
    playbackSupported: true,
    recordingMessage: 'Recording is available in this browser.',
    recordingStatus: 'ready',
  },
  lifecycleStatus: 'recorded' as const,
};

const mockStopRecording = jest.fn();
const mockDiscardRecording = jest.fn();
const mockStopPlayback = jest.fn();
const mockStopExaminerAudio = jest.fn();
const mockPlayExaminerAudio = jest.fn();
const mockSubscribeExaminerPlayback = jest.fn(() => () => undefined);
const mockSubscribeExaminerPlaybackProgress = jest.fn(() => () => undefined);

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
    discardRecording: mockDiscardRecording,
    getState: jest.fn(() => mockRecorderState),
    playExaminerAudio: mockPlayExaminerAudio,
    stopExaminerAudio: mockStopExaminerAudio,
    stopPlayback: mockStopPlayback,
    stopRecording: mockStopRecording,
    subscribeExaminerPlayback: mockSubscribeExaminerPlayback,
    subscribeExaminerPlaybackProgress: mockSubscribeExaminerPlaybackProgress,
  },
}));

import { useSpeakingStore } from '../store/speaking-store';

describe('speaking performance logging', () => {
  const baseSession = {
    createdAt: '2026-08-30T12:00:00.000Z',
    lastExaminerAudioUrl: null,
    lastExaminerText: null,
    lastTurnNumber: 0,
    localSessionId: 'local-1',
    part1Complete: false,
    partId: 'part-1' as const,
    remoteSessionId: 'session-1',
    remoteSessionStatus: 'ready',
    status: 'ready' as const,
    updatedAt: '2026-08-30T12:00:00.000Z',
  };

  const clip = {
    durationMs: 4200,
    id: 'clip-1',
    mimeType: 'audio/m4a',
    name: 'openvoz-speaking-1.m4a',
    objectUrl: 'file:///tmp/openvoz-speaking-1.m4a',
    sizeBytes: 1234,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useSpeakingStore.setState({
      clip: null,
      isRecording: false,
      isUploading: false,
      partId: 'part-1',
      session: { ...baseSession },
    });
    mockStopRecording.mockResolvedValue(clip);
    mockSubmitTurn.mockResolvedValue({
      candidate_turn: { transcript: 'Hello there', turn: 1 },
      conversation_state: {
        conversation_started: true,
        current_question: '',
        follow_up_asked: false,
        part1_complete: false,
      },
      examiner_turn: {
        audio_url: null,
        text: 'Thanks.',
        turn: 2,
      },
      part: 'part-1',
      session_id: 'session-1',
      session_state: 'processing',
      transcript_delta: [],
      turn_status: 'uploaded',
    });
  });

  it('logs the stop-to-upload span and upload latency without user content', async () => {
    const nowSpy = jest
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 1000)
      .mockImplementationOnce(() => 1600)
      .mockImplementationOnce(() => 2100);

    await useSpeakingStore.getState().stopRecording();
    await useSpeakingStore.getState().uploadRecording();

    const performanceLogs = mockLogger.info.mock.calls.filter(
      ([event]) => event === 'speaking.performance',
    );

    expect(performanceLogs).toHaveLength(3);
    expect(performanceLogs[0][1]).toEqual(
      expect.objectContaining({
        event: 'recording_stopped',
        recordingStoppedAt: 1000,
      }),
    );
    expect(performanceLogs[1][1]).toEqual(
      expect.objectContaining({
        event: 'upload_started',
        recordingStoppedAt: 1000,
        stopToUploadStartMs: 600,
        uploadStartedAt: 1600,
      }),
    );
    expect(performanceLogs[2][1]).toEqual(
      expect.objectContaining({
        event: 'upload_completed',
        recordingStoppedAt: 1000,
        stopToUploadStartMs: 600,
        uploadCompletedAt: 2100,
        uploadLatencyMs: 500,
      }),
    );

    const serializedLogs = JSON.stringify(performanceLogs);
    expect(serializedLogs).not.toContain('Hello there');
    expect(serializedLogs).not.toContain('Thanks.');

    nowSpy.mockRestore();
  });
});
