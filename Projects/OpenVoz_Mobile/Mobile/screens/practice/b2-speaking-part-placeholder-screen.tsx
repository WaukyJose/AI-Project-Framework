import { useEffect } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AssessmentResultsCard } from '../../components/speaking/assessment-results-card';
import { ExaminerTurnBubble } from '../../components/speaking/examiner-turn-bubble';
import { SpeakingAnswerArea } from '../../components/speaking/speaking-answer-area';
import { SpeakingSessionCard } from '../../components/speaking/speaking-session-card';
import { AppHeader } from '../../components/ui/app-header';
import { PrimaryButton, SecondaryButton } from '../../components/ui/buttons';
import { ErrorView } from '../../components/ui/feedback-views';
import { ScreenContainer } from '../../components/ui/screen-container';
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
  const partTitle = useSpeakingStore((state) => state.partTitle);
  const pauseTimer = useSpeakingStore((state) => state.pauseTimer);
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader eyebrow="B2 First Speaking" subtitle="Interview" title={partTitle} />

        <Text style={styles.supportingCopy}>
          Answer a few questions about yourself and everyday life.
        </Text>

        <SpeakingSessionCard
          timeRemainingLabel={formatCountdown(secondsRemaining)}
          timerStatus={timerStatus}
        />

        {examinerText ? (
          <ExaminerTurnBubble examinerAudioUrl={examinerAudioUrl} examinerText={examinerText} />
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

        <SpeakingAnswerArea
          canRequestEvaluation={canRequestEvaluation}
          canUpload={canUpload}
          hasClip={Boolean(clip)}
          isEvaluating={isEvaluating}
          isPlaying={isPlaying}
          isRecording={isRecording}
          isUploading={isUploading}
          playbackSupported={capability.playbackSupported}
          recordingSupported={capability.recordingStatus === 'ready'}
          onDiscard={discardRecording}
          onRequestEvaluation={requestEvaluation}
          onStartRecording={startRecording}
          onStopPlayback={stopPlayback}
          onStopRecording={stopRecording}
          onTogglePlayback={togglePlayback}
          onUpload={uploadRecording}
        />

        {assessment ? <AssessmentResultsCard assessment={assessment} /> : null}

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
  supportingCopy: {
    color: '#52606D',
    fontSize: 15,
    lineHeight: 22,
  },
});
