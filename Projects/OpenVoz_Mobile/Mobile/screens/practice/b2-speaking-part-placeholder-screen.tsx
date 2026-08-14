import { useEffect } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AssessmentResultsCard } from '../../components/speaking/assessment-results-card';
import { ExaminerTurnBubble } from '../../components/speaking/examiner-turn-bubble';
import { Part2PhotoPrompt } from '../../components/speaking/part2-photo-prompt';
import { SpeakingAnswerArea } from '../../components/speaking/speaking-answer-area';
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

export function B2SpeakingPartScreen({
  partId,
  sourcePart3SessionId,
}: {
  partId: string;
  sourcePart3SessionId?: string;
}) {
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
  const part2Complete = useSpeakingStore((state) => state.part2Complete);
  const part2Phase = useSpeakingStore((state) => state.part2Phase);
  const part2Photo = useSpeakingStore((state) => state.part2Photo);
  const part3Complete = useSpeakingStore((state) => state.part3Complete);
  const part3Phase = useSpeakingStore((state) => state.part3Phase);
  const part3Scenario = useSpeakingStore((state) => state.part3Scenario);
  const part4Complete = useSpeakingStore((state) => state.part4Complete);
  const part4Phase = useSpeakingStore((state) => state.part4Phase);
  const partTitle = useSpeakingStore((state) => state.partTitle);
  const requestEvaluation = useSpeakingStore((state) => state.requestEvaluation);
  const resetError = useSpeakingStore((state) => state.resetError);
  const secondsRemaining = useSpeakingStore((state) => state.secondsRemaining);
  const session = useSpeakingStore((state) => state.session);
  const startRecording = useSpeakingStore((state) => state.startRecording);
  const startSession = useSpeakingStore((state) => state.startSession);
  const stopPlayback = useSpeakingStore((state) => state.stopPlayback);
  const stopRecording = useSpeakingStore((state) => state.stopRecording);
  const timerStatus = useSpeakingStore((state) => state.timerStatus);
  const togglePlayback = useSpeakingStore((state) => state.togglePlayback);
  const uploadRecording = useSpeakingStore((state) => state.uploadRecording);

  useSpeakingTimer();

  useEffect(() => {
    initializePart((partId as SpeakingPartId) ?? 'part-1');
  }, [initializePart, partId]);

  const isPart1 = (partId as SpeakingPartId) === 'part-1';
  const isPart2 = (partId as SpeakingPartId) === 'part-2';
  const isPart3 = (partId as SpeakingPartId) === 'part-3';
  const isPart4 = (partId as SpeakingPartId) === 'part-4';
  const isFollowUpPhase = isPart2 && part2Phase === 'follow_up';
  const isPart2Complete = isPart2 && part2Complete && part2Phase === 'complete';
  const isPart3Complete = isPart3 && part3Complete && part3Phase === 'complete';
  const isPart3Decision = isPart3 && part3Phase === 'decision';
  const isPart4Complete = isPart4 && part4Complete && part4Phase === 'complete';
  const canStartPart4 = isPart4 && Boolean(sourcePart3SessionId);
  const hasStartedTask = Boolean(session?.remoteSessionId);
  const isTaskLoading = !hasStartedTask && (isCreatingSession || isStartingSession);

  const canRequestEvaluation =
    Boolean(session?.remoteSessionId) &&
    !isPart4 &&
    !isUploading &&
    !isEvaluating &&
    session?.status !== 'error' &&
    (isPart3
      ? isPart3Complete
      : isPart2
        ? isPart2Complete
        : session?.part1Complete === true);
  const canUpload =
    Boolean(clip) &&
    !isRecording &&
    !isUploading &&
    session?.part1Complete !== true &&
    !isPart3Complete &&
    !isPart4Complete;

  const supportingCopy = isPart2
    ? 'Compare the photographs and answer the task before responding briefly to one follow-up question.'
    : isPart3
      ? 'Discuss the scenario with the examiner, then answer a final decision-making question.'
      : isPart4
        ? "Answer the examiner's questions about the topic from Part 3. Give reasons and examples to develop your answers."
        : 'Answer a few questions about yourself and everyday life.';
  const readyTitle = isPart2
    ? 'Compare two photographs and answer the question.'
    : isPart3
      ? 'Read the scenario and prepare your response.'
      : isPart4
        ? 'Further discussion'
        : 'Answer a few questions about yourself and everyday life.';
  const readyText = isPart2
    ? "You'll speak for about one minute, then answer one short follow-up."
    : isPart3
      ? "You'll discuss a scenario with a scripted partner, then answer a final decision-making question."
      : isPart4
        ? 'Answer each question when you are ready.'
        : 'Start Part 1 when you are ready to hear the examiner’s first question.';
  const startLabel = isTaskLoading
    ? isPart2
      ? 'Starting Part 2…'
      : isPart3
        ? 'Starting Part 3…'
        : isPart4
          ? 'Starting Part 4…'
          : 'Starting Part 1…'
    : isPart2
      ? 'Start Part 2'
      : isPart3
        ? 'Start Part 3'
        : isPart4
          ? 'Start Part 4'
          : 'Start Part 1';

  const showPhoto =
    (isPart2 && hasStartedTask && part2Photo !== null) ||
    (isPart3 && hasStartedTask && part3Scenario !== null);
  const shouldShowTimerGuide = isPart2 && hasStartedTask && !isPart2Complete;
  const timerStatusLabel = isRecording
    ? 'Recording'
    : timerStatus === 'completed'
      ? 'Time complete'
      : timerStatus === 'paused'
        ? 'Paused'
        : 'Ready';
  const transitionMessage = isFollowUpPhase
    ? "Candidate A's long turn is finished. Now answer the examiner's question briefly."
    : null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          eyebrow="B2 First Speaking"
          subtitle={
            isPart2
              ? 'Long turn'
              : isPart3
                ? 'Collaborative task'
                : isPart4
                  ? 'Further discussion'
                  : 'Interview'
          }
          title={partTitle}
        />

        <Text style={styles.supportingCopy}>{supportingCopy}</Text>

        {!hasStartedTask && (isPart1 || isPart2 || isPart3) ? (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>{readyTitle}</Text>
            <Text style={styles.readyText}>{readyText}</Text>
            <PrimaryButton
              disabled={isCreatingSession || isStartingSession}
              label={startLabel}
              onPress={startSession}
            />
          </View>
        ) : null}

        {!hasStartedTask && canStartPart4 ? (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>{readyTitle}</Text>
            <Text style={styles.readyText}>{readyText}</Text>
            <PrimaryButton
              disabled={isCreatingSession || isStartingSession}
              label={startLabel}
              onPress={() => startSession(sourcePart3SessionId)}
            />
          </View>
        ) : null}

        {isPart4 && !hasStartedTask && !sourcePart3SessionId ? (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>Complete Part 3 first</Text>
            <Text style={styles.readyText}>
              Part 4 continues the topic from a completed Part 3 session.
            </Text>
          </View>
        ) : null}

        {hasStartedTask && examinerText ? (
          <ExaminerTurnBubble examinerAudioUrl={examinerAudioUrl} examinerText={examinerText} />
        ) : null}

        {transitionMessage ? (
          <View style={styles.transitionBanner}>
            <Text style={styles.transitionTitle}>Short follow-up</Text>
            <Text style={styles.transitionText}>{transitionMessage}</Text>
          </View>
        ) : null}

        {isPart3Decision ? (
          <View style={styles.transitionBanner}>
            <Text style={styles.transitionTitle}>Decision phase</Text>
            <Text style={styles.transitionText}>
              Answer the examiner’s final decision-making question.
            </Text>
          </View>
        ) : null}

        {isPart2 && isTaskLoading ? (
          <View style={styles.taskLoadingBanner}>
            <Text style={styles.taskLoadingTitle}>Loading Part 2 task</Text>
            <Text style={styles.taskLoadingText}>
              Your photographs and task will appear in a moment.
            </Text>
          </View>
        ) : null}

        {showPhoto ? (
          <Part2PhotoPrompt
            followUpMode={isFollowUpPhase}
            photo={isPart2 ? part2Photo : part3Scenario}
            scaleToFitWidth={isPart3}
          />
        ) : null}

        {isPart2Complete ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>Part 2 complete</Text>
            <Text style={styles.completionSubtitle}>
              You have completed the long turn and follow-up.
            </Text>
          </View>
        ) : null}

        {isPart3Complete ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>Part 3 complete</Text>
            <Text style={styles.completionSubtitle}>
              You have completed the discussion and decision phase.
            </Text>
            {canRequestEvaluation ? (
              <SecondaryButton
                disabled={isEvaluating}
                label={isEvaluating ? 'Requesting feedback…' : 'View Part 3 feedback'}
                onPress={requestEvaluation}
              />
            ) : null}
            {session?.remoteSessionId ? (
              <PrimaryButton
                label="Continue to Part 4"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/practice/[part]',
                    params: {
                      part: 'part-4',
                      source_part3_session_id: session.remoteSessionId,
                    },
                  })
                }
              />
            ) : null}
          </View>
        ) : null}

        {isPart4Complete ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>Part 4 complete</Text>
          </View>
        ) : null}

        {hasStartedTask && !isPart3Complete && !isPart4Complete ? (
          <SpeakingAnswerArea
            canRequestEvaluation={canRequestEvaluation}
            canUpload={canUpload}
            hasCompletedPart={isPart2Complete || isPart3Complete || isPart4Complete}
            hasClip={Boolean(clip)}
            isFollowUpPhase={isFollowUpPhase}
            isEvaluating={isEvaluating}
            isPlaying={isPlaying}
            isRecording={isRecording}
            isUploading={isUploading}
            playbackSupported={capability.playbackSupported}
            recordingSupported={capability.recordingStatus === 'ready'}
            timerDisplay={shouldShowTimerGuide ? formatCountdown(secondsRemaining) : null}
            timerStatusLabel={shouldShowTimerGuide ? timerStatusLabel : null}
            onDiscard={discardRecording}
            onRequestEvaluation={requestEvaluation}
            onStartRecording={startRecording}
            onStopPlayback={stopPlayback}
            onStopRecording={stopRecording}
            onTogglePlayback={togglePlayback}
            onUpload={uploadRecording}
          />
        ) : null}

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
  completionBanner: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 20,
  },
  completionSubtitle: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
  },
  completionTitle: {
    color: '#14532D',
    fontSize: 18,
    fontWeight: '700',
  },
  errorGroup: {
    gap: 12,
  },
  readyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  readyText: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  readyTitle: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  supportingCopy: {
    color: '#52606D',
    fontSize: 15,
    lineHeight: 22,
  },
  taskLoadingBanner: {
    backgroundColor: '#F8FBFD',
    borderColor: '#D9E2EC',
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  taskLoadingText: {
    color: '#486581',
    fontSize: 14,
    lineHeight: 20,
  },
  taskLoadingTitle: {
    color: '#102A43',
    fontSize: 16,
    fontWeight: '700',
  },
  transitionBanner: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  transitionText: {
    color: '#9A3412',
    fontSize: 14,
    lineHeight: 20,
  },
  transitionTitle: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: '700',
  },
});
