import type { Gage, GageLevel } from '@/src/types';

export const mockGagesByLevel: Record<GageLevel, Gage[]> = {
  soft: [
    {
      id: 'soft-1',
      text: 'Fais un compliment sincere au joueur de ton choix.',
      emoji: ':)',
      level: 'soft',
      drinksIfRefused: 1,
    },
    {
      id: 'soft-2',
      text: 'Raconte ton anecdote la plus genante en 15 secondes.',
      emoji: ':D',
      level: 'soft',
      drinksIfRefused: 1,
    },
    {
      id: 'soft-3',
      text: 'Imite ton rire le plus dramatique pendant 10 secondes.',
      emoji: ':P',
      level: 'soft',
      drinksIfRefused: 1,
    },
  ],
  epice: [
    {
      id: 'epice-1',
      text: 'Danse comme si tout le salon te regardait pendant 20 secondes.',
      emoji: '<3',
      level: 'epice',
      drinksIfRefused: 2,
    },
    {
      id: 'epice-2',
      text: 'Chante le refrain de ton choix sans perdre le rythme.',
      emoji: ':o',
      level: 'epice',
      drinksIfRefused: 2,
    },
    {
      id: 'epice-3',
      text: 'Fais deviner une celebrite avec un mime de 15 secondes.',
      emoji: ';)',
      level: 'epice',
      drinksIfRefused: 2,
    },
  ],
  chaos: [
    {
      id: 'chaos-1',
      text: 'Improvises un discours de victoire totalement absurde.',
      emoji: '!*',
      level: 'chaos',
      drinksIfRefused: 3,
    },
    {
      id: 'chaos-2',
      text: 'Parle avec un accent impose pendant le prochain tour.',
      emoji: '??',
      level: 'chaos',
      drinksIfRefused: 3,
    },
    {
      id: 'chaos-3',
      text: 'Defie le groupe avec une imitation improvisee de 20 secondes.',
      emoji: '!!',
      level: 'chaos',
      drinksIfRefused: 3,
    },
  ],
};
