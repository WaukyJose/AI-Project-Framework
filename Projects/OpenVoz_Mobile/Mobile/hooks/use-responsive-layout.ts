import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = width >= 1180 ? 1120 : width >= 768 ? 980 : 680;
  const columns = width >= 1180 ? 3 : width >= 768 ? 2 : 1;

  return {
    columns,
    contentMaxWidth,
    isTablet,
    width,
  };
}
