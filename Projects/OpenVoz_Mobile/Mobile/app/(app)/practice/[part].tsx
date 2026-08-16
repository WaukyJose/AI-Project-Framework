import { useLocalSearchParams } from 'expo-router';

import { B2SpeakingPartScreen } from '../../../screens/practice/b2-speaking-part-placeholder-screen';

export default function B2SpeakingPartRoute() {
  const { part, source_part3_session_id, lang } = useLocalSearchParams<{
    part: string;
    source_part3_session_id?: string | string[];
    lang?: string;
  }>();
  const sourcePart3SessionId = Array.isArray(source_part3_session_id)
    ? source_part3_session_id[0]
    : source_part3_session_id;

  const language = lang === 'es' ? 'es' : 'en';

  return (
    <B2SpeakingPartScreen
      partId={part ?? 'part-1'}
      sourcePart3SessionId={sourcePart3SessionId}
      language={language}
    />
  );
}
