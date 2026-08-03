import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../ui/buttons';

interface SpeakingIntegrationCardProps {
  canRequestEvaluation: boolean;
  canUpload: boolean;
  evaluationLabel: string;
  isEvaluating: boolean;
  isUploading: boolean;
  onRequestEvaluation: () => void;
  onUploadRecording: () => void;
}

export function SpeakingIntegrationCard({
  canRequestEvaluation,
  canUpload,
  evaluationLabel,
  isEvaluating,
  isUploading,
  onRequestEvaluation,
  onUploadRecording,
}: SpeakingIntegrationCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Backend Integration</Text>
      <Text style={styles.copy}>
        Upload and evaluation requests extend the existing API service layer and keep backend
        authority over durable speaking evidence.
      </Text>
      <Text style={styles.meta}>Evaluation status: {evaluationLabel}</Text>

      <View style={styles.actions}>
        <PrimaryButton
          disabled={!canUpload || isUploading}
          label={isUploading ? 'Uploading...' : 'Upload recording'}
          onPress={onUploadRecording}
        />
        <SecondaryButton
          disabled={!canRequestEvaluation || isEvaluating}
          label={isEvaluating ? 'Requesting...' : 'Request evaluation'}
          onPress={onRequestEvaluation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  copy: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 21,
  },
  meta: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#102A43',
    fontSize: 18,
    fontWeight: '700',
  },
});
