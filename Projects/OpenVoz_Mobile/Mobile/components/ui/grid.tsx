import { PropsWithChildren } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

interface ResponsiveGridProps extends PropsWithChildren {
  minItemWidth?: number;
}

export function ResponsiveGrid({ children, minItemWidth = 220 }: ResponsiveGridProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={styles.grid}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View
              key={index}
              style={{
                minWidth: minItemWidth,
                width: isTablet ? '48.5%' : '100%',
              }}
            >
              {child}
            </View>
          ))
        : children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
