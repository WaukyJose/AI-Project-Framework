import { SpeakingPartId } from '../../types/speaking';

export interface SpeakingPartDefinition {
  description: string;
  id: SpeakingPartId;
  title: string;
}

export const speakingParts: SpeakingPartDefinition[] = [
  {
    description: 'Introduce the candidate, conversational warm-up, and guided question exchange.',
    id: 'part-1',
    title: 'Part 1',
  },
  {
    description: 'Preparation, prompt review, and longer individual response flow.',
    id: 'part-2',
    title: 'Part 2',
  },
  {
    description: 'Short examiner follow-up exchange linked to the Part 2 response.',
    id: 'follow-up',
    title: 'Follow-up',
  },
  {
    description: 'Collaborative discussion structure and longer comparative interaction.',
    id: 'part-3',
    title: 'Part 3',
  },
  {
    description: 'Extended discussion and closing exam dialogue.',
    id: 'part-4',
    title: 'Part 4',
  },
];

export function getSpeakingPartDefinition(partId: string): SpeakingPartDefinition {
  return (
    speakingParts.find((part) => part.id === partId) ?? {
      description: 'Shared speaking infrastructure workspace.',
      id: 'part-1',
      title: formatPartTitle(partId),
    }
  );
}

export function formatPartTitle(partId: string) {
  if (partId === 'follow-up') {
    return 'Follow-up';
  }

  return partId
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
