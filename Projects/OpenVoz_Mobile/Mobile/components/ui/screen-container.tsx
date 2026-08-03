import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import { useResponsiveLayout } from '../../hooks/use-responsive-layout';

interface ScreenContainerProps extends PropsWithChildren {
  centered?: boolean;
}

export function ScreenContainer({ centered = false, children }: ScreenContainerProps) {
  const { contentMaxWidth } = useResponsiveLayout();

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <View style={[styles.frame, centered && styles.frameCentered]}>
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: '100%',
  },
  frame: {
    alignItems: 'center',
    flex: 1,
  },
  frameCentered: {
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FBFF',
  },
});
