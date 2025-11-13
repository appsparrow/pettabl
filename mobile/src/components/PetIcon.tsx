import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { ComponentProps } from 'react';

// Ensure the community icon font is available on native/mobile runs.
// Expo lazily loads fonts, but calling loadFont once avoids missing icon glitches.
// eslint-disable-next-line @typescript-eslint/no-floating-promises
MaterialCommunityIcons.loadFont();

export type PetType =
  | 'dog'
  | 'cat'
  | 'fish'
  | 'bird'
  | 'rabbit'
  | 'turtle'
  | 'hamster'
  | 'other'
  | null
  | undefined;

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  type: PetType;
  size?: number;
  color?: string;
};

const iconMap: Record<Exclude<PetType, null | undefined>, MaterialIconName> = {
  dog: 'dog',
  cat: 'cat',
  fish: 'fish',
  bird: 'bird',
  rabbit: 'rabbit',
  turtle: 'turtle',
  hamster: 'rodent',
  other: 'paw',
};

export function PetIcon({ type, size = 28, color = colors.primary }: Props) {
  const key = type ?? 'other';
  const iconName = iconMap[key as keyof typeof iconMap] ?? 'paw';
  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}

