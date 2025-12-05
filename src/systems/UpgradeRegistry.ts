import { RunStateData } from './RunState';

export type UpgradeRarity = 'common' | 'rare' | 'epic';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  rarity: UpgradeRarity;
  icon: string; // Texture key or emoji for placeholder
  effects: Partial<RunStateData>;
}

// Rarity colors for card borders
export const RARITY_COLORS: Record<UpgradeRarity, number> = {
  common: 0x888888,
  rare: 0x4488ff,
  epic: 0xaa44ff,
};

export const UPGRADES: Upgrade[] = [
  // Survivability
  {
    id: 'extra_heart',
    name: 'Extra Heart',
    description: '+1 max heart\nHeal to full',
    rarity: 'common',
    icon: '❤️',
    effects: {
      maxHearts: 1,
    },
  },
  {
    id: 'thick_skin',
    name: 'Thick Skin',
    description: '20% chance to\nsurvive drain',
    rarity: 'rare',
    icon: '🛡️',
    effects: {
      drainSaveChance: 0.2,
    },
  },

  // Power
  {
    id: 'super_launch',
    name: 'Super Launch',
    description: '+30% launch\nvelocity',
    rarity: 'common',
    icon: '🚀',
    effects: {
      launchPowerMultiplier: 1.3,
    },
  },
  {
    id: 'mega_flippers',
    name: 'Mega Flippers',
    description: '+40% flipper\nspeed',
    rarity: 'rare',
    icon: '⚡',
    effects: {
      flipperSpeedMultiplier: 1.4,
    },
  },

  // Scoring
  {
    id: 'lucky_bumpers',
    name: 'Lucky Bumpers',
    description: '2x bumper\npoints',
    rarity: 'common',
    icon: '🍀',
    effects: {
      bumperScoreMultiplier: 2.0,
    },
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: '+50 bonus per\nconsecutive hit',
    rarity: 'epic',
    icon: '🔥',
    effects: {
      comboBonus: 50,
    },
  },
];

/**
 * Get a specified number of random upgrades, excluding any already obtained
 */
export function getRandomUpgrades(count: number, excludeIds: string[] = []): Upgrade[] {
  const available = UPGRADES.filter(u => !excludeIds.includes(u.id));

  // Shuffle using Fisher-Yates
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Get an upgrade by ID
 */
export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADES.find(u => u.id === id);
}
