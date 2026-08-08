import { useEffect } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SpeakingIntegrationCard } from '../../components/speaking/speaking-integration-card';
import { SpeakingRecordingCard } from '../../components/speaking/speaking-recording-card';
import { SpeakingSessionCard } from '../../components/speaking/speaking-session-card';
import { AppHeader } from '../../components/ui/app-header';
import { PrimaryButton, SecondaryButton } from '../../components/ui/buttons';
import { ErrorView } from '../../components/ui/feedback-views';
import { ScreenContainer } from '../../components/ui/screen-container';
import { SectionHeader } from '../../components/ui/section-header';
import { useSpeakingTimer } from '../../hooks/use-speaking-timer';
import { useSpeakingStore } from '../../store/speaking-store';
import { SpeakingPartId } from '../../types/speaking';
import { shellStyles } from '../shared/shell-styles';

function formatCountdown(secondsRemaining: number) {
  const minutes = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function B2SpeakingPartScreen({ partId }: { partId: string }) {
  const assessment = useSpeakingStore((state) => state.assessment);
  const capability = useSpeakingStore((state) => state.capability);
  const clip = useSpeakingStore((state) => state.clip);
  const discardRecording = useSpeakingStore((state) => state.discardRecording);
  const errorMessage = useSpeakingStore((state) => state.errorMessage);
  const examinerAudioUrl = useSpeakingStore((state) => state.examinerAudioUrl);
  const examinerText = useSpeakingStore((state) => state.examinerText);
  const initializePart = useSpeakingStore((state) => state.initializePart);
  const isCreatingSession = useSpeakingStore((state) => state.isCreatingSession);
  const isEvaluating = useSpeakingStore((state) => state.isEvaluating);
  const isPlaying = useSpeakingStore((state) => state.isPlaying);
  const isRecording = useSpeakingStore((state) => state.isRecording);
  const isStartingSession = useSpeakingStore((state) => state.isStartingSession);
  const isUploading = useSpeakingStore((state) => state.isUploading);
  const partDescription = useSpeakingStore((state) => state.partDescription);
  const partTitle = useSpeakingStore((state) => state.partTitle);
  const pauseTimer = useSpeakingStore((state) => state.pauseTimer);
  const recorderStatus = useSpeakingStore((state) => state.recorderStatus);
  const requestEvaluation = useSpeakingStore((state) => state.requestEvaluation);
  const resetError = useSpeakingStore((state) => state.resetError);
  const resetTimer = useSpeakingStore((state) => state.resetTimer);
  const secondsRemaining = useSpeakingStore((state) => state.secondsRemaining);
  const session = useSpeakingStore((state) => state.session);
  const startRecording = useSpeakingStore((state) => state.startRecording);
  const startSession = useSpeakingStore((state) => state.startSession);
  const startTimer = useSpeakingStore((state) => state.startTimer);
  const stopPlayback = useSpeakingStore((state) => state.stopPlayback);
  const stopRecording = useSpeakingStore((state) => state.stopRecording);
  const timerStatus = useSpeakingStore((state) => state.timerStatus);
  const togglePlayback = useSpeakingStore((state) => state.togglePlayback);
  const uploadRecording = useSpeakingStore((state) => state.uploadRecording);

  useSpeakingTimer();

  useEffect(() => {
    initializePart((partId as SpeakingPartId) ?? 'part-1');
  }, [initializePart, partId]);

  const evaluationLabel = assessment?.status ?? 'idle';
  const clipLabel = clip ? `${clip.name} (${Math.round(clip.sizeBytes / 1024)} KB)` : null;
  const canRequestEvaluation =
    Boolean(session?.remoteSessionId) &&
    !isUploading &&
    !isEvaluating &&
    session?.status !== 'error' &&
    session?.part1Complete === true;
  const canUpload =
    Boolean(clip) && !isRecording && !isUploading && session?.part1Complete !== true;
  const isSessionLoading = isCreatingSession || isStartingSession;
  const hasRemoteSession = Boolean(session?.remoteSessionId);
  const startSessionLabel = isCreatingSession
    ? 'Creating session...'
    : isStartingSession
      ? 'Starting conversation...'
      : hasRemoteSession
        ? 'Session ready'
        : 'Start session';
  const summaryTitle =
    assessment?.status === 'complete'
      ? 'Latest evaluation result'
      : assessment?.status === 'failed'
        ? 'Latest evaluation attempt'
        : 'Latest evaluation status';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="Shared Speaking Infrastructure"
          subtitle={partDescription}
          title={partTitle}
        />

        <SectionHeader
          description="This workspace is shared across speaking routes and intentionally avoids part-specific prompt logic."
          title="Current Sprint Workspace"
        />

        <SpeakingSessionCard
          recorderStatus={recorderStatus}
          remoteSessionId={session?.remoteSessionId ?? null}
          remoteSessionStatus={session?.remoteSessionStatus ?? 'not-created'}
          status={session?.status ?? 'draft not started'}
          timeRemainingLabel={formatCountdown(secondsRemaining)}
          timerStatus={timerStatus}
        />

        {examinerText ? (
          <View style={styles.examinerCard}>
            <Text style={styles.examinerTitle}>Examiner prompt</Text>
            <Text style={styles.examinerText}>{examinerText}</Text>
            {examinerAudioUrl ? (
              <Text style={styles.examinerMeta}>TTS audio available</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            disabled={hasRemoteSession || isSessionLoading}
            label={startSessionLabel}
            onPress={startSession}
          />
          <SecondaryButton
            label={timerStatus === 'running' ? 'Pause timer' : 'Start timer'}
            onPress={timerStatus === 'running' ? pauseTimer : startTimer}
          />
          <SecondaryButton label="Reset timer" onPress={resetTimer} />
        </View>

        <SpeakingRecordingCard
          capabilityMessage={capability.recordingMessage}
          clipLabel={clipLabel}
          isPlaying={isPlaying}
          isRecording={isRecording}
          recorderStatus={recorderStatus}
          onDiscard={discardRecording}
          onStartRecording={startRecording}
          onStopPlayback={stopPlayback}
          onStopRecording={stopRecording}
          onTogglePlayback={togglePlayback}
          playbackSupported={capability.playbackSupported}
          recordingSupported={capability.recordingStatus === 'ready'}
        />

        <SpeakingIntegrationCard
          canRequestEvaluation={canRequestEvaluation}
          canUpload={canUpload}
          evaluationLabel={evaluationLabel}
          isEvaluating={isEvaluating}
          isUploading={isUploading}
          remoteSessionId={session?.remoteSessionId ?? null}
          onRequestEvaluation={requestEvaluation}
          onUploadRecording={uploadRecording}
        />

        {assessment ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{summaryTitle}</Text>
            <Text style={styles.summaryText}>Status: {assessment.status}</Text>
            <Text style={styles.summaryText}>
              Assessment ID: {assessment.assessmentId ? assessment.assessmentId : 'Not returned'}
            </Text>
            {assessment.status === 'pending' || assessment.status === 'processing' ? (
              <Text style={styles.summaryText}>
                The backend has accepted the request, but a final assessment result is not yet confirmed.
              </Text>
            ) : null}
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorGroup}>
            <ErrorView message={errorMessage} />
            <SecondaryButton label="Dismiss message" onPress={resetError} />
          </View>
        ) : null}

        <SecondaryButton label="Back to B2 Speaking" onPress={() => router.back()} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorGroup: {
    gap: 12,
  },
  examinerCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#B6E0FF',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  examinerMeta: {
    color: '#627D98',
    fontSize: 12,
  },
  examinerText: {
    color: '#334E68',
    fontSize: 16,
    lineHeight: 24,
  },
  examinerTitle: {
    color: '#035388',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  summaryText: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  summaryTitle: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
