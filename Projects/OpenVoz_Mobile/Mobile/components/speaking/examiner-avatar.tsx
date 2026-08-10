import { Image, StyleSheet, View } from 'react-native';

export type ExaminerAvatarState =
  'idle' | 'ready' | 'speaking' | 'listening' | 'thinking' | 'success' | 'error';

interface ExaminerAvatarProps {
  /**
   * Presentation-only visual state. Defaults to 'idle' / ready appearance.
   * No state ownership is implied; this value should be derived from
   * existing application state by the caller.
   */
  state?: ExaminerAvatarState;
  /** Diameter of the avatar in points. */
  size?: number;
}

/**
 * Neutral, non-human OpenVoz Examiner robot/avatar.
 * Presentation-only: never owns conversation state.
 *
 * All avatar states currently render the same approved static asset.
 */
export function ExaminerAvatar({ state = 'idle', size = 40 }: ExaminerAvatarProps) {
  return (
    <View
      accessibilityLabel="OpenVoz Examiner"
      accessibilityRole="image"
      style={[styles.container, { height: size, width: size, borderRadius: size / 2 }]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={require('../../assets/images/examiner-avatar.png')}
        style={styles.image}
      />
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
});
