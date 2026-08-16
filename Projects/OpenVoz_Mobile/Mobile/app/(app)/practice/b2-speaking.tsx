import { useLocalSearchParams } from 'expo-router';

import { B2SpeakingLandingScreen } from '../../../screens/practice/b2-speaking-landing-screen';

export default function B2SpeakingLandingRoute() {
  const { lang } = useLocalSearchParams();
  return <B2SpeakingLandingScreen language={lang === 'es' ? 'es' : 'en'} />;
}
