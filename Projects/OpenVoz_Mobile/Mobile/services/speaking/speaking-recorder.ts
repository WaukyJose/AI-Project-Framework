import { Platform } from 'react-native';

import {
  SpeakingAudioClip,
  SpeakingCapabilityState,
  SpeakingRecorderState,
} from '../../types/speaking';

const DEFAULT_CAPABILITY: SpeakingCapabilityState = {
  playbackSupported: false,
  recordingMessage:
    'Recording requires an approved audio implementation. The current app can record in supported browsers and reports unsupported capability elsewhere.',
  recordingStatus: 'unsupported',
};

type BrowserMediaDevices = {
  getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
};

type BrowserAudio = {
  pause: () => void;
  play: () => Promise<void>;
  src: string;
};

type BrowserGlobals = typeof globalThis & {
  Audio?: new (src?: string) => BrowserAudio;
  MediaRecorder?: typeof MediaRecorder;
  navigator?: { mediaDevices?: BrowserMediaDevices };
};

function getBrowserGlobals(): BrowserGlobals {
  return globalThis as BrowserGlobals;
}

function getSupportedMimeType() {
  const browser = getBrowserGlobals();

  if (typeof browser.MediaRecorder === 'undefined') {
    return null;
  }

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  const withSupport = browser.MediaRecorder as BrowserGlobals['MediaRecorder'] & {
    isTypeSupported?: (mimeType: string) => boolean;
  };

  for (const mimeType of candidates) {
    if (!withSupport.isTypeSupported || withSupport.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return 'audio/webm';
}

class SpeakingRecorderService {
  private currentClip: SpeakingAudioClip | null = null;
  private lifecycleStatus: SpeakingRecorderState['lifecycleStatus'] = 'idle';
  private mediaRecorder: MediaRecorder | null = null;
  private playbackAudio: BrowserAudio | null = null;
  private recordingStartedAt: number | null = null;
  private stream: MediaStream | null = null;

  getCapability(): SpeakingCapabilityState {
    const browser = getBrowserGlobals();

    if (Platform.OS !== 'web') {
      return DEFAULT_CAPABILITY;
    }

    if (!browser.navigator?.mediaDevices?.getUserMedia || !browser.MediaRecorder) {
      return DEFAULT_CAPABILITY;
    }

    return {
      playbackSupported: typeof browser.Audio !== 'undefined',
      recordingMessage:
        'Recording is available in this browser. Native mobile recording still requires an approved audio package.',
      recordingStatus: 'ready',
    };
  }

  getState(): SpeakingRecorderState {
    return {
      capability: this.getCapability(),
      clip: this.currentClip,
      lifecycleStatus: this.lifecycleStatus,
    };
  }

  async startRecording() {
    const capability = this.getCapability();

    if (capability.recordingStatus !== 'ready') {
      this.lifecycleStatus = 'error';
      throw new Error(capability.recordingMessage);
    }

    this.lifecycleStatus = 'preparing';
    this.releaseCurrentClip();
    const browser = getBrowserGlobals();
    const stream = await browser.navigator!.mediaDevices!.getUserMedia({ audio: true });
    const mimeType = getSupportedMimeType() ?? 'audio/webm';
    const recorder = new browser.MediaRecorder!(stream, { mimeType });

    this.stream = stream;
    this.mediaRecorder = recorder;
    this.recordingStartedAt = Date.now();
    this.lifecycleStatus = 'ready';

    recorder.start();
    this.lifecycleStatus = 'recording';

    return capability;
  }

  async stopRecording() {
    const recorder = this.mediaRecorder;

    if (!recorder || recorder.state !== 'recording') {
      return this.currentClip;
    }

    const clip = await new Promise<SpeakingAudioClip>((resolve, reject) => {
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        this.lifecycleStatus = 'error';
        reject(event.error ?? new Error('Recording failed'));
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: chunks[0]?.type || 'audio/webm',
        });
        const objectUrl = URL.createObjectURL(blob);
        const durationMs = this.recordingStartedAt ? Date.now() - this.recordingStartedAt : null;

        this.currentClip = {
          durationMs,
          id: `clip-${Date.now()}`,
          mimeType: blob.type || 'audio/webm',
          name: `openvoz-speaking-${Date.now()}.webm`,
          objectUrl,
          sizeBytes: blob.size,
        };

        this.recordingStartedAt = null;
        this.mediaRecorder = null;
        this.lifecycleStatus = 'recorded';
        this.stopStream();
        resolve(this.currentClip);
      };

      recorder.stop();
    });

    return clip;
  }

  async togglePlayback() {
    if (!this.currentClip?.objectUrl) {
      this.lifecycleStatus = 'error';
      throw new Error('No recording is available for playback.');
    }

    const browser = getBrowserGlobals();

    if (!browser.Audio) {
      this.lifecycleStatus = 'error';
      throw new Error('Playback is not available on this platform.');
    }

    if (!this.playbackAudio || this.playbackAudio.src !== this.currentClip.objectUrl) {
      this.playbackAudio = new browser.Audio(this.currentClip.objectUrl);
    }

    try {
      await this.playbackAudio.play();
      this.lifecycleStatus = 'playing';
      return true;
    } catch {
      this.playbackAudio.pause();
      this.lifecycleStatus = 'recorded';
      return false;
    }
  }

  stopPlayback() {
    this.playbackAudio?.pause();
    this.lifecycleStatus = this.currentClip ? 'recorded' : 'idle';
  }

  discardRecording() {
    this.stopPlayback();
    this.releaseCurrentClip();
    this.recordingStartedAt = null;
    this.mediaRecorder = null;
    this.lifecycleStatus = 'idle';
    this.stopStream();
  }

  private releaseCurrentClip() {
    if (this.currentClip?.objectUrl) {
      URL.revokeObjectURL(this.currentClip.objectUrl);
    }

    this.currentClip = null;
  }

  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}

export const speakingRecorder = new SpeakingRecorderService();
