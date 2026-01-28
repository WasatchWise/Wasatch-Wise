# 🎮 GUARDIANS GO — GAMEPLAY JSON SPECS

**Status:** Roblox Game Development  
**Last Updated:** 2025-01-XX  
**Related:** `MT_OLYMPIANS_STORY_BIBLE_v2.md`

---

> **Full JSON gameplay specifications for the Mt. Olympians Roblox game.**

```json
{
  "meta": {
    "game": "Guardians Go",
    "universe": "Mt. Olympians",
    "version": "2025-10-30",
    "rules": [
      "Guardians draw power from stewardship and consent_of_place",
      "If consent_of_place < 0.3, ultimates are locked",
      "Lake Bonne-Villains are global antagonists tied to real Utah crises"
    ]
  },
  "schema_note": {
    "id": "stable string id used in datastore keys",
    "codename": "shouted short name used in UI chips",
    "display_name": "full character name for dialogue and cards",
    "county": "Utah county they protect",
    "species_myth_type": "what they are in-lore",
    "role": "combat role, light narrative tag",
    "alliances": "factions or circles they belong to",
    "element": "primary element for damage or buffs",
    "motto": "short flavor line",
    "archetype": "story archetype tags",
    "personality": "short list for VO tuning",
    "conflicts": "two or three grounded tensions",
    "stats": {
      "class": "Tank, DPS, Support, Controller, Scout, Hybrid",
      "rarity": "Common, Rare, Epic, Legendary, Mythic",
      "power": "1 to 100 base damage scale",
      "defense": "1 to 100 mitigation scale",
      "speed": "1 to 100 move and attack cadence",
      "mastery": "1 to 100 ability potency and utility"
    },
    "abilities": [
      {
        "name": "short action name",
        "type": "active or passive",
        "cooldown": "seconds",
        "duration": "seconds if applicable",
        "range": "studs if applicable",
        "effect": "concise gameplay description",
        "scales_with": "power or mastery",
        "stewardship_gate": "min value 0.0 to 1.0 or null"
      }
    ],
    "ultimate": {
      "name": "signature ability",
      "cooldown": "seconds",
      "effect": "concise gameplay description",
      "stewardship_gate": "min value needed for cast"
    }
  },
  "guardians": [
    {
      "id": "guardian_quincy",
      "codename": "QUINCY",
      "display_name": "Quincy the Quicksilver",
      "county": "Beaver",
      "species_myth_type": "Trickster Alchemist",
      "role": "Trickster-Artisan",
      "alliances": ["Team Basin"],
      "element": "Metal",
      "motto": "Every stick holds a secret purpose",
      "archetype": ["Trickster", "Artisan"],
      "personality": ["Playful", "Clever"],
      "conflicts": ["Old mining legacy vs new opportunities"],
      "stats": { "class": "Support", "rarity": "Epic", "power": 78, "defense": 62, "speed": 74, "mastery": 86 },
      "abilities": [
        { "name": "Transmute Snap", "type": "active", "cooldown": 12, "duration": 0, "range": 10, "effect": "Converts hazards to safe platforms for 6s", "scales_with": "mastery", "stewardship_gate": 0.2 },
        { "name": "Quickbrew Tonic", "type": "active", "cooldown": 18, "duration": 8, "range": 25, "effect": "Allies gain +15% speed and +10% shield", "scales_with": "power", "stewardship_gate": 0.0 },
        { "name": "Cost of Change", "type": "passive", "cooldown": 0, "duration": 0, "range": 0, "effect": "If consent_of_place < 0.3, ability potency is halved", "scales_with": "mastery", "stewardship_gate": null }
      ],
      "ultimate": { "name": "Refinery of Renewal", "cooldown": 60, "effect": "Large circle cleanse and terrain transmutation for 10s", "stewardship_gate": 0.5 }
    },
    {
      "id": "guardian_cass",
      "codename": "CASS",
      "display_name": "Cass the Gearwright",
      "county": "Box Elder",
      "species_myth_type": "Kit Fox Inventor",
      "role": "Maker-Mentor",
      "alliances": ["Time & Memory"],
      "element": "Tech",
      "motto": "A solution is a gear-turn away",
      "archetype": ["Mentor", "Maker"],
      "personality": ["Inventive", "Resourceful"],
      "conflicts": ["Railroad heritage vs modern automation"],
      "stats": { "class": "Controller", "rarity": "Rare", "power": 72, "defense": 58, "speed": 80, "mastery": 88 },
      "abilities": [
        { "name": "Wind-up Sentry", "type": "active", "cooldown": 16, "duration": 12, "range": 30, "effect": "Deploys turret that slows targets by 25%", "scales_with": "mastery", "stewardship_gate": 0.2 },
        { "name": "Pocket Toolkit", "type": "active", "cooldown": 14, "duration": 6, "range": 12, "effect": "Repairs ally shields and removes 1 debuff", "scales_with": "power", "stewardship_gate": 0.0 },
        { "name": "Depot Secrets", "type": "passive", "cooldown": 0, "duration": 0, "range": 0, "effect": "Gain +10% resource drops near rail assets", "scales_with": "mastery", "stewardship_gate": null }
      ],
      "ultimate": { "name": "Clockwork Chorus", "cooldown": 70, "effect": "Summon three mobile bots that herd foes into a slow field", "stewardship_gate": 0.4 }
    },
    {
      "id": "guardian_elsa",
      "codename": "ELSA",
      "display_name": "Elsa of the Orchard Vale",
      "county": "Cache",
      "species_myth_type": "Honeybee Orchard Spirit",
      "role": "Mother-Nurturer",
      "alliances": ["Time & Memory"],
      "element": "Life",
      "motto": "Winter wisdom holds",
      "archetype": ["Mother", "Nurturer"],
      "personality": ["Warm", "Protective"],
      "conflicts": ["Agricultural tradition vs university growth"],
      "stats": { "class": "Support", "rarity": "Epic", "power": 70, "defense": 66, "speed": 68, "mastery": 90 },
      "abilities": [
        { "name": "Bloom Chorus", "type": "active", "cooldown": 15, "duration": 8, "range": 20, "effect": "Heal over time and +10% regen to allies", "scales_with": "mastery", "stewardship_gate": 0.1 },
        { "name": "Pollinator Belt", "type": "active", "cooldown": 22, "duration": 10, "range": 28, "effect": "Creates path that speeds allies and confuses pests", "scales_with": "power", "stewardship_gate": 0.2 },
        { "name": "Keeper of Seeds", "type": "passive", "cooldown": 0, "duration": 0, "range": 0, "effect": "Downed allies revive with a small shield once per match", "scales_with": "mastery", "stewardship_gate": null }
      ],
      "ultimate": { "name": "Orchard in Bloom", "cooldown": 75, "effect": "Large heal burst, cleanse, and bee swarm that pushes enemies back", "stewardship_gate": 0.5 }
    },
    {
      "id": "guardian_bruno",
      "codename": "BRUNO",
      "display_name": "Bruno the Blacklung",
      "county": "Carbon",
      "species_myth_type": "Big-eared Bat Miner",
      "role": "Father-Protector",
      "alliances": ["Time & Memory", "Heritage Keepers"],
      "element": "Shadow",
      "motto": "Embers remember",
      "archetype": ["Protector", "Guide"],
      "personality": ["Stoic", "Watchful"],
      "conflicts": ["Coal heritage vs renewable future"],
      "stats": { "class": "Tank", "rarity": "Rare", "power": 76, "defense": 88, "speed": 55, "mastery": 72 },
      "abilities": [
        { "name": "Echo Lantern", "type": "active", "cooldown": 14, "duration": 6, "range": 18, "effect": "Reveals hidden hazards and marks enemies through walls", "scales_with": "mastery", "stewardship_gate": 0.2 },
        { "name": "Timbering Stance", "type": "active", "cooldown": 18, "duration": 6, "range": 6, "effect": "+30% damage reduction and taunt nearby foes", "scales_with": "defense", "stewardship_gate": 0.0 },
        { "name": "Haunt of the Drift", "type": "passive", "cooldown": 0, "duration": 0, "range": 0, "effect": "Gain damage reduction in tunnels and at night", "scales_with": "defense", "stewardship_gate": null }
      ],
      "ultimate": { "name": "Night-Rail Rescue", "cooldown": 80, "effect": "Pull allies from danger and grant heavy shields", "stewardship_gate": 0.5 }
    }
  ]
}
```

---

**Note:** This is an abbreviated sample. The full JSON includes all 29 guardians with complete ability sets. See the original production bible for the complete spec.

**Implementation Notes:**
- JSON is designed for Roblox DataStore2 or similar persistent storage
- Stewardship system ties abilities to environmental health metrics
- Ultimates locked when consent_of_place drops below threshold
- Lake Bonne-Villains serve as replayable boss encounters
- Alliance bonuses enable team composition strategies

