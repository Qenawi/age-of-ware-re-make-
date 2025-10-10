import type { Age } from './types';
import { getAssetPath } from './utils';

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
  // Minimum distance from base edge for unit spawn (prevents instant attack)
  UNIT_SPAWN_SAFE_OFFSET: 160,
  // Build times (ms) for each unit type
  UNIT_BUILD_TIMES: {
    Clubman: 2000,
    Slingshot: 2500,
    Swordsman: 2200,
    Archer: 2600,
    Cyborg: 3000,
    'Laser Trooper': 3200,
  },
  FPS: 60,
  AI_SPAWN_RATE_MS: 5000, // AI tries to spawn a unit every 5 seconds
  XP_PER_KILL: 25,
  GOLD_PER_KILL: 20,
  // Vertical distance (px) from bottom of game area to the ground line where unit feet sit
  PLAYFIELD_GROUND_OFFSET: 110,
};

export const AGES: Age[] = [
  {
    name: "Stone Age",
    xpToEvolve: 400,
    background: getAssetPath('/assets/backgrounds/stone-age-battlefield.png'),
    baseImage: getAssetPath('/assets/bases/stone-age-base.png'),
    units: [
      {
        name: "Clubman",
        cost: 50,
        health: 100,
        damage: 15,
        range: 5, // melee
        attackSpeed: 1,
        speed: 30,
        icon: getAssetPath(`/assets/units/stone/clubman-walk.svg`),
        // walkImage / attackImage kept as fallback; overridden at runtime by frame loader in Unit component
        walkImage: getAssetPath(`/assets/units/stone/clubman-walk.svg`),
        attackImage: getAssetPath(`/assets/units/stone/clubman-attack.svg`),
        width: 70,
        height: 70,
      },
      {
        name: "Slingshot",
        cost: 75,
        health: 70,
        damage: 10,
        range: 150,
        attackSpeed: 0.8,
        speed: 35,
        icon: getAssetPath(`/assets/units/stone/slingshot-walk.svg`),
        walkImage: getAssetPath(`/assets/units/stone/slingshot-walk.svg`),
        attackImage: getAssetPath(`/assets/units/stone/slingshot-attack.svg`),
        width: 70,
        height: 70,
      },
    ],
    upgrades: [
      { name: "Sharpened Sticks", description: "+5 Dmg for Clubman", cost: 100, unitName: "Clubman", stat: "damage", value: 5 },
      { name: "Tougher Hide", description: "+20 HP for Clubman", cost: 150, unitName: "Clubman", stat: "health", value: 20 },
      { name: "Bigger Rocks", description: "+5 Dmg for Slingshot", cost: 125, unitName: "Slingshot", stat: "damage", value: 5 },
    ],
    towers: [
      {
        name: "Stone Tower",
        cost: 100,
        damage: 5,
        range: 250,
        attackSpeed: 1,
        sellValue: 50,
        image: getAssetPath("/assets/towers/stone-tower.png")
      },
      {
        name: "Catapult",
        cost: 200,
        damage: 12,
        range: 350,
        attackSpeed: 0.5,
        sellValue: 100,
        image: getAssetPath("/assets/towers/catapult.png"),
        upgradeFrom: "Stone Tower"
      }
    ]
  },
  {
    name: "Bronze Age",
    xpToEvolve: 1000,
    background: getAssetPath(`/assets/backgrounds/bronze-age-battlefield.png`),
    baseImage: getAssetPath(`/assets/bases/bronze-age-base.png`),
    units: [
      {
        name: "Swordsman",
        cost: 100,
        health: 150,
        damage: 25,
        range: 5,
        attackSpeed: 1.2,
        speed: 30,
        icon: getAssetPath(`/assets/units/bronze/swordsman-walk.svg`),
        walkImage: getAssetPath(`/assets/units/bronze/swordsman-walk.svg`),
        attackImage: getAssetPath(`/assets/units/bronze/swordsman-attack.svg`),
        width: 72,
        height: 72,
      },
      {
        name: "Archer",
        cost: 150,
        health: 100,
        damage: 20,
        range: 200,
        attackSpeed: 1,
        speed: 35,
        icon: getAssetPath(`/assets/units/bronze/archer-walk.svg`),
        walkImage: getAssetPath(`/assets/units/bronze/archer-walk.svg`),
        attackImage: getAssetPath(`/assets/units/bronze/archer-attack.svg`),
        width: 70,
        height: 70,
      },
    ],
    upgrades: [
        { name: "Bronze Swords", description: "+10 Dmg for Swordsman", cost: 250, unitName: "Swordsman", stat: "damage", value: 10 },
        { name: "Chainmail", description: "+50 HP for Swordsman", cost: 300, unitName: "Swordsman", stat: "health", value: 50 },
        { name: "Composite Bows", description: "+25 Range for Archer", cost: 200, unitName: "Archer", stat: "range", value: 25 },
    ],
    towers: [
      {
        name: "Ballista",
        cost: 300,
        damage: 20,
        range: 450,
        attackSpeed: 0.8,
        sellValue: 150,
        image: getAssetPath("/assets/towers/ballista.png"),
        upgradeFrom: "Catapult"
      },
      {
        name: "Guard Tower",
        cost: 400,
        damage: 15,
        range: 400,
        attackSpeed: 1.5,
        sellValue: 200,
        image: getAssetPath("/assets/towers/guard-tower.png")
      }
    ]
  },
  {
    name: "Future Age",
    xpToEvolve: Infinity,
    background: getAssetPath(`/assets/backgrounds/future-age-battlefield.png`),
    baseImage: getAssetPath(`/assets/bases/future-age-base.png`),
    units: [
      {
        name: "Cyborg",
        cost: 500,
        health: 400,
        damage: 75,
        range: 10,
        attackSpeed: 1.5,
        speed: 40,
        icon: getAssetPath(`/assets/units/future/cyborg-walk.svg`),
        walkImage: getAssetPath(`/assets/units/future/cyborg-walk.svg`),
        attackImage: getAssetPath(`/assets/units/future/cyborg-attack.svg`),
        width: 76,
        height: 76,
      },
      {
        name: "Laser Trooper",
        cost: 800,
        health: 250,
        damage: 60,
        range: 250,
        attackSpeed: 1.2,
        speed: 45,
        icon: getAssetPath(`/assets/units/future/laser-walk.svg`),
        walkImage: getAssetPath(`/assets/units/future/laser-walk.svg`),
        attackImage: getAssetPath(`/assets/units/future/laser-attack.svg`),
        width: 74,
        height: 74,
      },
    ],
    upgrades: [
        { name: "Plasma Blade", description: "+25 Dmg for Cyborg", cost: 800, unitName: "Cyborg", stat: "damage", value: 25 },
        { name: "Titanium Armor", description: "+100 HP for Cyborg", cost: 1000, unitName: "Cyborg", stat: "health", value: 100 },
        { name: "Long-Range Scope", description: "+50 Range for Laser Trooper", cost: 750, unitName: "Laser Trooper", stat: "range", value: 50 },
    ],
    towers: [
      {
        name: "Laser Turret",
        cost: 800,
        damage: 40,
        range: 500,
        attackSpeed: 2,
        sellValue: 400,
        image: getAssetPath("/assets/towers/laser-turret.png"),
        upgradeFrom: "Ballista"
      },
      {
        name: "Plasma Cannon",
        cost: 1000,
        damage: 60,
        range: 480,
        attackSpeed: 1,
        sellValue: 500,
        image: getAssetPath("/assets/towers/plasma-cannon.png"),
        upgradeFrom: "Guard Tower"
      }
    ]
  },
];