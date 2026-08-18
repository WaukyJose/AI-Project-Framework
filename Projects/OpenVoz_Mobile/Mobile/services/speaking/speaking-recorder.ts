import { Platform } from 'react-native';
import {
  AudioModule,
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import type { AudioRecorder, AudioPlayer, RecordingOptions } from 'expo-audio';

import {
  SpeakingAudioClip,
  SpeakingCapabilityState,
  SpeakingRecorderState,
} from '../../types/speaking';

// ---------------------------------------------------------------------------
// Web-only browser types (not available on native)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function mimeTypeFromUri(uri: string): string {
  if (uri.endsWith('.m4a')) return 'audio/m4a';
  if (uri.endsWith('.mp3')) return 'audio/mpeg';
  if (uri.endsWith('.wav')) return 'audio/wav';
  if (uri.endsWith('.3gp')) return 'audio/3gpp';
  return 'audio/m4a';
}

function fileNameFromUri(uri: string, suffix: string): string {
  const ext = uri.split('.').pop() || 'm4a';
  return `openvoz-speaking-${suffix}.${ext}`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class SpeakingRecorderService {
  // ---- shared state ----
  private currentClip: SpeakingAudioClip | null = null;
  private lifecycleStatus: SpeakingRecorderState['lifecycleStatus'] = 'idle';
  private recordingStartedAt: number | null = null;

  // ---- web-only state ----
  private mediaRecorder: MediaRecorder | null = null;
  private playbackAudio: BrowserAudio | null = null;
  private stream: MediaStream | null = null;

  // ---- native-only state ----
  private nativeRecorder: AudioRecorder | null = null;
  private nativePlayer: AudioPlayer | null = null;
  private examinerPlayer: AudioPlayer | null = null;
  private audioSessionConfigured = false;

  // =====================================================================
  // Public contract
  // =====================================================================

  getCapability(): SpeakingCapabilityState {
    if (Platform.OS === 'web') {
      return this.getWebCapability();
    }

    return this.getNativeCapability();
  }

  getState(): SpeakingRecorderState {
    return {
      capability: this.getCapability(),
      clip: this.currentClip,
      lifecycleStatus: this.lifecycleStatus,
    };
  }

  async startRecording(): Promise<SpeakingCapabilityState> {
    if (Platform.OS === 'web') {
      return this.startWebRecording();
    }

    return this.startNativeRecording();
  }

  async stopRecording(): Promise<SpeakingAudioClip | null> {
    if (Platform.OS === 'web') {
      return this.stopWebRecording();
    }

    return this.stopNativeRecording();
  }

  async togglePlayback(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return this.toggleWebPlayback();
    }

    return this.toggleNativePlayback();
  }

  stopPlayback(): void {
    if (Platform.OS === 'web') {
      this.stopWebPlayback();
      return;
    }

    this.stopNativePlayback();
  }

  discardRecording(): void {
    this.stopPlayback();
    this.releaseCurrentClip();
    this.recordingStartedAt = null;

    // Also release examiner player on full discard
    if (Platform.OS !== 'web') {
      this.examinerPlayer?.remove();
      this.examinerPlayer = null;
    }

    if (Platform.OS === 'web') {
      this.mediaRecorder = null;
      this.stopWebStream();
    } else {
      this.nativeRecorder = null;
      this.removeNativePlayer();
    }

    this.lifecycleStatus = 'idle';
  }

  // =====================================================================
  // Web implementation (preserved from the original MediaRecorder logic)
  // =====================================================================

  private getWebCapability(): SpeakingCapabilityState {
    const browser = getBrowserGlobals();

    if (!browser.navigator?.mediaDevices?.getUserMedia || !browser.MediaRecorder) {
      return {
        playbackSupported: false,
        recordingMessage:
          'Recording requires an approved audio implementation. The current app can record in supported browsers and reports unsupported capability elsewhere.',
        recordingStatus: 'unsupported',
      };
    }

    return {
      playbackSupported: typeof browser.Audio !== 'undefined',
      recordingMessage: 'Recording is available in this browser.',
      recordingStatus: 'ready',
    };
  }

  private async startWebRecording(): Promise<SpeakingCapabilityState> {
    const capability = this.getWebCapability();

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

  private async stopWebRecording(): Promise<SpeakingAudioClip | null> {
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
        this.stopWebStream();
        resolve(this.currentClip);
      };

      recorder.stop();
    });

    return clip;
  }

  private async toggleWebPlayback(): Promise<boolean> {
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

  private stopWebPlayback(): void {
    this.playbackAudio?.pause();
    this.lifecycleStatus = this.currentClip ? 'recorded' : 'idle';
  }

  private stopWebStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  // =====================================================================
  // Native implementation (expo-audio)
  // =====================================================================

  private getNativeCapability(): SpeakingCapabilityState {
    return {
      playbackSupported: true,
      recordingMessage: 'Native recording is available on this device.',
      recordingStatus: 'ready',
    };
  }

  private async startNativeRecording(): Promise<SpeakingCapabilityState> {
    // 1. Configure iOS audio session for recording (once per service lifetime)
    if (!this.audioSessionConfigured) {
      try {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        this.audioSessionConfigured = true;
      } catch (error) {
        this.lifecycleStatus = 'error';
        throw new Error(
          error instanceof Error
            ? `Failed to configure audio session: ${error.message}`
            : 'Failed to configure audio session for recording.'
        );
      }
    }

    // 2. Check / request microphone permission
    const { granted } = await requestRecordingPermissionsAsync();

    if (!granted) {
      this.lifecycleStatus = 'error';
      throw new Error(
        'Microphone permission was denied. Enable it in your device settings to record speaking responses.'
      );
    }

    // 3. Prevent duplicate starts
    if (this.nativeRecorder?.isRecording) {
      this.lifecycleStatus = 'error';
      throw new Error('A recording is already in progress.');
    }

    // 4. Prevent recording while playback is active
    if (this.nativePlayer?.playing) {
      this.lifecycleStatus = 'error';
      throw new Error('Cannot start recording while playback is active.');
    }

    // 5. Clean up previous clip and players
    this.releaseCurrentClip();
    this.removeNativePlayer();
    this.stopExaminerAudio();

    // 6. Prepare and start
    this.lifecycleStatus = 'preparing';

    // On Android, RecordingPresets nests outputFormat/audioEncoder inside an
    // "android" sub-object, and on iOS the same fields are nested inside an
    // "ios" sub-object.  The native AudioRecorder constructor reads everything
    // at the top level.  Expo's useAudioRecorder hook flattens these
    // internally via createRecordingOptions; the direct constructor does not.
    const recordingOptions =
      Platform.OS === 'android'
        ? ({
            extension: RecordingPresets.HIGH_QUALITY.extension,
            sampleRate: RecordingPresets.HIGH_QUALITY.sampleRate,
            numberOfChannels: RecordingPresets.HIGH_QUALITY.numberOfChannels,
            bitRate: RecordingPresets.HIGH_QUALITY.bitRate,
            outputFormat: RecordingPresets.HIGH_QUALITY.android.outputFormat,
            audioEncoder: RecordingPresets.HIGH_QUALITY.android.audioEncoder,
          } as Partial<RecordingOptions>)
        : ({
            extension: RecordingPresets.HIGH_QUALITY.extension,
            sampleRate: RecordingPresets.HIGH_QUALITY.sampleRate,
            numberOfChannels: RecordingPresets.HIGH_QUALITY.numberOfChannels,
            bitRate: RecordingPresets.HIGH_QUALITY.bitRate,
            outputFormat: RecordingPresets.HIGH_QUALITY.ios.outputFormat,
            audioQuality: RecordingPresets.HIGH_QUALITY.ios.audioQuality,
            linearPCMBitDepth: RecordingPresets.HIGH_QUALITY.ios.linearPCMBitDepth,
            linearPCMIsBigEndian: RecordingPresets.HIGH_QUALITY.ios.linearPCMIsBigEndian,
            linearPCMIsFloat: RecordingPresets.HIGH_QUALITY.ios.linearPCMIsFloat,
          } as Partial<RecordingOptions>);

    // eslint-disable-next-line import/namespace -- AudioRecorder is a runtime native-module property
    const recorder = new AudioModule.AudioRecorder(recordingOptions);

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();

      if (!recorder.isRecording) {
        throw new Error("Native recording failed to start.");
      }
    } catch (error) {
      this.lifecycleStatus = 'error';
      throw new Error(
        error instanceof Error
          ? `Failed to start recording: ${error.message}`
          : 'Failed to start recording.'
      );
    }

    this.nativeRecorder = recorder;
    this.recordingStartedAt = Date.now();
    this.lifecycleStatus = 'recording';

    return {
      playbackSupported: true,
      recordingMessage: 'Recording in progress.',
      recordingStatus: 'ready',
    };
  }

  private async stopNativeRecording(): Promise<SpeakingAudioClip | null> {
    const recorder = this.nativeRecorder;

    if (!recorder) {
      return this.currentClip;
    }

    const status = recorder.getStatus();
    const durationMs =
      status.isRecording && status.durationMillis > 0
        ? status.durationMillis
        : this.recordingStartedAt
          ? Date.now() - this.recordingStartedAt
          : null;

    this.nativeRecorder = null;

    try {
      await recorder.stop();
    } catch (error) {
      this.lifecycleStatus = 'error';
      throw new Error(
        error instanceof Error
          ? `Failed to stop recording: ${error.message}`
          : 'Failed to stop recording.'
      );
    }

    const uri = recorder.uri;

    if (!uri) {
      this.lifecycleStatus = 'error';
      throw new Error('Recording finished but no audio file was produced.');
    }

    this.currentClip = {
      durationMs,
      id: `clip-${Date.now()}`,
      mimeType: mimeTypeFromUri(uri),
      name: fileNameFromUri(uri, String(Date.now())),
      objectUrl: uri,
      sizeBytes: 0,
    };

    this.recordingStartedAt = null;
    this.lifecycleStatus = 'recorded';

    return this.currentClip;
  }

  private async toggleNativePlayback(): Promise<boolean> {
    if (!this.currentClip?.objectUrl) {
      this.lifecycleStatus = 'error';
      throw new Error('No recording is available for playback.');
    }

    // Prevent playback while recording
    if (this.nativeRecorder?.isRecording) {
      this.lifecycleStatus = 'error';
      throw new Error('Cannot play audio while recording is in progress.');
    }

    // If we already have a player, toggle play/pause
    if (this.nativePlayer) {
      if (this.nativePlayer.playing) {
        this.nativePlayer.pause();
        this.lifecycleStatus = 'recorded';
        return false;
      }

      // Replace source and play
      this.nativePlayer.replace({ uri: this.currentClip.objectUrl });
      this.nativePlayer.play();
      this.lifecycleStatus = 'playing';
      return true;
    }

    // Create and play a new player
    try {
      const player = createAudioPlayer({ uri: this.currentClip.objectUrl });
      player.play();
      this.nativePlayer = player;
      this.lifecycleStatus = 'playing';
      return true;
    } catch (error) {
      this.lifecycleStatus = 'error';
      throw new Error(
        error instanceof Error
          ? `Failed to play recording: ${error.message}`
          : 'Failed to play recording.'
      );
    }
  }

  private stopNativePlayback(): void {
    if (this.nativePlayer) {
      this.nativePlayer.pause();
    }

    this.lifecycleStatus = this.currentClip ? 'recorded' : 'idle';
  }

  private removeNativePlayer(): void {
    const player = this.nativePlayer;
    this.nativePlayer = null;

    if (player) {
      player.remove();
    }
  }

  // =====================================================================
  // Shared helpers
  // =====================================================================

  private releaseCurrentClip(): void {
    if (Platform.OS === 'web' && this.currentClip?.objectUrl) {
      URL.revokeObjectURL(this.currentClip.objectUrl);
    }

    this.currentClip = null;
  }

  // =====================================================================
  // Examiner TTS playback (persistent reference — must survive JS GC)
  // =====================================================================

  playExaminerAudio(uri: string): void {
    if (Platform.OS === 'web') {
      return;
    }

    // Stop and release any previous examiner player
    this.examinerPlayer?.remove();
    this.examinerPlayer = null;

    // Create, store, and play — reference is retained so iOS GC won't
    // trigger sharedObjectWillRelease → teardownPlayer → pause
    const player = createAudioPlayer(
      { uri },
      { keepAudioSessionActive: true }
    );
    this.examinerPlayer = player;
    player.play();
  }

  stopExaminerAudio(): void {
    if (Platform.OS === 'web') {
      return;
    }

    this.examinerPlayer?.pause();
    this.examinerPlayer?.remove();
    this.examinerPlayer = null;
  }
}

export const speakingRecorder = new SpeakingRecorderService();
