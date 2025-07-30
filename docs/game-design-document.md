# Game Design Document

## Description
Overall game vision, mechanics, and core design decisions

## Content
game_design_document

Title:  
**Starlight Rogues: A Multi-Level Space Shooter Roguelike**

Version:  
1.0

Date:  
2024-06-11

Document Owner:  
Snib AI Game Platform Game Design Team

---

## 1. Game Vision

**Overview:**  
Starlight Rogues is a fast-paced, browser-based roguelike space shooter. Players pilot a customizable starfighter through 10 levels, each containing 10 stages, with every stage featuring 10 waves of increasingly challenging enemy ships. The game’s core loop revolves around skill-based combat, strategic powerup usage, and persistent progression through upgrades purchased with currency dropped by defeated enemies. Between stages, players can visit a store to enhance their ship with new weapons, shields, homing missiles, and recruit AI wingmen.

**Target Audience:**  
- Casual and core gamers seeking quick, engaging web-based action.
- Fans of roguelike progression and arcade shooters.
- Desktop and mobile (touch) users.

**Key Differentiators:**  
- Deep roguelike progression with meaningful choices after every stage.
- Large, multi-level structure with escalating challenge and variety.
- Strategic store system between stages.
- Responsive design for seamless play on both desktop and mobile browsers.
- Instant, no-install playability.

---

## 2. Core Gameplay Mechanics

### 2.1 Controls

**Desktop:**  
- Mouse: Move ship (pointer follows or click/drag).
- Left Click: Fire primary weapon.
- Right Click / Keyboard: Activate secondary (missiles, powerups).

**Mobile:**  
- Touch/drag: Move ship.
- Tap: Fire primary weapon.
- Double-tap/two-finger tap: Activate secondary.

**Accessibility:**  
- Large input areas for touch.
- Visual cues for controls.
- Auto-fire option toggle for accessibility.

### 2.2 Player Experience

- Immediate action: The game starts with the player in control and enemies spawning.
- Short, intense waves (30–60 seconds each).
- Visible, enticing powerups and currency drops.
- Clear feedback: explosions, hit flashes, sound cues.
- End-of-stage summary: stats, rewards, access to the store.

### 2.3 Game Structure

- **10 Levels**  
    - Each with unique backgrounds, enemy types, and boss at the end.
- **Each Level: 10 Stages**  
    - Each stage is a set, with increasing difficulty.
- **Each Stage: 10 Waves**  
    - Each wave lasts 30–60 seconds, with a brief rest between.

**Progression Example:**  
Level 3 → Stage 4 → Wave 6

### 2.4 Enemies

- Varied enemy ships per level (e.g., fighters, bombers, drones, mini-bosses).
- Enemy behaviors: direct attack, swooping, zig-zag, kamikaze.
- Increasing complexity and bullet patterns as levels progress.
- Boss at the end of each level.

### 2.5 Powerups

- **Health Repair**
- **Shield Recharge**
- **Temporary Weapon Enhancements** (spread shot, rapid fire)
- **Temporary Invulnerability**
- **Currency Multiplier**

**Acquisition:**  
- Dropped by random enemies, with a visible icon.
- Collected by flying over with the player ship.

### 2.6 Currency & Upgrades

- **Currency:**  
    - Dropped by enemies (visible floating orbs/coins).
    - Auto-collected when near.

- **Store (end of every stage):**  
    - **Better Guns:** Spread, laser, plasma, etc.
    - **Shields:** Upgrade max shield or regen rate.
    - **Homing Missiles:** Add/upgrade missile slot, improve tracking/damage.
    - **Wingmen:** Recruit AI ships to fight alongside the player.
    - **Other:** Temporary buffs, extra lives, or one-time-use items.

- **Upgrade System:**  
    - Persistent for the current playthrough (roguelike).
    - Choices matter—resources are limited, so players must prioritize.

### 2.7 Roguelike Elements

- Permadeath: Run ends if the player loses all health.
- Randomized enemy spawn patterns and powerup drops.
- Procedural stage backgrounds and enemy formations.
- Meta-progression (optional/future): Cosmetic unlocks or starting equipment.

---

## 3. Game Loops

### 3.1 Core Loop

1. Play wave → Defeat enemies → Collect currency/powerups.
2. After 10 waves, stage ends.
3. Enter store → Spend currency on upgrades.
4. Continue to next stage.
5. After 10 stages, level ends (boss stage).
6. Repeat for all 10 levels.
7. Game ends at final boss or on player death.

### 3.2 Meta Loop

- High score leaderboard (local and/or online).
- Track furthest level/stage reached.
- Optional: Cosmetic unlocks based on progress.

---

## 4. Systems & Implementation Details

### 4.1 Enemy Spawning

- Spawner system generates enemy waves based on level/stage.
- Each wave: enemy types, positions, movement/bullet patterns.
- Procedural variation for replayability.
- Boss logic for level-ending stages.

### 4.2 Powerup & Currency Drops

- Enemies have weighted chance to drop powerups or currency.
- Powerups expire after a set time if not collected.
- Currency auto-collects within a radius to reduce frustration.

### 4.3 Store System

- UI: Responsive modal/panel after each stage.
- Displays current currency, available upgrades, and purchase options.
- Upgrades persist until end of run.
- Store content scales with progression (more powerful upgrades at higher levels).

### 4.4 Upgrade System

- Modular upgrades: can stack or replace previous versions.
- Visual feedback: ship changes appearance with upgrades (guns, wingmen).
- Tooltips explain benefits.

### 4.5 Responsive Design

- Layout adapts to mobile and desktop.
- Controls adjust for input method.
- Touch-friendly UI components.
- Performance optimization: minimal particle effects on low-end devices, scalable graphics.

---

## 5. Art & Audio Direction

- Vibrant, readable 2D sprites.
- Sci-fi backgrounds for each level.
- Distinctive enemy and player ship silhouettes.
- Flashy, satisfying explosions and weapon effects.
- Sound: energetic chiptune/synth soundtrack, impactful SFX for weapons, hits, pickups.

---

## 6. Success Metrics

- **Engagement:** Average session length, stages completed per session.
- **Retention:** Number of returning players.
- **Fun:** Positive player feedback, measured via surveys or ratings.
- **Performance:** Smooth gameplay (60 FPS) on modern browsers (desktop/mobile).
- **Accessibility:** Readable UI, intuitive controls, low barrier to entry.

---

## 7. Considerations & Constraints

- **Instant Play:** Minimal load times, no downloads.
- **Performance:** Optimize for WebGL/canvas; consider fallback for lower-end devices.
- **Input:** Design for mouse/touch parity.
- **No existing project content:** No character or mechanic dependencies—this document is a fresh baseline.
- **Potential conflicts:** None, as there are no pre-existing mechanics or characters.

---

## 8. Example User Story

1. Player launches game in Chrome on mobile.
2. Quick tutorial explains drag-to-move, tap-to-fire.
3. First wave spawns; player destroys enemies, collects floating coins.
4. After 10th wave, stage ends; store appears.
5. Player spends coins on a shield upgrade and a wingman.
6. New stage begins, now with a visible AI ally and improved defense.
7. Gets further each run, experimenting with different upgrade paths.

---

## 9. Next Steps for Implementation

1. Establish base game framework (HTML5/JavaScript, responsive canvas).
2. Implement player controls and basic enemy logic.
3. Build wave/stage/level progression system.
4. Develop store and upgrade system.
5. Integrate powerup and drop logic.
6. Add responsive UI/UX for store and gameplay.
7. Playtest for pacing, balance, and performance.

---

**End of Document**


---
*Generated on 7/30/2025*
