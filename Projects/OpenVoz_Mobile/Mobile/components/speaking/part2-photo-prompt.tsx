import { useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import type { Part2PhotoPrompt as Part2PhotoPromptType } from '../../types/speaking';

interface Part2PhotoPromptProps {
  photo: Part2PhotoPromptType | null;
  style?: ViewStyle;
}

interface NaturalSize {
  width: number;
  height: number;
}

export function Part2PhotoPrompt({ photo, style }: Part2PhotoPromptProps) {
  const [hasError, setHasError] = useState(false);
  const [naturalSize, setNaturalSize] = useState<NaturalSize | null>(null);

  if (!photo) {
    return null;
  }

  // Derive wrapper height from the image's natural aspect ratio so
  // resizeMode="contain" fills the available width regardless of
  // whether the source is landscape or portrait.
  const aspectRatio = naturalSize ? naturalSize.width / naturalSize.height : 4 / 3;
  // Minimum height based on a portrait-oriented fallback so the
  // placeholder reserves sensible space before the image loads.
  const minHeight = 280;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {hasError ? (
            <View style={[styles.errorPlaceholder, { minHeight }]}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>Photograph unavailable.</Text>
              <Text style={styles.errorHint}>Please try again.</Text>
            </View>
          ) : (
            <View style={[styles.imageFrame, { aspectRatio, minHeight }]}>
              <Image
                accessibilityLabel="Part 2 speaking photograph"
                onError={() => setHasError(true)}
                onLoad={(e) => {
                  setHasError(false);
                  const { width, height } = e.nativeEvent.source;
                  if (width > 0 && height > 0) {
                    setNaturalSize({ width, height });
                  }
                }}
                resizeMode="contain"
                source={{ uri: photo.photoUrl }}
                style={styles.image}
              />
            </View>
          )}
        </View>

        {!hasError ? (
          <Text style={styles.cue}>Speak for about 1 minute.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E2EC',
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  container: {
    width: '100%',
  },
  cue: {
    color: '#627D98',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },
  errorHint: {
    color: '#627D98',
    fontSize: 13,
  },
  errorIcon: {
    fontSize: 28,
  },
  errorPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    borderRadius: 16,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  errorText: {
    color: '#486581',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    borderRadius: 16,
    height: '100%',
    width: '100%',
  },
  imageFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
  },
});
