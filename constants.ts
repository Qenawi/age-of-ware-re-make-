import type { Age } from './types';

const ASSET_BASE_URL = "https://raw.githubusercontent.com/apiotrowski255/age-of-war/master/img/";

export const GAME_CONFIG = {
  GAME_WIDTH: 1200,
  GAME_HEIGHT: 600,
  MAX_HEALTH: 1000,
  STARTING_GOLD: 250,
  STARTING_XP: 0,
  GOLD_PER_TICK: 1.5,
  XP_PER_TICK: 0.5,
  PLAYER_BASE_X: 60,
  AI_BASE_X: 1080,
  UNIT_SPAWN_OFFSET: 60,
  FPS: 60,
  AI_SPAWN_RATE_MS: 5000, // AI tries to spawn a unit every 5 seconds
  XP_PER_KILL: 25,
  GOLD_PER_KILL: 20,
};

export const AGES: Age[] = [
  {
    name: "Stone Age",
    xpToEvolve: 400,
    background: `${ASSET_BASE_URL}backgrounds/1.png`,
    baseImage: `${ASSET_BASE_URL}bases/1/base.png`,
    units: [
      {
        name: "Clubman",
        cost: 50,
        health: 100,
        damage: 15,
        range: 5, // melee
        attackSpeed: 1,
        speed: 30,
        icon: `${ASSET_BASE_URL}units/1/1.png`,
        walkImage: `${ASSET_BASE_URL}units/1/1.png`,
        attackImage: `${ASSET_BASE_URL}units/1/1.png`,
        width: 50,
        height: 50,
      },
      {
        name: "Slingshot",
        cost: 75,
        health: 70,
        damage: 10,
        range: 150,
        attackSpeed: 0.8,
        speed: 35,
        icon: `${ASSET_BASE_URL}units/1/2.png`,
        walkImage: `${ASSET_BASE_URL}units/1/2.png`,
        attackImage: `${ASSET_BASE_URL}units/1/2.png`,
        width: 50,
        height: 50,
      },
    ],
    upgrades: [
      { name: "Sharpened Sticks", description: "+5 Dmg for Clubman", cost: 100, unitName: "Clubman", stat: "damage", value: 5 },
      { name: "Tougher Hide", description: "+20 HP for Clubman", cost: 150, unitName: "Clubman", stat: "health", value: 20 },
      { name: "Bigger Rocks", description: "+5 Dmg for Slingshot", cost: 125, unitName: "Slingshot", stat: "damage", value: 5 },
    ]
  },
  {
    name: "Bronze Age",
    xpToEvolve: 1000,
    background: `${ASSET_BASE_URL}backgrounds/2.png`,
    baseImage: `${ASSET_BASE_URL}bases/2/base.png`,
    units: [
      {
        name: "Swordsman",
        cost: 100,
        health: 150,
        damage: 25,
        range: 5,
        attackSpeed: 1.2,
        speed: 30,
        icon: `${ASSET_BASE_URL}units/2/1.png`,
        walkImage: `${ASSET_BASE_URL}units/2/1.png`,
        attackImage: `${ASSET_BASE_URL}units/2/1.png`,
        width: 50,
        height: 50,
      },
      {
        name: "Archer",
        cost: 150,
        health: 100,
        damage: 20,
        range: 200,
        attackSpeed: 1,
        speed: 35,
        icon: `${ASSET_BASE_URL}units/2/2.png`,
        walkImage: `${ASSET_BASE_URL}units/2/2.png`,
        attackImage: `${ASSET_BASE_URL}units/2/2.png`,
        width: 50,
        height: 50,
      },
    ],
    upgrades: [
        { name: "Bronze Swords", description: "+10 Dmg for Swordsman", cost: 250, unitName: "Swordsman", stat: "damage", value: 10 },
        { name: "Chainmail", description: "+50 HP for Swordsman", cost: 300, unitName: "Swordsman", stat: "health", value: 50 },
        { name: "Composite Bows", description: "+25 Range for Archer", cost: 200, unitName: "Archer", stat: "range", value: 25 },
    ]
  },
  {
    name: "Future Age",
    xpToEvolve: Infinity,
    background: `${ASSET_BASE_URL}backgrounds/5.png`,
    baseImage: `${ASSET_BASE_URL}bases/5/base.png`,
    units: [
      {
        name: "Cyborg",
        cost: 500,
        health: 400,
        damage: 75,
        range: 10,
        attackSpeed: 1.5,
        speed: 40,
        icon: `${ASSET_BASE_URL}units/5/1.png`,
        walkImage: `${ASSET_BASE_URL}units/5/1.png`,
        attackImage: `${ASSET_BASE_URL}units/5/1.png`,
        width: 60,
        height: 60,
      },
      {
        name: "Laser Trooper",
        cost: 800,
        health: 250,
        damage: 60,
        range: 250,
        attackSpeed: 1.2,
        speed: 45,
        icon: `${ASSET_BASE_URL}units/5/2.png`,
        walkImage: `${ASSET_BASE_URL}units/5/2.png`,
        attackImage: `${ASSET_BASE_URL}units/5/2.png`,
        width: 60,
        height: 60,
      },
    ],
    upgrades: [
        { name: "Plasma Blade", description: "+25 Dmg for Cyborg", cost: 800, unitName: "Cyborg", stat: "damage", value: 25 },
        { name: "Titanium Armor", description: "+100 HP for Cyborg", cost: 1000, unitName: "Cyborg", stat: "health", value: 100 },
        { name: "Long-Range Scope", description: "+50 Range for Laser Trooper", cost: 750, unitName: "Laser Trooper", stat: "range", value: 50 },
    ]
  },
];