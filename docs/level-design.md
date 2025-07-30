# Level Design Document

## Description
Individual level layouts, progression, and mechanics

## Content
---
# Level Design Document  
**Starlight Rogues: A Multi-Level Space Shooter Roguelike**  
**Version:** 1.0  
**Date:** 2024-06-11  
**Document Owner:** Snib AI Game Platform Game Design Team

---

## 1. Introduction

This document provides a detailed design for levels, stages, and waves in **Starlight Rogues**. It specifies layouts, progression, pacing, difficulty curves, environmental storytelling, and player guidance, with an emphasis on browser performance and responsive gameplay. All mechanics referenced herein (shoot, run, collect, powerup, enemy, enemies, score, health, upgrade) are consistent with the existing Game Design Document.

---

## 2. Level Structure Overview

### 2.1 Macro Structure

- **Levels:** 10 (e.g., Nebula Outpost, Asteroid Belt, Pirate Gauntlet, etc.)
- **Stages per Level:** 10
- **Waves per Stage:** 10 (each 30–60 seconds)
- **Boss:** End of each level

### 2.2 Layout Principles

- **Playfield:**  
    - Scrolls vertically (upwards), giving a sense of forward momentum ("run").
    - Player ship fixed to lower third of screen; movement area limited to avoid UI overlap.
- **UI Elements:**  
    - Health and shield bars (top-left), score (top-right), currency (bottom-right).
    - Powerup slots and upgrade indicators (bottom-left for desktop, floating buttons for mobile).
    - Touch controls: Large, semi-transparent regions for mobile firing/missile input.

- **Responsive Scaling:**  
    - Minimum: 320x480 (portrait), 480x320 (landscape)
    - Maximum: 1920x1080; assets scale proportionally, UI elements anchor to screen edges.
    - UI auto-arranges for orientation and aspect ratio.

---

## 3. Level Progression & Pacing

### 3.1 Difficulty Curve

- **Level 1**: Introductory—slow enemies, sparse waves, generous powerups.
- **Levels 2–4**: Introduce new enemy types and basic patterns; moderate density.
- **Levels 5–7**: Increased enemy speed, more complex bullet patterns, reduced powerup frequency.
- **Levels 8–10**: Bullet hell elements, multi-phase bosses, rare powerups, high enemy density.

**Pacing Example (Level 3, Stage 4):**  
- Early waves: 3–4 weak enemies at a time, simple straight-line attacks.
- Mid-waves: 5–7 mixed enemies; zig-zag and swooping patterns, first mini-boss.
- Late waves: 8–10 enemies, bullets with spread patterns, first appearance of shielded enemies.

### 3.2 Environmental Storytelling

- **Backgrounds:**  
    - Change per level to reflect narrative progression (e.g., asteroid fields, derelict stations).
    - Subtle parallax scrolling; light environmental hazards (asteroids, debris) introduced from Level 3 onward.
- **Visual Cues:**  
    - Destroyed enemy ships leave debris for a few seconds.
    - Boss arrival triggers screen shake, unique music, and warning overlay.

- **Narrative Moments:**  
    - Brief, non-intrusive text popups before boss fights or new enemy introductions.
    - Store screens provide flavor text and hints about enemies/upgrades.

---

## 4. Stage & Wave Design

### 4.1 Stage Flow

1. **Wave Spawn:**  
    - Enemies appear in formations; player must shoot and maneuver (“run”) to survive and “collect” drops.
    - Powerups and currency drop from specific enemies.
2. **Wave Clear:**  
    - 2–3 second lull; screen clears, floating currency/powerups auto-collect.
3. **Stage End:**  
    - Summary screen: score, currency, stats (“score”, “collect”).
    - Store appears for upgrades (“upgrade”, “powerup”).
4. **Next Stage:**  
    - Background subtly changes; new enemy types may appear.

### 4.2 Wave Example Layouts

**Wave 1 (Level 1, Stage 1):**  
- 5 enemies spawn at top in simple V-formation, move straight down.
- 1–2 drop currency, 1 has a high chance to drop Health Repair.

**Wave 5 (Level 2, Stage 4):**  
- 3 fast fighters zig-zag, 2 drones circle sides, 1 bomber slowly drops mines.
- Currency in small amounts, possible Temporary Weapon Enhancement drop.

**Wave 10 (Level 5, Stage 10 — Boss):**  
- Boss ship enters center, telegraphs attacks (flashing lights, charging animation).
- Spawns minions every 10 seconds.
- Drops large currency pile and guaranteed powerup on defeat.

---

## 5. Interactive Elements & Player Guidance

### 5.1 Powerups & Collectibles

- **Powerups:**  
    - Float and bounce slightly to attract attention.
    - Distinct color and icon per type.
    - Collected by overlap; uncollected powerups fade out after 5 seconds.
- **Currency:**  
    - Gold orbs/coins, auto-collected when near.
    - Value increases with level progression.

### 5.2 Guidance & Feedback

- **First-Time User Experience (FTUE):**  
    - Level 1, Stage 1: Slow intro, on-screen arrows/highlights for controls.
    - First powerup and currency drop are guaranteed and highlighted.
    - Pop-up tips for new mechanics (e.g., “Tap to collect powerup!”).
- **Enemy Indicators:**  
    - Warning arrows for off-screen enemies or projectiles.
    - Visual/sound cues for incoming bosses or dangerous attacks.
- **Progress Tracking:**  
    - Wave and stage counters visible during play.
    - Brief “Stage Complete!” and “Level Boss Approaching!” overlays.

---

## 6. Asset & Performance Considerations

- **Asset Streaming:**  
    - Backgrounds and boss sprites load per level; common enemies reused across stages.
    - Powerup and currency icons are vector or low-res bitmap for fast loading.
- **Memory/Performance:**  
    - Max 10 unique enemy types per level; shared animations where possible.
    - Particle effects capped; minimal on low-end devices.
    - Sound/music preloaded, but background tracks swap per level.

---

## 7. Example Level Breakdown

### Level 4: Pirate Gauntlet

- **Background:** Wrecked pirate ships, nebula clouds, drifting loot crates.
- **Enemy Mix:** Fast fighters, heavy bombers, shield drones.
- **Unique Mechanic:** Environmental hazards—explosive barrels drift through playfield.
- **Boss:** Pirate galleon ship, launches boarding drones.

**Stage 7, Wave 3 Example:**  
- 2 shield drones (flank sides)  
- 3 fighters (center, zig-zag)  
- 2 explosive barrels drift in from left/right  
- 1 powerup (Shield Recharge) drops mid-wave

**Boss Wave:**  
- Galleon enters with fanfare.
- Periodically launches waves of drones.
- Defeated drones drop currency and powerups.

---

## 8. Browser Optimization & Responsive Considerations

- **Fast Loading:**  
    - Initial load: Main menu, Level 1 assets only.
    - Preload next level during store screens.
- **Input Flexibility:**  
    - All interactive elements (store buttons, upgrade icons, powerups) are large, touch-friendly.
    - Mouse hover states for desktop; large tap zones on mobile.
- **Fallbacks:**  
    - If device performance is low, reduce background layers, particle effects, and animation frame rates.

---

## 9. Implementation Checklist

- [ ] Procedural wave generation system (enemy mix, spawn patterns per stage/level).
- [ ] Level-specific background switching and parallax.
- [ ] Powerup and currency spawn logic, collection, and UI feedback.
- [ ] Store modal with responsive layout and upgrade system integration.
- [ ] Boss encounter scripts: telegraphing, multi-phase behavior.
- [ ] FTUE and contextual player guidance overlays.
- [ ] Performance benchmarking on mobile/desktop browsers.

---

## 10. Consistency & Conflict Check

- **Mechanics:**  
    - All referenced mechanics (shoot, run, collect, powerup, enemy, enemies, score, health, upgrade) are integrated via wave combat, movement, upgrades, and store progression.
- **Characters:**  
    - Player ship and AI wingmen only; no conflict with zero character definition.
- **Conflicts:**  
    - None identified; this document is consistent with the Game Design Document.

---

## 11. Appendix: Sample Stage Layout (Pseudo-Grid)

```
+---------------------------------------------------+
|   E   E   E       (Enemy V-formation, Wave 1)     |
|                                                   |
|                   P         (Powerup Icon)        |
|        C       C         (Currency Orbs)          |
|                                                   |
|      Player Ship  (bottom center)                 |
+---------------------------------------------------+
```
- "E": Enemy spawn points
- "P": Powerup spawn location
- "C": Currency drops

---

**End of Level Design Document**


---
*Generated on 7/30/2025*
