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
import { languageIdentities } from '../../constants/language-identity';

function formatCountdown(secondsRemaining: number) {
  const minutes = Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

type PartKey = 'part-1' | 'part-2' | 'part-3' | 'part-4';

const content = {
  en: {
    eyebrow: 'B2 First Speaking',
    partTitles: {
      'part-1': 'Part 1',
      'part-2': 'Part 2',
      'part-3': 'Part 3',
      'part-4': 'Part 4',
    },
    subtitles: {
      'part-1': 'Interview',
      'part-2': 'Long turn',
      'part-3': 'Collaborative task',
      'part-4': 'Further discussion',
    },
    supportingCopy: {
      'part-1': 'Answer a few questions about yourself and everyday life.',
      'part-2':
        'Compare the photographs and answer the task before responding briefly to one follow-up question.',
      'part-3':
        'Discuss the scenario with the examiner, then answer a final decision-making question.',
      'part-4':
        "Answer the examiner's questions about the topic from Part 3. Give reasons and examples to develop your answers.",
    },
    readyTitle: {
      'part-1': 'Answer a few questions about yourself and everyday life.',
      'part-2': 'Compare two photographs and answer the question.',
      'part-3': 'Read the scenario and prepare your response.',
      'part-4': 'Further discussion',
    },
    readyText: {
      'part-1': 'Start Part 1 when you are ready to hear the examiner’s first question.',
      'part-2': "You'll speak for about one minute, then answer one short follow-up.",
      'part-3':
        "You'll discuss a scenario with a scripted partner, then answer a final decision-making question.",
      'part-4': 'Answer each question when you are ready.',
    },
    startLabel: {
      'part-1': 'Start Part 1',
      'part-2': 'Start Part 2',
      'part-3': 'Start Part 3',
      'part-4': 'Start Part 4',
    },
    startingLabel: {
      'part-1': 'Starting Part 1…',
      'part-2': 'Starting Part 2…',
      'part-3': 'Starting Part 3…',
      'part-4': 'Starting Part 4…',
    },
    status: {
      recording: 'Recording',
      timeComplete: 'Time complete',
      paused: 'Paused',
      ready: 'Ready',
    },
    transitionMessage:
      "Candidate A's long turn is finished. Now answer the examiner's question briefly.",
    transitionTitle: 'Short follow-up',
    decisionPhaseTitle: 'Decision phase',
    decisionPhaseText: 'Answer the examiner’s final decision-making question.',
    part4GateTitle: 'Complete Part 3 first',
    part4GateText: 'Part 4 continues the topic from a completed Part 3 session.',
    part2LoadingTitle: 'Loading Part 2 task',
    part2LoadingText: 'Your photographs and task will appear in a moment.',
    part2CompleteTitle: 'Part 2 complete',
    part2CompleteText: 'You have completed the long turn and follow-up.',
    part1CompleteTitle: 'Part 1 Complete 🎉',
    part1CompleteSubtitle: 'What would you like to do?',
    continueToPart2: 'Continue to Part 2',
    getFeedback: 'Get feedback',
    practicePart1Title: 'Practice Part 1',
    repeatThisPracticeTitle: 'Repeat this practice',
    repeatThisPracticeText: 'Try the same questions again and improve your performance.',
    tryNewPart1QuestionsTitle: 'Try new Part 1 questions',
    tryNewPart1QuestionsText: 'Practise with a different Part 1 scenario.',
    part3CompleteTitle: 'Part 3 complete',
    part3CompleteText: 'You have completed the discussion and decision phase.',
    part4CompleteTitle: 'Part 4 complete',
    part4CompleteText: 'You have completed the final discussion.',
    requestingFeedback: 'Requesting feedback…',
    viewPart3Feedback: 'View Part 3 feedback',
    viewPart4Feedback: 'View Part 4 feedback',
    continueToPart4: 'Continue to Part 4',
    dismissMessage: 'Dismiss message',
    leaveScreen: 'Leave this speaking screen',
    backToB2Speaking: 'Back to B2 Speaking',
  },
  es: {
    eyebrow: 'B2 Expresión oral',
    partTitles: {
      'part-1': 'Parte 1',
      'part-2': 'Parte 2',
      'part-3': 'Parte 3',
      'part-4': 'Parte 4',
    },
    subtitles: {
      'part-1': 'Entrevista',
      'part-2': 'Turno largo',
      'part-3': 'Tarea colaborativa',
      'part-4': 'Discusión adicional',
    },
    supportingCopy: {
      'part-1': 'Responde unas cuantas preguntas sobre ti y tu vida cotidiana.',
      'part-2':
        'Compara las fotografías y responde a la tarea antes de contestar brevemente una pregunta de seguimiento.',
      'part-3':
        'Comenta la situación con el examinador y luego responde una pregunta final para tomar una decisión.',
      'part-4':
        'Responde las preguntas del examinador sobre el tema de la Parte 3. Da razones y ejemplos para desarrollar tus respuestas.',
    },
    readyTitle: {
      'part-1': 'Responde unas cuantas preguntas sobre ti y tu vida cotidiana.',
      'part-2': 'Compara dos fotografías y responde a la pregunta.',
      'part-3': 'Lee la situación y prepara tu respuesta.',
      'part-4': 'Discusión adicional',
    },
    readyText: {
      'part-1':
        'Comienza la Parte 1 cuando estés listo para escuchar la primera pregunta del examinador.',
      'part-2':
        'Hablarás durante aproximadamente un minuto y luego responderás una breve pregunta de seguimiento.',
      'part-3':
        'Comentarás una situación con un interlocutor guionizado y luego responderás una pregunta final para tomar una decisión.',
      'part-4': 'Responde cada pregunta cuando estés listo.',
    },
    startLabel: {
      'part-1': 'Comenzar Parte 1',
      'part-2': 'Comenzar Parte 2',
      'part-3': 'Comenzar Parte 3',
      'part-4': 'Comenzar Parte 4',
    },
    startingLabel: {
      'part-1': 'Iniciando Parte 1…',
      'part-2': 'Iniciando Parte 2…',
      'part-3': 'Iniciando Parte 3…',
      'part-4': 'Iniciando Parte 4…',
    },
    status: {
      recording: 'Grabando',
      timeComplete: 'Tiempo finalizado',
      paused: 'Pausado',
      ready: 'Listo',
    },
    transitionMessage:
      'El turno largo ha terminado. Ahora responde brevemente la pregunta de seguimiento del examinador.',
    transitionTitle: 'Pregunta breve de seguimiento',
    decisionPhaseTitle: 'Fase de decisión',
    decisionPhaseText: 'Responde la pregunta final del examinador para tomar una decisión.',
    part4GateTitle: 'Completa primero la Parte 3',
    part4GateText: 'La Parte 4 continúa el tema de una sesión completada de la Parte 3.',
    part2LoadingTitle: 'Cargando la tarea de la Parte 2',
    part2LoadingText: 'Tus fotografías y la tarea aparecerán en un momento.',
    part2CompleteTitle: 'Parte 2 completada',
    part2CompleteText: 'Completaste el turno largo y la pregunta de seguimiento.',
    part1CompleteTitle: 'Parte 1 completada 🎉',
    part1CompleteSubtitle: '¿Qué te gustaría hacer?',
    continueToPart2: 'Continuar a la Parte 2',
    getFeedback: 'Obtener evaluación',
    practicePart1Title: 'Practicar la Parte 1',
    repeatThisPracticeTitle: 'Repetir esta práctica',
    repeatThisPracticeText: 'Intenta las mismas preguntas otra vez y mejora tu rendimiento.',
    tryNewPart1QuestionsTitle: 'Probar nuevas preguntas de la Parte 1',
    tryNewPart1QuestionsText: 'Practica con un escenario diferente de la Parte 1.',
    part3CompleteTitle: 'Parte 3 completada',
    part3CompleteText: 'Completaste la discusión y la fase de decisión final.',
    part4CompleteTitle: 'Parte 4 completada',
    part4CompleteText: 'Completaste la discusión final.',
    requestingFeedback: 'Solicitando evaluación…',
    viewPart3Feedback: 'Ver evaluación de la Parte 3',
    viewPart4Feedback: 'Ver evaluación de la Parte 4',
    continueToPart4: 'Continuar a la Parte 4',
    dismissMessage: 'Descartar mensaje',
    leaveScreen: 'Salir de esta práctica oral',
    backToB2Speaking: 'Volver a B2 Expresión oral',
  },
} as const;

export function B2SpeakingPartScreen({
  partId,
  sourcePart3SessionId,
  language = 'en',
}: {
  partId: string;
  sourcePart3SessionId?: string;
  language?: 'en' | 'es';
}) {
  const identity = languageIdentities[language];
  const t = content[language];
  const isSpanish = language === 'es';
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
  const isPart1Complete = isPart1 && session?.part1Complete === true;
  const canStartPart4 = isPart4 && Boolean(sourcePart3SessionId);
  const hasStartedTask = Boolean(session?.remoteSessionId);
  const isTaskLoading = !hasStartedTask && (isCreatingSession || isStartingSession);

  const canRequestEvaluation =
    Boolean(session?.remoteSessionId) &&
    !isUploading &&
    !isEvaluating &&
    session?.status !== 'error' &&
    (isPart3
      ? isPart3Complete
      : isPart2
        ? isPart2Complete
        : isPart4
          ? isPart4Complete
          : session?.part1Complete === true);
  const canUpload =
    Boolean(clip) &&
    !isRecording &&
    !isUploading &&
    session?.part1Complete !== true &&
    !isPart3Complete &&
    !isPart4Complete;

  const partKey = (
    isPart2 ? 'part-2' : isPart3 ? 'part-3' : isPart4 ? 'part-4' : 'part-1'
  ) as PartKey;
  const supportingCopy = t.supportingCopy[partKey];
  const readyTitle = t.readyTitle[partKey];
  const readyText = t.readyText[partKey];
  const startLabel = isTaskLoading ? t.startingLabel[partKey] : t.startLabel[partKey];

  const showPhoto =
    (isPart2 && hasStartedTask && part2Photo !== null) ||
    (isPart3 && hasStartedTask && part3Scenario !== null);
  const shouldShowTimerGuide = isPart2 && hasStartedTask && !isPart2Complete;
  const timerStatusLabel = isRecording
    ? t.status.recording
    : timerStatus === 'completed'
      ? t.status.timeComplete
      : timerStatus === 'paused'
        ? t.status.paused
        : t.status.ready;
  const transitionMessage = isFollowUpPhase ? t.transitionMessage : null;
  const backLabel = hasStartedTask ? t.leaveScreen : t.backToB2Speaking;
  const repeatThisPractice = () => {
    void startSession(undefined, session?.remoteSessionId ?? undefined);
  };
  const tryNewPart1Questions = () => {
    void startSession(undefined, undefined, { practiceMode: 'new' });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={shellStyles.content}>
        <AppHeader
          accent={isSpanish ? identity.accent : undefined}
          eyebrow={t.eyebrow}
          subtitle={t.subtitles[partKey]}
          title={t.partTitles[partKey]}
        />

        <Text style={styles.supportingCopy}>{supportingCopy}</Text>

        {!hasStartedTask && (isPart1 || isPart2 || isPart3) ? (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>{readyTitle}</Text>
            <Text style={styles.readyText}>{readyText}</Text>
            <PrimaryButton
              accent={isSpanish ? identity.accent : undefined}
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
              accent={isSpanish ? identity.accent : undefined}
              disabled={isCreatingSession || isStartingSession}
              label={startLabel}
              onPress={() => startSession(sourcePart3SessionId)}
            />
          </View>
        ) : null}

        {isPart4 && !hasStartedTask && !sourcePart3SessionId ? (
          <View style={styles.readyCard}>
            <Text style={styles.readyTitle}>{t.part4GateTitle}</Text>
            <Text style={styles.readyText}>{t.part4GateText}</Text>
          </View>
        ) : null}

        {hasStartedTask && examinerText ? (
          <ExaminerTurnBubble
            examinerAudioUrl={examinerAudioUrl}
            examinerText={examinerText}
            language={language}
          />
        ) : null}

        {transitionMessage ? (
          <View style={styles.transitionBanner}>
            <Text style={styles.transitionTitle}>{t.transitionTitle}</Text>
            <Text style={styles.transitionText}>{transitionMessage}</Text>
          </View>
        ) : null}

        {isPart3Decision ? (
          <View style={styles.transitionBanner}>
            <Text style={styles.transitionTitle}>{t.decisionPhaseTitle}</Text>
            <Text style={styles.transitionText}>{t.decisionPhaseText}</Text>
          </View>
        ) : null}

        {isPart2 && isTaskLoading ? (
          <View style={styles.taskLoadingBanner}>
            <Text style={styles.taskLoadingTitle}>{t.part2LoadingTitle}</Text>
            <Text style={styles.taskLoadingText}>{t.part2LoadingText}</Text>
          </View>
        ) : null}

        {showPhoto ? (
          <Part2PhotoPrompt
            followUpMode={isFollowUpPhase}
            language={language}
            photo={isPart2 ? part2Photo : part3Scenario}
            scaleToFitWidth={isPart3}
          />
        ) : null}

        {isPart2Complete ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>{t.part2CompleteTitle}</Text>
            <Text style={styles.completionSubtitle}>{t.part2CompleteText}</Text>
          </View>
        ) : null}

        {isPart1Complete ? (
          <View style={styles.nextStepCard}>
            <View style={styles.nextStepHeader}>
              <View style={styles.nextStepHeadingGroup}>
                <Text style={styles.nextStepTitle}>{t.part1CompleteTitle}</Text>
                <Text style={styles.nextStepSubtitle}>{t.part1CompleteSubtitle}</Text>
              </View>
              <Text style={styles.nextStepRecommended}>{t.continueToPart2}</Text>
            </View>

            <PrimaryButton
              accent={isSpanish ? identity.accent : undefined}
              label={t.continueToPart2}
              onPress={() =>
                router.push({
                  pathname: '/(app)/practice/[part]',
                  params: {
                    part: 'part-2',
                    ...(language === 'es' ? { lang: 'es' } : {}),
                  },
                })
              }
            />

            {canRequestEvaluation ? (
              <PrimaryButton
                accent={isSpanish ? identity.accent : undefined}
                disabled={isEvaluating}
                label={isEvaluating ? t.requestingFeedback : t.getFeedback}
                onPress={requestEvaluation}
              />
            ) : null}

            <View style={styles.practiceSection}>
              <Text style={styles.practiceSectionTitle}>{t.practicePart1Title}</Text>

              <View style={styles.practiceOption}>
                <View style={styles.practiceOptionTextGroup}>
                  <Text style={styles.practiceOptionTitle}>{t.repeatThisPracticeTitle}</Text>
                  <Text style={styles.practiceOptionText}>{t.repeatThisPracticeText}</Text>
                </View>
                <SecondaryButton label={t.repeatThisPracticeTitle} onPress={repeatThisPractice} />
              </View>

              <View style={styles.practiceOption}>
                <View style={styles.practiceOptionTextGroup}>
                  <Text style={styles.practiceOptionTitle}>{t.tryNewPart1QuestionsTitle}</Text>
                  <Text style={styles.practiceOptionText}>{t.tryNewPart1QuestionsText}</Text>
                </View>
                <SecondaryButton label={t.tryNewPart1QuestionsTitle} onPress={tryNewPart1Questions} />
              </View>
            </View>
          </View>
        ) : null}

        {isPart3Complete ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>{t.part3CompleteTitle}</Text>
            <Text style={styles.completionSubtitle}>{t.part3CompleteText}</Text>
            {canRequestEvaluation ? (
              <SecondaryButton
                disabled={isEvaluating}
                label={isEvaluating ? t.requestingFeedback : t.viewPart3Feedback}
                onPress={requestEvaluation}
              />
            ) : null}
            {session?.remoteSessionId ? (
              <PrimaryButton
                accent={isSpanish ? identity.accent : undefined}
                label={t.continueToPart4}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/practice/[part]',
                    params: {
                      part: 'part-4',
                      source_part3_session_id: session.remoteSessionId,
                      ...(language === 'es' ? { lang: 'es' } : {}),
                    },
                  })
                }
              />
            ) : null}
          </View>
        ) : null}

        {isPart4Complete ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>{t.part4CompleteTitle}</Text>
            <Text style={styles.completionSubtitle}>{t.part4CompleteText}</Text>
            {canRequestEvaluation ? (
              <SecondaryButton
                disabled={isEvaluating}
                label={isEvaluating ? t.requestingFeedback : t.viewPart4Feedback}
                onPress={requestEvaluation}
              />
            ) : null}
          </View>
        ) : null}

        {hasStartedTask && !isPart1Complete && !isPart3Complete && !isPart4Complete ? (
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
            language={language}
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

        {assessment ? (
          <AssessmentResultsCard assessment={assessment} language={language} />
        ) : null}

        {errorMessage ? (
          <View style={styles.errorGroup}>
            <ErrorView message={errorMessage} />
            <SecondaryButton label={t.dismissMessage} onPress={resetError} />
          </View>
        ) : null}

        <SecondaryButton label={backLabel} onPress={() => router.back()} />
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
    textAlign: 'center',
  },
  completionTitle: {
    color: '#14532D',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  nextStepCard: {
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 18,
    marginTop: 20,
    padding: 18,
  },
  nextStepHeader: {
    alignItems: 'flex-start',
    gap: 10,
  },
  nextStepHeadingGroup: {
    gap: 4,
  },
  nextStepRecommended: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nextStepSubtitle: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 21,
  },
  nextStepTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
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
  practiceSection: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    gap: 12,
    paddingTop: 16,
  },
  practiceSectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  practiceOption: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  practiceOptionTextGroup: {
    gap: 4,
  },
  practiceOptionText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  practiceOptionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
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
