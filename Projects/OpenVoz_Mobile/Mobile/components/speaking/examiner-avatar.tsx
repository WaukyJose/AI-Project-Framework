import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import { Fit, RiveView, useRiveFile } from '@rive-app/react-native';

export type ExaminerAvatarState =
  | 'idle'
  | 'ready'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'success'
  | 'error';

interface ExaminerAvatarProps {
  /**
   * Presentation-only visual state. Defaults to 'idle' / ready appearance.
   * No state ownership is implied; this value should be derived from
   * existing application state by the caller.
   */
  state?: ExaminerAvatarState;
  /** Whether the mouth should animate as if the examiner is speaking. */
  isSpeaking?: boolean;
  /** Diameter of the avatar in points. */
  size?: number;
  /** Opt-in gate so Rive stays restricted to Part 1 for now. */
  useRive?: boolean;
}

const RIVE_PROOF_SOURCE = require('../../assets/rive/examiner-avatar.riv');

export function ExaminerAvatar({
  isSpeaking = false,
  state = 'idle',
  size = 40,
  useRive = false,
}: ExaminerAvatarProps) {
  const riveResult = useRive ? useRiveFile(RIVE_PROOF_SOURCE) : null;
  const riveFile = riveResult?.riveFile ?? null;
  const error = riveResult?.error ?? null;
  const isLoading = riveResult?.isLoading ?? false;
  const canShowRive = useRive && Boolean(riveFile) && !error && !isLoading;

  const shouldAnimate = isSpeaking || state === 'speaking';
  const blinkValue = useRef(new Animated.Value(0)).current;
  const pupilX = useRef(new Animated.Value(0)).current;
  const pupilY = useRef(new Animated.Value(0)).current;
  const mouthPulse = useRef(new Animated.Value(0)).current;
  const [mouthFrame, setMouthFrame] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) {
      blinkValue.setValue(0);
      pupilX.setValue(0);
      pupilY.setValue(0);
      mouthPulse.setValue(0);
      setMouthFrame(0);
      return;
    }

    let cancelled = false;
    let blinkTimer: ReturnType<typeof setTimeout> | null = null;
    let mouthTimer: ReturnType<typeof setInterval> | null = null;
    let gazeTimer: ReturnType<typeof setInterval> | null = null;

    const scheduleBlink = () => {
      const delay = 2800 + Math.random() * 4200;
      blinkTimer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(blinkValue, {
            duration: 90,
            easing: Easing.out(Easing.quad),
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(blinkValue, {
            duration: 110,
            easing: Easing.in(Easing.quad),
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start(() => {
          if (!cancelled) scheduleBlink();
        });
      }, delay);
    };

    const setGaze = () => {
      const nextX = [-1, 0, 1][Math.floor(Math.random() * 3)];
      const nextY = [-1, 0][Math.floor(Math.random() * 2)];
      Animated.parallel([
        Animated.timing(pupilX, {
          duration: 320 + Math.random() * 220,
          easing: Easing.out(Easing.quad),
          toValue: nextX,
          useNativeDriver: true,
        }),
        Animated.timing(pupilY, {
          duration: 320 + Math.random() * 220,
          easing: Easing.out(Easing.quad),
          toValue: nextY,
          useNativeDriver: true,
        }),
      ]).start();
    };

    scheduleBlink();
    setGaze();
    gazeTimer = setInterval(setGaze, 2200 + Math.random() * 1800);

    mouthTimer = setInterval(() => {
      mouthPulse.setValue(0);
      Animated.timing(mouthPulse, {
        duration: 120,
        toValue: 1,
        useNativeDriver: false,
      }).start(() => {
        if (!cancelled) {
          setMouthFrame((value) => (value + 1) % 4);
        }
      });
    }, 110 + Math.random() * 90);

    return () => {
      cancelled = true;
      if (blinkTimer) clearTimeout(blinkTimer);
      if (gazeTimer) clearInterval(gazeTimer);
      if (mouthTimer) clearInterval(mouthTimer);
    };
  }, [blinkValue, mouthPulse, pupilX, pupilY, shouldAnimate]);

  const eyelidTopTranslateY = blinkValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });
  const eyelidBottomTranslateY = blinkValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -11],
  });
  const mouthHeight = shouldAnimate
    ? [
        styles.mouthRest,
        styles.mouthOpenSmall,
        styles.mouthOpenMedium,
        styles.mouthOpenWide,
      ][mouthFrame]
    : styles.mouthRest;

  return (
    <View
      accessibilityLabel="OpenVoz Examiner"
      accessibilityRole="image"
      style={[styles.container, { height: size, width: size, borderRadius: size / 2 }]}
    >
      {canShowRive && riveFile ? (
        <RiveView autoPlay fit={Fit.Contain} file={riveFile} style={styles.image} />
      ) : (
        <View style={styles.stage}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={require('../../assets/images/examiner-avatar.png')}
            style={styles.image}
          />

          {shouldAnimate ? (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <View style={[styles.eye, styles.leftEye]}>
                <Animated.View
                  style={[
                    styles.pupil,
                    { transform: [{ translateX: pupilX }, { translateY: pupilY }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.eyelidTop,
                    { transform: [{ translateY: eyelidTopTranslateY }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.eyelidBottom,
                    { transform: [{ translateY: eyelidBottomTranslateY }] },
                  ]}
                />
              </View>

              <View style={[styles.eye, styles.rightEye]}>
                <Animated.View
                  style={[
                    styles.pupil,
                    { transform: [{ translateX: pupilX }, { translateY: pupilY }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.eyelidTop,
                    { transform: [{ translateY: eyelidTopTranslateY }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.eyelidBottom,
                    { transform: [{ translateY: eyelidBottomTranslateY }] },
                  ]}
                />
              </View>

              <View style={[styles.brow, styles.leftBrow]} />
              <View style={[styles.brow, styles.rightBrow]} />

              <View style={[styles.mouthShell, mouthHeight]}>
                <View style={styles.mouthHighlight} />
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  brow: {
    backgroundColor: '#4B2E2A',
    borderRadius: 999,
    height: 4,
    position: 'absolute',
    width: 16,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderColor: '#B6E0FF',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eye: {
    backgroundColor: '#FFF8F0',
    borderColor: '#23262A',
    borderRadius: 999,
    borderWidth: 1,
    height: 9,
    overflow: 'hidden',
    position: 'absolute',
    width: 13,
  },
  eyelidBottom: {
    backgroundColor: '#F3C9B3',
    borderRadius: 999,
    bottom: -2,
    height: 7,
    left: -1,
    position: 'absolute',
    right: -1,
  },
  eyelidTop: {
    backgroundColor: '#F3C9B3',
    borderRadius: 999,
    height: 7,
    left: -1,
    position: 'absolute',
    right: -1,
    top: -2,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  leftBrow: {
    left: '28%',
    top: '30%',
    transform: [{ rotate: '-10deg' }],
  },
  leftEye: {
    left: '29%',
    top: '36.4%',
  },
  mouthHighlight: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    height: '28%',
    marginTop: 2,
    opacity: 0.7,
    width: '72%',
  },
  mouthOpenMedium: {
    height: '9.5%',
  },
  mouthOpenSmall: {
    height: '6.5%',
  },
  mouthOpenWide: {
    height: '13%',
  },
  mouthRest: {
    height: '4%',
  },
  mouthShell: {
    alignItems: 'center',
    backgroundColor: '#D96C77',
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    borderColor: '#B44753',
    borderWidth: 1,
    bottom: '33%',
    justifyContent: 'flex-start',
    left: '42%',
    overflow: 'hidden',
    position: 'absolute',
    width: '16%',
  },
  pupil: {
    backgroundColor: '#1C120D',
    borderRadius: 999,
    height: 5,
    left: 4,
    position: 'absolute',
    top: 2,
    width: 5,
  },
  rightBrow: {
    left: '56%',
    top: '29.5%',
    transform: [{ rotate: '8deg' }],
  },
  rightEye: {
    left: '56.4%',
    top: '36.2%',
  },
  stage: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
