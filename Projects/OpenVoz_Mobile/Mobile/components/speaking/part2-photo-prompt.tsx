import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import type { Part2PhotoPrompt as Part2PhotoPromptType } from '../../types/speaking';

interface Part2PhotoPromptProps {
  followUpMode?: boolean;
  language?: 'en' | 'es';
  photo: Part2PhotoPromptType | null;
  imageSource?: ImageSourcePropType;
  maxImageHeight?: number;
  scaleToFitWidth?: boolean;
  style?: ViewStyle;
}

interface NaturalSize {
  width: number;
  height: number;
}

const DEFAULT_PART2_TOP_CROP = 0.12;

const PART2_TOP_CROP_OVERRIDES: Record<string, number> = {
  // Tune individual Part 2 image sets here if a future asset needs a
  // slightly different crop line to preserve the full first photo.
};

function getPhotoCropKey(photoUrl: string) {
  const withoutQuery = photoUrl.split('?')[0] ?? photoUrl;
  const fileName = withoutQuery.split('/').pop() ?? withoutQuery;
  return fileName.toLowerCase();
}

export function Part2PhotoPrompt({
  followUpMode = false,
  language = 'en',
  photo,
  imageSource,
  maxImageHeight,
  scaleToFitWidth = false,
  style,
}: Part2PhotoPromptProps) {
  const [hasError, setHasError] = useState(false);
  const [naturalSize, setNaturalSize] = useState<NaturalSize | null>(null);
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);

  if (!photo) {
    return null;
  }

  const resolvedImageSource = imageSource ?? { uri: photo.photoUrl };
  const localAssetSource = typeof imageSource === 'number' ? imageSource : null;
  const localAssetSize = localAssetSource ? Image.resolveAssetSource(localAssetSource) : null;

  const t = {
    en: {
      unavailable: 'Photograph unavailable.',
      tryAgain: 'Please try again.',
      part2Label: 'Part 2 speaking photograph',
      part3Label: 'Part 3 speaking scenario',
      followUpCue: 'Answer the examiner briefly.',
      readyCue: "Press Start recording when you're ready.",
    },
    es: {
      unavailable: 'Fotografía no disponible.',
      tryAgain: 'Inténtalo de nuevo.',
      part2Label: 'Fotografía de la Parte 2 de expresión oral',
      part3Label: 'Situación de la Parte 3 de expresión oral',
      followUpCue: 'Responde brevemente al examinador.',
      readyCue: 'Pulsa Iniciar grabación cuando estés listo.',
    },
  }[language];

  // Derive wrapper height from the image's natural aspect ratio so
  // resizeMode="contain" fills the available width regardless of
  // whether the source is landscape or portrait.
  const aspectRatio = naturalSize ? naturalSize.width / naturalSize.height : 4 / 3;
  // Minimum height based on a portrait-oriented fallback so the
  // placeholder reserves sensible space before the image loads.
  const minHeight = 280;
  const cropKey = getPhotoCropKey(photo.photoUrl);
  const topCrop = PART2_TOP_CROP_OVERRIDES[cropKey] ?? DEFAULT_PART2_TOP_CROP;
  const effectiveWidth = layoutWidth ?? naturalSize?.width ?? 0;
  const effectiveHeight = naturalSize ? naturalSize.height : 0;
  const cropPx = effectiveHeight * topCrop;
  const scaledHeight =
    effectiveWidth > 0 && effectiveHeight > 0 ? (effectiveHeight * effectiveWidth) / naturalSize!.width : 0;
  const visibleHeight = Math.max(0, scaledHeight - scaledHeight * topCrop);
  const croppedImageHeight = scaledHeight > 0 ? scaledHeight : minHeight;
  const fitWidthRenderedHeight =
    layoutWidth && localAssetSize?.width && localAssetSize?.height
      ? (layoutWidth * localAssetSize.height) / localAssetSize.width
      : null;

  function handleLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      setLayoutWidth(width);
    }
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          {hasError ? (
            <View style={[styles.errorPlaceholder, { minHeight }]}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{t.unavailable}</Text>
              <Text style={styles.errorHint}>{t.tryAgain}</Text>
            </View>
          ) : scaleToFitWidth ? (
            <View onLayout={handleLayout} style={styles.imageFrameFitWidth}>
              <Image
                accessibilityLabel={t.part3Label}
                onError={() => setHasError(true)}
                onLoad={(e) => {
                  setHasError(false);
                  const { width, height } = e.nativeEvent.source;
                  if (width > 0 && height > 0) {
                    setNaturalSize({ width, height });
                  }
                }}
                resizeMode="contain"
                source={resolvedImageSource}
                style={[
                  styles.imageFitWidth,
                  fitWidthRenderedHeight
                    ? { height: fitWidthRenderedHeight, width: '100%' }
                    : { aspectRatio },
                  maxImageHeight ? { maxHeight: maxImageHeight } : null,
                ]}
              />
            </View>
          ) : (
            <View
              onLayout={handleLayout}
              style={[
                styles.imageFrame,
                layoutWidth ? { height: visibleHeight, minHeight: visibleHeight } : { aspectRatio, minHeight },
              ]}
            >
              <Image
                accessibilityLabel={t.part2Label}
                onError={() => setHasError(true)}
                onLoad={(e) => {
                  setHasError(false);
                  const { width, height } = e.nativeEvent.source;
                  if (width > 0 && height > 0) {
                    setNaturalSize({ width, height });
                  }
                }}
                resizeMode="contain"
                source={resolvedImageSource}
                style={[
                  styles.image,
                  layoutWidth && naturalSize
                    ? {
                        height: croppedImageHeight,
                        marginTop: -Math.round(cropPx * (layoutWidth / naturalSize.width)),
                        width: '100%',
                      }
                    : null,
                ]}
              />
            </View>
          )}
        </View>

        {!hasError ? (
          <View style={styles.copyGroup}>
            <Text style={styles.cue}>
              {followUpMode ? t.followUpCue : t.readyCue}
            </Text>
          </View>
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
  copyGroup: {
    gap: 6,
  },
  cue: {
    color: '#627D98',
    fontSize: 14,
    lineHeight: 20,
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
  imageFitWidth: {
    borderRadius: 16,
    width: '100%',
  },
  imageFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  imageFrameFitWidth: {
    borderRadius: 16,
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
  },
});
