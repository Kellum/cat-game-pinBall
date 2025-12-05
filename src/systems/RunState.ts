export interface RunStateData {
  // Core stats
  currentRound: number;
  hearts: number;
  maxHearts: number;
  totalScore: number;
  roundScore: number;

  // Upgrade effects (multipliers default to 1.0)
  launchPowerMultiplier: number;
  flipperSpeedMultiplier: number;
  bumperScoreMultiplier: number;
  drainSaveChance: number; // 0.0 - 1.0
  comboBonus: number;

  // Active upgrades for display
  activeUpgradeIds: string[];

  // Character info
  characterId: string;
  characterColor: number;
}

export class RunState {
  private static instance: RunState | null = null;
  private data: RunStateData;

  private constructor() {
    this.data = this.getDefaultState();
  }

  static getInstance(): RunState {
    if (!RunState.instance) {
      RunState.instance = new RunState();
    }
    return RunState.instance;
  }

  private getDefaultState(): RunStateData {
    return {
      currentRound: 1,
      hearts: 3,
      maxHearts: 3,
      totalScore: 0,
      roundScore: 0,
      launchPowerMultiplier: 1.0,
      flipperSpeedMultiplier: 1.0,
      bumperScoreMultiplier: 1.0,
      drainSaveChance: 0.0,
      comboBonus: 0,
      activeUpgradeIds: [],
      characterId: 'fluffy',
      characterColor: 0xffa500,
    };
  }

  newRun(characterId: string = 'fluffy', characterColor: number = 0xffa500): void {
    this.data = {
      ...this.getDefaultState(),
      characterId,
      characterColor,
    };
  }

  getData(): RunStateData {
    return { ...this.data };
  }

  // Score management
  addScore(points: number): void {
    const adjustedPoints = Math.floor(points * this.data.bumperScoreMultiplier);
    this.data.roundScore += adjustedPoints;
    this.data.totalScore += adjustedPoints;
  }

  getRoundScoreGoal(): number {
    // Scale with round: 500 + (round - 1) * 200
    return 500 + (this.data.currentRound - 1) * 200;
  }

  // Heart management
  loseHeart(): boolean {
    // Check for drain save chance
    if (Math.random() < this.data.drainSaveChance) {
      return false; // Saved!
    }
    this.data.hearts--;
    return true; // Heart lost
  }

  addHeart(amount: number = 1): void {
    this.data.hearts = Math.min(this.data.hearts + amount, this.data.maxHearts);
  }

  isGameOver(): boolean {
    return this.data.hearts <= 0;
  }

  // Round management
  advanceRound(): void {
    this.data.currentRound++;
    this.data.roundScore = 0;
    // Heal one heart on round completion
    this.addHeart(1);
  }

  // Upgrade application
  applyUpgrade(upgradeId: string, effects: Partial<RunStateData>): void {
    this.data.activeUpgradeIds.push(upgradeId);

    // Apply numeric effects additively/multiplicatively as appropriate
    if (effects.maxHearts) {
      this.data.maxHearts += effects.maxHearts;
      this.data.hearts = this.data.maxHearts; // Heal to full
    }
    if (effects.launchPowerMultiplier) {
      this.data.launchPowerMultiplier *= effects.launchPowerMultiplier;
    }
    if (effects.flipperSpeedMultiplier) {
      this.data.flipperSpeedMultiplier *= effects.flipperSpeedMultiplier;
    }
    if (effects.bumperScoreMultiplier) {
      this.data.bumperScoreMultiplier *= effects.bumperScoreMultiplier;
    }
    if (effects.drainSaveChance) {
      this.data.drainSaveChance += effects.drainSaveChance;
    }
    if (effects.comboBonus) {
      this.data.comboBonus += effects.comboBonus;
    }
  }

  // Getters for common checks
  getHearts(): number {
    return this.data.hearts;
  }

  getMaxHearts(): number {
    return this.data.maxHearts;
  }

  getCurrentRound(): number {
    return this.data.currentRound;
  }

  getRoundScore(): number {
    return this.data.roundScore;
  }

  getTotalScore(): number {
    return this.data.totalScore;
  }

  getLaunchPowerMultiplier(): number {
    return this.data.launchPowerMultiplier;
  }

  getFlipperSpeedMultiplier(): number {
    return this.data.flipperSpeedMultiplier;
  }
}
