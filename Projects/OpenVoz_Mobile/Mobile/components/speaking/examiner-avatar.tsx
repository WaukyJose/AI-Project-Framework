import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

export type ExaminerAvatarState =
  | 'idle'
  | 'ready'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'success'
  | 'error';

interface ExaminerAvatarProps {
  state?: ExaminerAvatarState;
  isSpeaking?: boolean;
  size?: number;
  useRive?: boolean;
}

const resetAnimatedValue = (value: Animated.Value) => {
  value.stopAnimation();
  value.setValue(0);
};

export function ExaminerAvatar({
  isSpeaking = false,
  state = 'idle',
  size = 40,
}: ExaminerAvatarProps) {
  const shouldAnimate = isSpeaking || state === 'speaking';
  const mouth = useRef(new Animated.Value(0)).current;
  const mouthLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const stopMouth = () => {
      mouthLoopRef.current?.stop();
      mouthLoopRef.current = null;
      resetAnimatedValue(mouth);
    };

    if (!shouldAnimate) {
      stopMouth();
      return;
    }

    const mouthLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mouth, {
          duration: 230,
          easing: Easing.inOut(Easing.quad),
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(mouth, {
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(120),
      ]),
    );
    mouthLoopRef.current = mouthLoop;
    mouthLoop.start();

    return stopMouth;
  }, [mouth, shouldAnimate]);

  const mouthScaleY = mouth.interpolate({
    inputRange: [0, 0.9],
    outputRange: [1, 1.45],
  });
  return (
    <View
      accessibilityLabel="OpenVoz Examiner"
      accessibilityRole="image"
      style={[styles.container, { height: size, width: size, borderRadius: size / 2 }]}
    >
      <View style={styles.stage}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={require('../../assets/images/examiner-avatar.png')}
          style={styles.image}
        />

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {shouldAnimate ? (
            <Animated.View style={[styles.mouth, { transform: [{ scaleY: mouthScaleY }] }]}>
              <View style={styles.mouthHighlight} />
            </Animated.View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderColor: '#B6E0FF',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  mouth: {
    alignItems: 'center',
    backgroundColor: '#0A1930',
    borderColor: '#233E62',
    borderRadius: 999,
    borderWidth: 1,
    height: '4.5%',
    justifyContent: 'flex-start',
    left: '41%',
    overflow: 'hidden',
    position: 'absolute',
    top: '49%',
    width: '18%',
  },
  mouthHighlight: {
    backgroundColor: 'rgba(119, 215, 255, 0.58)',
    borderRadius: 999,
    height: 1,
    marginTop: 2,
    width: '52%',
  },
  stage: {
    height: '100%',
    width: '100%',
  },
});
