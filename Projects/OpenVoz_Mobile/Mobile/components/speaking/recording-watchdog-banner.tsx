import { StyleSheet, Text, View } from 'react-native';

import {
  getRecordingWatchdogMessage,
  type RecordingWarningLevel,
} from '../../services/speaking/recording-watchdog';

interface RecordingWatchdogBannerProps {
  elapsedSeconds: number;
  warningLevel: RecordingWarningLevel;
}

export function RecordingWatchdogBanner({
  elapsedSeconds,
  warningLevel,
}: RecordingWatchdogBannerProps) {
  const message = getRecordingWatchdogMessage(warningLevel, elapsedSeconds);

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.banner, warningLevel === 'very_long_recording' && styles.bannerAlert]}>
      <Text style={styles.title}>
        {warningLevel === 'very_long_recording' ? 'Recording taking a long time' : 'Recording in progress'}
      </Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  bannerAlert: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  text: {
    color: '#9A3412',
    fontSize: 13,
    lineHeight: 19,
  },
  title: {
    color: '#9A3412',
    fontSize: 15,
    fontWeight: '800',
  },
});
