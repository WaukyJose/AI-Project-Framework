import type { ImageSourcePropType } from 'react-native';

export type Part3SpanishScenarioId = 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

const PART3_ES_IMAGES: Record<Part3SpanishScenarioId, ImageSourcePropType> = {
  21: require('../assets/images/part3-spanish/Part3_Ex_1_es.png'),
  22: require('../assets/images/part3-spanish/Part3_Ex_2_es.png'),
  23: require('../assets/images/part3-spanish/Part3_Ex_3_es.png'),
  24: require('../assets/images/part3-spanish/Part3_Ex_4_es.png'),
  25: require('../assets/images/part3-spanish/Part3_Ex_5_es.png'),
  26: require('../assets/images/part3-spanish/Part3_Ex_6_es.png'),
  27: require('../assets/images/part3-spanish/Part3_Ex_7_es.png'),
  28: require('../assets/images/part3-spanish/Part3_Ex_8_es.png'),
  29: require('../assets/images/part3-spanish/Part3_Ex_9_es.png'),
  30: require('../assets/images/part3-spanish/Part3_Ex_10_es.png'),
};

export function getPart3SpanishImageSource(part3ScenarioId: string | null | undefined) {
  if (!part3ScenarioId) {
    return null;
  }

  const numericId = Number(part3ScenarioId) as Part3SpanishScenarioId;
  if (!Number.isInteger(numericId) || numericId < 21 || numericId > 30) {
    return null;
  }

  return PART3_ES_IMAGES[numericId] ?? null;
}

