import { useLocalSearchParams } from 'expo-router';

import { B2SpeakingPartScreen } from '../../../screens/practice/b2-speaking-part-placeholder-screen';

export default function B2SpeakingPartRoute() {
  const { part } = useLocalSearchParams<{ part: string }>();

  return <B2SpeakingPartScreen partId={part ?? 'part-1'} />;
}
